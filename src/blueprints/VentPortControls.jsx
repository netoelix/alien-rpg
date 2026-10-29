import { HelpHint } from './HelpHint.jsx';
import { NumberField } from './NumberField.jsx';
import { VentDeckLinkControls } from './VentDeckLinkControls.jsx';
import { ventPortTypes } from './vent-ports.js';
export function VentPortControls({
  element,
  onChange,
  onPlace,
  placing,
  project,
  onProjectChange,
  onNavigate,
}) {
  const ports = element.ports || [];
  const update = (id, key, value) =>
    onChange(ports.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  return (
    <details>
      <summary>Acessos e conexões entre pavimentos ({ports.length})</summary>
      <button type="button" disabled={ports.length >= 100} onClick={onPlace}>
        {placing ? 'Cancelar posicionamento' : 'Adicionar acesso no mapa'}
      </button>
      <HelpHint label="Posicionar e conectar acessos">
        Clique no duto para posicionar. Escape cancela. Direita/esquerda seguem o sentido do início
        ao fim. Para ligar pavimentos, adicione um acesso e escolha Escotilha de teto ou de piso. As
        pontas automáticas não criam esse vínculo.
      </HelpHint>
      {ports.map((p, i) => (
        <details className="blueprint-port-card" key={p.id}>
          <summary>
            {p.label || `Acesso ${i + 1}`} · {ventPortTypes[p.type]}
          </summary>
          <label>
            Tipo
            <select value={p.type} onChange={(e) => update(p.id, 'type', e.target.value)}>
              {Object.entries(ventPortTypes).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          {p.type === 'grille' && (
            <label>
              Lado
              <select value={p.side} onChange={(e) => update(p.id, 'side', Number(e.target.value))}>
                <option value={1}>Direita</option>
                <option value={-1}>Esquerda</option>
              </select>
            </label>
          )}
          {p.type === 'grille' && (
            <>
              <label>
                Largura da saída (m)
                <NumberField
                  type="number"
                  min=".2"
                  max="3"
                  step=".05"
                  value={p.size ?? Math.min(0.65, element.width * 0.8)}
                  onChange={(e) => update(p.id, 'size', Number(e.target.value))}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!p.connectWall}
                  onChange={(e) => update(p.id, 'connectWall', e.target.checked)}
                />
                Conectar à parede próxima
              </label>
              <HelpHint label="Ramal até a parede">
                Cria um ramal até a primeira parede válida no lado escolhido, a até 2 m. Sem parede
                nesse alcance, mantém a saída no duto.
              </HelpHint>
            </>
          )}
          <label>
            Nome ou destino
            <input
              maxLength={80}
              value={p.label}
              onChange={(e) => update(p.id, 'label', e.target.value)}
            />
          </label>
          <label>
            Trecho
            <select
              value={p.segment}
              onChange={(e) => update(p.id, 'segment', Number(e.target.value))}
            >
              {element.points.slice(1).map((_, j) => (
                <option key={j} value={j}>
                  {j + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Posição no trecho · {Math.round(p.t * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={p.t}
              onChange={(e) => update(p.id, 't', Number(e.target.value))}
            />
          </label>
          {project && (
            <VentDeckLinkControls
              project={project}
              element={element}
              port={p}
              onChange={onProjectChange}
              onNavigate={onNavigate}
            />
          )}
          <button type="button" onClick={() => onChange(ports.filter((x) => x.id !== p.id))}>
            Remover acesso
          </button>
        </details>
      ))}
    </details>
  );
}
