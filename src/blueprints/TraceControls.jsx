export function TraceControls({ value, onChange }) {
  return (
    <fieldset>
      <legend>Traçado</legend>
      <label>
        Tipo
        <select
          value={value.traceType || 'rail'}
          onChange={(e) => onChange('traceType', e.target.value)}
        >
          <option value="rail">Trilhos</option>
          <option value="ledge">Borda de desnível</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={!!value.rounded}
          onChange={(e) => onChange('rounded', e.target.checked)}
        />
        Arredondar curvas
      </label>
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
      <small>
        Clique para definir pontos; Enter conclui. Edite os vértices após selecionar. Na borda, os
        traços medem metade da largura.
      </small>
    </fieldset>
  );
}
