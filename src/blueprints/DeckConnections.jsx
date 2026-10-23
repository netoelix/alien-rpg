import { useState } from 'react';
import { activeFloor, floorList, switchFloor } from './floors.js';
import { addConnections, floorElements } from './connections.js';
import { shapeTransform } from './orientation.js';

export function DeckReference({ project, floorId, opacity }) {
  if (!floorId || floorId === activeFloor(project)) return null;
  return (
    <g
      data-editor-only="true"
      pointerEvents="none"
      opacity={opacity}
      fill="none"
      stroke="#b6c9ff"
      strokeWidth=".12"
      strokeDasharray=".4 .2"
    >
      {floorElements(project, floorId).map((element) => {
        const { id, kind, x, y, w, h } = element;
        if (kind === 'room')
          return (
            <rect key={id} x={x} y={y} width={w} height={h} transform={shapeTransform(element)} />
          );
        if (kind === 'ellipse')
          return (
            <ellipse
              key={id}
              cx={x + w / 2}
              cy={y + h / 2}
              rx={w / 2}
              ry={h / 2}
              transform={shapeTransform(element)}
            />
          );
        if (kind === 'polygon')
          return (
            <polygon
              key={id}
              points={element.points.map((point) => point.x + ',' + point.y).join(' ')}
            />
          );
        if (kind === 'corridor')
          return (
            <polyline
              key={id}
              points={element.points.map((point) => point.x + ',' + point.y).join(' ')}
              strokeWidth={element.width}
              strokeOpacity=".4"
            />
          );
        return null;
      })}
    </g>
  );
}

export function DeckConnections({
  project,
  disabled,
  referenceFloor,
  setReferenceFloor,
  opacity,
  setOpacity,
  onChange,
  onError,
  onPlace,
  placing,
  onCancelPlacement,
}) {
  const floors = floorList(project);
  const current = activeFloor(project);
  const others = floors.filter((floor) => floor.id !== current);
  const [targets, setTargets] = useState([]);
  const [type, setType] = useState('stairs');
  const [x, setX] = useState(2),
    [y, setY] = useState(2);
  const destinations = targets
    .filter((id) => others.some((floor) => floor.id === id))
    .slice(0, type === 'stairs' ? 1 : undefined);
  const links = (project.connections || []).filter(
    (link) => link.from.floorId === current || link.to.floorId === current,
  );
  const stops = new Map();
  for (const link of links) {
    const local = link.from.floorId === current ? link.from : link.to;
    const destination = link.from.floorId === current ? link.to : link.from;
    if (!stops.has(local.elementId)) stops.set(local.elementId, []);
    stops.get(local.elementId).push({ link, destination });
  }
  return (
    <div className="blueprint-deck-panels">
      <details className="blueprint-deck-options">
        <summary>
          Referência visual <small>Sobrepor outro andar</small>
        </summary>
        <div className="deck-reference-fields">
          <label>
            Mostrar contorno de
            <select
              value={others.some((floor) => floor.id === referenceFloor) ? referenceFloor : ''}
              onChange={(event) => setReferenceFloor(event.target.value)}
            >
              <option value="">Nenhum pavimento</option>
              {others.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Intensidade · {Math.round(opacity * 100)}%
            <input
              type="range"
              min="0.1"
              max="0.7"
              step="0.05"
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
            />
          </label>
        </div>
        <small>Guia de alinhamento. Não aparece na exportação.</small>
      </details>
      <details className="blueprint-deck-options">
        <summary>
          Escadas e elevadores <small>{stops.size} conexão(ões) neste andar</small>
        </summary>
        <div className="deck-connection-layout">
          <section className="deck-create">
            <h3>Nova conexão</h3>
            <div className="deck-type-picker" role="group" aria-label="Tipo de conexão">
              <button
                aria-pressed={type === 'stairs'}
                disabled={disabled || placing}
                onClick={() => setType('stairs')}
              >
                ↗ Escada
              </button>
              <button
                aria-pressed={type === 'elevator'}
                disabled={disabled || placing}
                onClick={() => setType('elevator')}
              >
                ↕ Elevador
              </button>
            </div>
            <fieldset disabled={disabled || placing} className="deck-destinations">
              <legend>{type === 'stairs' ? 'Conectar ao pavimento' : 'Paradas do elevador'}</legend>
              <small>Origem: {floors.find((floor) => floor.id === current)?.name}</small>
              {!others.length && <p>Crie outro pavimento para conectar.</p>}
              {others.map((floor) => (
                <label className="deck-floor-choice" key={floor.id}>
                  <input
                    type={type === 'stairs' ? 'radio' : 'checkbox'}
                    name="connection-floor"
                    checked={destinations.includes(floor.id)}
                    onChange={(event) =>
                      setTargets(
                        type === 'stairs'
                          ? [floor.id]
                          : event.target.checked
                            ? [...destinations, floor.id]
                            : destinations.filter((id) => id !== floor.id),
                      )
                    }
                  />
                  <span>{floor.name}</span>
                </label>
              ))}
            </fieldset>
            <button
              className="deck-place"
              disabled={disabled || !destinations.length || placing}
              onClick={() => onPlace({ type, targetIds: destinations })}
            >
              Posicionar no mapa
            </button>
            {placing ? (
              <div className="deck-placement-hint" role="status">
                Clique no mapa para inserir. Esc cancela.
                <button onClick={onCancelPlacement}>Cancelar</button>
              </div>
            ) : (
              <small>
                Escolha o destino e clique no mapa. A posição será igual em todos os andares.
              </small>
            )}
            <details className="deck-coordinates">
              <summary>Usar coordenadas</summary>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  try {
                    onChange(addConnections(project, destinations, type, x, y));
                  } catch (error) {
                    onError(error.message);
                  }
                }}
              >
                <label>
                  X (m)
                  <input
                    type="number"
                    min="0"
                    max={project.width - 2}
                    step="0.25"
                    required
                    value={x}
                    onChange={(event) => setX(event.target.valueAsNumber)}
                  />
                </label>
                <label>
                  Y (m)
                  <input
                    type="number"
                    min="0"
                    max={project.height - 2}
                    step="0.25"
                    required
                    value={y}
                    onChange={(event) => setY(event.target.valueAsNumber)}
                  />
                </label>
                <button disabled={disabled || !destinations.length || placing}>Criar aqui</button>
              </form>
            </details>
          </section>
          <section className="deck-existing">
            <h3>Conexões neste andar</h3>
            {!stops.size && <p>Nenhuma conexão criada.</p>}
            {[...stops].map(([id, entries]) => {
              const asset = floorElements(project, current).find((element) => element.id === id);
              return (
                <article className="deck-link-card" key={id}>
                  <header>
                    <strong>{asset?.asset === 'elevator' ? 'Elevador' : 'Escada'}</strong>
                    <small>
                      X {asset?.x} · Y {asset?.y}
                    </small>
                  </header>
                  {entries.map(({ link, destination }) => {
                    const name = floors.find((floor) => floor.id === destination.floorId)?.name;
                    return (
                      <div className="deck-link-destination" key={link.id}>
                        <span>{name}</span>
                        <button
                          disabled={disabled || placing}
                          aria-label={'Ir para ' + name}
                          onClick={() => onChange(switchFloor(project, destination.floorId))}
                        >
                          Ir ↗
                        </button>
                        <button
                          disabled={disabled || placing}
                          title="Remove só o vínculo; mantém as peças"
                          aria-label={'Desvincular de ' + name}
                          onClick={() =>
                            onChange({
                              ...project,
                              connections: project.connections.filter(
                                (item) => item.id !== link.id,
                              ),
                            })
                          }
                        >
                          Desvincular
                        </button>
                      </div>
                    );
                  })}
                </article>
              );
            })}
          </section>
        </div>
      </details>
    </div>
  );
}
