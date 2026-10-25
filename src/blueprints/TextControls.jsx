export function TextControls({ text, size, align = 'start', bold = false, onChange }) {
  return (
    <div className="blueprint-text-controls">
      <label>
        Texto
        <textarea
          rows={4}
          maxLength={1000}
          value={text}
          onChange={(e) => onChange('text', e.target.value)}
        />
      </label>
      <label>
        Tamanho (m)
        <input
          type="number"
          min=".25"
          max="20"
          step=".25"
          value={size}
          onChange={(e) => {
            const n = e.target.valueAsNumber;
            if (n >= 0.25 && n <= 20) onChange('size', n);
          }}
        />
      </label>
      <label>
        Alinhamento
        <select value={align} onChange={(e) => onChange('align', e.target.value)}>
          <option value="start">Esquerda</option>
          <option value="middle">Centro</option>
          <option value="end">Direita</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={bold}
          onChange={(e) => onChange('bold', e.target.checked)}
        />
        Negrito
      </label>
    </div>
  );
}
