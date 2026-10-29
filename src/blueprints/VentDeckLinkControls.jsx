import { HelpHint } from './HelpHint.jsx';
import { useState } from 'react';
import { activeFloor, floorList } from './floors.js';
import { connectVentFloor, portDestinations } from './vent-links.js';
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
  const targets = floorList(project).filter((f) => f.id !== activeFloor(project));
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
              <option value="">Escolha o pavimento</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!targets.some((f) => f.id === choice)}
            onClick={() => {
              try {
                onChange(
                  connectVentFloor(
                    project,
                    { floorId: activeFloor(project), elementId: element.id, portId: port.id },
                    choice,
                  ),
                );
                setError('');
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Criar conexão no mesmo ponto
          </button>
          <HelpHint label="Como o destino é criado">
            Reutiliza um duto no mesmo ponto ou cria um trecho inicial com a largura e orientação da
            origem.
          </HelpHint>
          {!targets.length && <small>Adicione outro pavimento para conectar.</small>}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
