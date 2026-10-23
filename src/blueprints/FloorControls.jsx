import { useState } from 'react';
import {
  activeFloor,
  floorList,
  switchFloor,
  addFloor,
  renameFloor,
  removeFloor,
} from './floors.js';

export function FloorControls({ project, disabled, onChange, onError }) {
  const floors = floorList(project);
  const current = floors.find((floor) => floor.id === activeFloor(project));
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  function apply(operation) {
    try {
      onChange(operation(project));
    } catch (error) {
      onError(error.message);
    }
  }
  return (
    <div className="blueprint-floor-controls" role="group" aria-label="Pavimentos">
      <label>
        Pavimento
        <select
          value={current.id}
          disabled={disabled}
          onChange={(event) => {
            setEditing(false);
            apply((value) => switchFloor(value, event.target.value));
          }}
        >
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.name}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={disabled || floors.length >= 20}
        onClick={() => apply((value) => addFloor(value))}
      >
        Novo pavimento
      </button>
      <button
        disabled={disabled || floors.length >= 20}
        onClick={() => apply((value) => addFloor(value, true))}
      >
        Duplicar
      </button>
      <button
        disabled={disabled}
        onClick={() => {
          setName(current.name);
          setEditing(!editing);
        }}
      >
        Renomear
      </button>
      <button
        disabled={disabled || floors.length === 1}
        onClick={() => {
          if (
            window.confirm(
              'Excluir “' +
                current.name +
                '” e todos os seus objetos? Você pode desfazer esta ação.',
            )
          )
            apply(removeFloor);
        }}
      >
        Excluir pavimento
      </button>
      {editing && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            apply((value) => renameFloor(value, name));
            setEditing(false);
          }}
        >
          <input
            aria-label="Nome do pavimento"
            maxLength={80}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button disabled={disabled}>Salvar nome</button>
        </form>
      )}
    </div>
  );
}
