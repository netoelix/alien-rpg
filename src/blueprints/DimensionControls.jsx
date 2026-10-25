export function DimensionControls({ mode = 'direct', offset = 0, onChange }) {
  return (
    <div>
      <label>
        Medida
        <select value={mode} onChange={(e) => onChange('mode', e.target.value)}>
          <option value="direct">Distância direta</option>
          <option value="horizontal">Largura horizontal</option>
          <option value="vertical">Altura vertical</option>
        </select>
      </label>
      <label>
        Afastamento (m)
        <input
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
