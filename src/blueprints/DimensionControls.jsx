import { NumberField } from './NumberField.jsx';
import { OptionButtons } from './OptionButtons.jsx';
export function DimensionControls({ mode = 'direct', offset = 0, onChange }) {
  return (
    <div>
      <OptionButtons
        label="Medida"
        value={mode}
        onChange={(value) => onChange('mode', value)}
        options={[
          ['direct', '↗ Direta'],
          ['horizontal', '↔ Horizontal'],
          ['vertical', '↕ Vertical'],
        ]}
      />
      <label>
        Afastamento (m)
        <NumberField
          type="number"
          min="-2000"
          max="2000"
          step=".25"
          value={offset}
          onChange={(e) => {
            const n = e.target.valueAsNumber;
            if (Number.isFinite(n) && Math.abs(n) <= 2000) onChange('offset', n);
          }}
        />
      </label>
    </div>
  );
}
