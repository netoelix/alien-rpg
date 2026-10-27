import { useState } from 'react';
import { activeFloor, floorList } from './floors.js';
import { floorElements } from './connections.js';
import { addVentLink, portDestinations } from './vent-links.js';
export function VentDeckLinkControls({ project, element, port, onChange, onNavigate }) {
  const [choice, setChoice] = useState(''),
    [error, setError] = useState('');
  if (port.type === 'grille')
    return (
      <small>
        Conexão entre pavimentos: escolha Escotilha de teto ou de piso no tipo deste acesso.
      </small>
    );
  const links = portDestinations(project, element.id, port.id);
  const targets = floorList(project)
    .filter((f) => f.id !== activeFloor(project))
    .flatMap((f) =>
      floorElements(project, f.id)
        .filter((e) => e.kind === 'vent' && !e.hidden && !e.locked)
        .flatMap((e) =>
          (e.ports || [])
            .filter((p) => ['ceiling', 'floor'].includes(p.type) && p.type !== port.type)
            .map((p) => ({
              endpoint: { floorId: f.id, elementId: e.id, portId: p.id },
              label:
                f.name +
                ' · ' +
                (e.name || 'Duto') +
                ' · ' +
                (p.label || 'Acesso ' + (e.ports.indexOf(p) + 1)),
            })),
        ),
    );
  return (
    <div>
      <strong>Conexão entre pavimentos</strong>
      {links.map((l) => (
        <div key={l.id}>
          <p>{l.label}</p>
          <button type="button" onClick={() => onNavigate(l.endpoint)}>
            Ir ao destino
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({ ...project, ventLinks: project.ventLinks.filter((x) => x.id !== l.id) })
            }
          >
            Desvincular
          </button>
        </div>
      ))}
      {!links.length && (
        <>
          <label>
            Destino
            <select value={choice} onChange={(e) => setChoice(e.target.value)}>
              <option value="">Escolha outro acesso</option>
              {targets.map((t) => (
                <option key={JSON.stringify(t.endpoint)} value={JSON.stringify(t.endpoint)}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!choice}
            onClick={() => {
              try {
                onChange(
                  addVentLink(
                    project,
                    { floorId: activeFloor(project), elementId: element.id, portId: port.id },
                    JSON.parse(choice),
                  ),
                );
                setError('');
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Conectar acessos
          </button>
          {!targets.length && (
            <small>
              Crie uma escotilha {port.type === 'ceiling' ? 'de piso' : 'de teto'} em um duto de
              outro pavimento. A conexão mantém as posições de ambos.
            </small>
          )}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
