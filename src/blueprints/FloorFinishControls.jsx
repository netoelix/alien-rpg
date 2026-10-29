import { HelpHint } from './HelpHint.jsx';
import { NumberField } from './NumberField.jsx';
import { VisualChoices } from './VisualChoices.jsx';
import { floorFinishes } from './floor-finishes.js';
export function FloorFinishControls({ value, onChange }) {
  const current = value || { type: 'plain', size: 1, opacity: 0.2 };
  const water = ['pool', 'lake'].includes(current.type);
  return (
    <fieldset className="blueprint-floor-options">
      <legend>{water ? 'Detalhes da água' : 'Acabamento do piso'}</legend>
      {!water && (
        <VisualChoices
          label="Padrão"
          kind="floor"
          value={current.type}
          onChange={(type) => onChange({ ...current, type })}
          options={Object.entries(floorFinishes).filter(
            ([key]) => !['pool', 'lake', 'service'].includes(key),
          )}
        />
      )}
      {current.type !== 'plain' && (
        <>
          <label>
            {['pool', 'lake'].includes(current.type) ? 'Detalhes da margem (m)' : 'Módulo (m)'}
            <NumberField
              type="number"
              min=".25"
              max="10"
              step=".25"
              value={current.size}
              onChange={(e) => onChange({ ...current, size: Number(e.target.value) })}
            />
          </label>
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
              : 'A escala do padrão é em metros; acompanha o tamanho do ambiente sem esticar as placas.'}
          </HelpHint>
        </>
      )}
    </fieldset>
  );
}
