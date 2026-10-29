import { HelpHint } from './HelpHint.jsx';
import { NumberField } from './NumberField.jsx';
import { OptionButtons } from './OptionButtons.jsx';
import { VisualChoices } from './VisualChoices.jsx';
import { circulationTypes, circulationStyle } from './circulation.js';
export function TraceControls({ value, onChange, showType = true, colony = false }) {
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
            ['pipe', 'Tubulação'],
            ['cable', 'Fiação'],
            ['cableTray', 'Eletrocalha'],
            ['rail', 'Trilhos'],
            ...(colony
              ? [
                  ['talus', 'Talude'],
                  ['cliff', 'Penhasco'],
                ]
              : []),
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
      {value.traceType === 'road' && (
        <label>
          Calçadas automáticas (m por lado)
          <NumberField
            min="0"
            max="20"
            step=".25"
            value={value.sidewalkWidth || 0}
            onChange={(e) => onChange('sidewalkWidth', Number(e.target.value))}
          />
        </label>
      )}
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
      {['ledge', 'talus', 'cliff'].includes(value.traceType) && (
        <OptionButtons
          label="Lado baixo"
          value={value.side || 1}
          onChange={(side) => onChange('side', side)}
          options={[
            [1, 'Direita'],
            [-1, 'Esquerda'],
          ]}
        />
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

      <HelpHint label="Como desenhar">
        <p>
          Clique para marcar pontos; Enter conclui e Escape cancela. Após selecionar, ajuste os
          vértices. Caminhos, calçadas e ruas se unem quando se cruzam no mesmo nível. Os traçados
          decorativos ficam em Equipamentos e não criam paredes.
        </p>
      </HelpHint>
    </fieldset>
  );
}
