import { OptionButtons } from './OptionButtons.jsx';
import { VisualChoices } from './VisualChoices.jsx';
import { circulationTypes, circulationStyle } from './circulation.js';
export function TraceControls({ value, onChange, showType = true }) {
  const circulation = Object.hasOwn(circulationTypes, value.traceType || ''),
    style = circulationStyle(value);
  return (
    <fieldset>
      <legend>Traçado</legend>
      {showType && (
        <VisualChoices
          label="Tipo de traçado"
          kind="trace"
          value={value.traceType || 'rail'}
          onChange={(type) => onChange('traceType', type)}
          options={[
            ...Object.entries(circulationTypes),
            ['hazardLine', 'Faixa de segurança'],
            ['walkwayLine', 'Faixa de circulação'],
            ['river', 'Rio'],
            ['rail', 'Trilhos'],
            ['ledge', 'Borda de desnível'],
            ['channel', 'Canaleta com tampas'],
            ['gratedChannel', 'Canaleta gradeada'],
          ]}
        />
      )}
      <label>
        <input
          type="checkbox"
          checked={!!value.rounded}
          onChange={(e) => onChange('rounded', e.target.checked)}
        />
        Arredondar curvas
      </label>
      {circulation && (
        <>
          <OptionButtons
            label="Bordas"
            value={style.edge}
            onChange={(v) => onChange('edge', v)}
            options={[
              ['none', 'Sem borda'],
              ['line', 'Simples'],
              ['curb', 'Meio-fio'],
            ]}
          />
          {value.traceType !== 'road' && (
            <OptionButtons
              label="Acabamento"
              value={style.finish}
              onChange={(v) => onChange('surface', v)}
              options={[
                ['smooth', 'Liso'],
                ['slabs', 'Placas'],
              ]}
            />
          )}
          {value.traceType === 'road' && (
            <label>
              <input
                type="checkbox"
                checked={style.markings}
                onChange={(e) => onChange('markings', e.target.checked)}
              />
              Faixa central tracejada
            </label>
          )}
        </>
      )}
      {value.traceType === 'ledge' && (
        <label>
          Lado baixo
          <select
            value={value.side || 1}
            onChange={(e) => onChange('side', Number(e.target.value))}
          >
            <option value="1">Direita do desenho</option>
            <option value="-1">Esquerda do desenho</option>
          </select>
        </label>
      )}

      {['hazardLine', 'walkwayLine'].includes(value.traceType) && (
        <>
          <OptionButtons
            label="Cor"
            value={value.signageColor || 'amber'}
            onChange={(v) => onChange('signageColor', v)}
            options={[
              ['amber', 'Âmbar'],
              ['green', 'Verde'],
            ]}
          />
        </>
      )}

      <details className="blueprint-inline-help">
        <summary>Como desenhar</summary>
        <p>
          Clique para marcar pontos; Enter conclui e Escape cancela. Após selecionar, ajuste os
          vértices. Caminhos, calçadas e ruas se unem quando se cruzam no mesmo nível. Os traçados
          decorativos ficam em Equipamentos e não criam paredes.
        </p>
      </details>
    </fieldset>
  );
}
