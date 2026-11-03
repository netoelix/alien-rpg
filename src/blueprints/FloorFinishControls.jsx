import { HelpHint } from './HelpHint.jsx';
import { NumberField } from './NumberField.jsx';
import { VisualChoices } from './VisualChoices.jsx';
import { floorFinishes, terrainFinishes } from './floor-finishes.js';
export function FloorFinishControls({ value, onChange, region = false }) {
  const current = value || { type: 'plain', size: 1, opacity: 0.2 };
  const terrain = Object.hasOwn(terrainFinishes, current.type);
  const water = ['pool', 'lake'].includes(current.type);
  return (
    <fieldset className="blueprint-floor-options">
      <legend>
        {terrain ? 'Detalhes do terreno' : water ? 'Detalhes da água' : 'Acabamento do piso'}
      </legend>
      {!terrain && !water && (
        <VisualChoices
          label="Padrão"
          kind="floor"
          value={current.type}
          onChange={(type) => onChange({ ...current, type })}
          options={Object.entries(floorFinishes).filter(
            ([key]) =>
              !Object.hasOwn(terrainFinishes, key) &&
              !['pool', 'lake', 'service'].includes(key) &&
              (region || key !== 'hive'),
          )}
        />
      )}
      {terrain && (
        <label>
          {current.type === 'plateau' ? 'Altura acima do terreno (m)' : 'Profundidade (m)'}
          <NumberField
            type="number"
            min=".01"
            max="10000"
            step="any"
            value={current.height ?? 3}
            onChange={(e) => onChange({ ...current, height: Number(e.target.value) })}
          />
        </label>
      )}
      {!terrain && current.type !== 'plain' && (
        <>
          <label>
            {['pool', 'lake'].includes(current.type)
              ? 'Detalhes da margem (m)'
              : current.type === 'hive'
                ? 'Escala da resina (m)'
                : 'Módulo (m)'}
            <NumberField
              type="number"
              min=".25"
              max="10"
              step=".25"
              value={current.size}
              onChange={(e) => onChange({ ...current, size: Number(e.target.value) })}
            />
          </label>
          {current.type === 'hive' && (
            <label>
              Densidade · {Math.round((current.density ?? 0.55) * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step=".05"
                value={current.density ?? 0.55}
                onChange={(e) => onChange({ ...current, density: Number(e.target.value) })}
              />
            </label>
          )}
          <label>
            Intensidade · {Math.round(current.opacity * 100)}%
            <input
              type="range"
              min="0"
              max=".6"
              step=".05"
              value={current.opacity}
              onChange={(e) => onChange({ ...current, opacity: Number(e.target.value) })}
            />
          </label>
          <HelpHint>
            {['pool', 'lake'].includes(current.type)
              ? 'Detalhes acompanham as margens; o centro permanece livre.'
              : current.type === 'hive'
                ? 'A resina cresce da borda para dentro. A escala ajusta o espaçamento e o alcance das ramificações.'
                : 'A escala do padrão é em metros; acompanha o tamanho do ambiente sem esticar as placas.'}
          </HelpHint>
        </>
      )}
    </fieldset>
  );
}
