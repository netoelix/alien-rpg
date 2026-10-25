import { floorFinishes } from './floor-finishes.js';
export function FloorFinishControls({ value, onChange }) {
  const current = value || { type: 'plain', size: 1, opacity: 0.2 };
  return (
    <details>
      <summary>Acabamento do piso</summary>
      <label>
        Padrão
        <select
          value={current.type}
          onChange={(e) => onChange({ ...current, type: e.target.value })}
        >
          {Object.entries(floorFinishes).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {current.type !== 'plain' && (
        <>
          <label>
            Módulo (m)
            <input
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
          <small>
            A escala do padrão é em metros; acompanha o tamanho do ambiente sem esticar as placas.
          </small>
        </>
      )}
    </details>
  );
}
