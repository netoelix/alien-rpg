import { HelpHint } from './HelpHint.jsx';
import { useState } from 'react';
import { assetNames } from './Assets.jsx';
import { ToolIcon } from './ToolIcon.jsx';
import { layerFor } from './model.js';
import { objectVisible, setObjectFlag } from './objects.js';
const names = {
  floorRegion: 'Região de piso',
  trace: 'Traçado',
  partition: 'Parede independente',
  room: 'Sala retangular',
  ellipse: 'Sala oval',
  polygon: 'Sala por vértices',
  corridor: 'Corredor',
  door: 'Porta',
  vent: 'Duto',
  label: 'Anotação',
  dimension: 'Cota de distância',
};
const searchable = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function ObjectsPanel({ project, selected, disabled, onChange, onSelect, onLocate }) {
  const [search, setSearch] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [name, setName] = useState('');
  const [layer, setLayer] = useState('');
  const items = project.elements.map((element, index) => ({
    element,
    title:
      element.name ||
      (element.kind === 'asset'
        ? assetNames[element.asset]
        : element.kind === 'door' && element.openingType === 'window'
          ? 'Janela'
          : names[element.kind]) +
        ' ' +
        (index + 1),
  }));
  const filtered = items.filter(
    ({ element, title }) =>
      (!layer || layerFor(element.kind) === layer) &&
      searchable(title + ' ' + (element.text || '')).includes(searchable(search)),
  );
  return (
    <details className="blueprint-objects">
      <summary>Objetos do pavimento ({items.length})</summary>
      <label>
        Buscar objeto
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Sala, escada, console…"
        />
      </label>
      <label>
        Camada
        <select value={layer} onChange={(event) => setLayer(event.target.value)}>
          <option value="">Todas</option>
          {project.layers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <HelpHint>Ocultar também retira da exportação. Bloquear protege contra alterações.</HelpHint>
      <ul className="blueprint-object-list">
        {filtered.map(({ element, title }) => {
          const visible = objectVisible(project, element);
          const layerVisible = project.layers.find(
            (item) => item.id === layerFor(element.kind),
          )?.visible;
          return (
            <li key={element.id} className={selected === element.id ? 'is-selected' : ''}>
              <button
                className="blueprint-object-name"
                disabled={disabled || !visible || !layerVisible}
                onClick={() => onSelect(element.id)}
                title={title}
                aria-pressed={selected === element.id}
              >
                {title}
              </button>
              <div className="blueprint-object-actions">
                <button
                  disabled={disabled || !visible || !layerVisible}
                  title="Localizar na viewport"
                  aria-label={'Localizar ' + title}
                  onClick={() => onLocate(element.id)}
                >
                  <ToolIcon name="fit" />
                </button>
                <button
                  disabled={disabled}
                  title="Renomear objeto"
                  aria-label={'Renomear ' + title}
                  onClick={() => {
                    setRenaming(element.id);
                    setName(element.name || '');
                  }}
                >
                  <ToolIcon name="rename" />
                </button>
                <button
                  disabled={disabled}
                  title={element.hidden ? 'Mostrar objeto' : 'Ocultar objeto'}
                  aria-label={(element.hidden ? 'Mostrar ' : 'Ocultar ') + title}
                  aria-pressed={!!element.hidden}
                  onClick={() =>
                    onChange(setObjectFlag(project, element.id, 'hidden', !element.hidden))
                  }
                >
                  <ToolIcon name={element.hidden ? 'eyeOff' : 'eye'} />
                </button>
                <button
                  disabled={disabled}
                  title={element.locked ? 'Desbloquear objeto' : 'Bloquear objeto'}
                  aria-label={(element.locked ? 'Desbloquear ' : 'Bloquear ') + title}
                  aria-pressed={!!element.locked}
                  onClick={() =>
                    onChange(setObjectFlag(project, element.id, 'locked', !element.locked))
                  }
                >
                  <ToolIcon name={element.locked ? 'lock' : 'unlock'} />
                </button>
              </div>
              {renaming === element.id && (
                <form
                  className="blueprint-object-rename"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onChange({
                      ...project,
                      elements: project.elements.map((item) =>
                        item.id === element.id ? { ...item, name: name.trim() } : item,
                      ),
                    });
                    setRenaming(null);
                  }}
                >
                  <input
                    aria-label="Nome do objeto"
                    maxLength={80}
                    value={name}
                    placeholder={title}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <button disabled={disabled}>Salvar</button>
                  <button type="button" onClick={() => setRenaming(null)}>
                    Cancelar
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      {!filtered.length && <p>Nenhum objeto encontrado.</p>}
    </details>
  );
}
