import { useState } from 'react';
import { timelines } from '../../data/model.js';
import { Breadcrumbs, Eyebrow, RouteLink } from '../components/Common.jsx';

const knownLogs = timelines
  .map((log, id) => ({ log, id }))
  .filter(({ log }) => log.dateTime !== '[REDACTED]');

export function MapPage() {
  const [cutoff, setCutoff] = useState(knownLogs.length - 1);
  const visited = knownLogs.slice(0, cutoff + 1);
  const systems = [...new Set(visited.map(({ log }) => log.location))];
  // Coordenadas provisórias do protótipo. O mapa canônico será desenvolvido depois.
  const points = systems.map((name, index) => ({
    name,
    x: 70 + (index % 5) * 165,
    y: 70 + Math.floor(index / 5) * 160,
  }));
  const pointFor = (name) => points.find((point) => point.name === name);
  const lastStop = visited.at(-1);

  return (
    <>
      <Breadcrumbs>Navegação estelar</Breadcrumbs>
      <Eyebrow>Cartografia / Percurso da campanha</Eyebrow>
      <h1>Rota do Wild Weasel</h1>
      <p className="map-note">
        ESQUEMA DE NAVEGAÇÃO · Posições ilustrativas. Coordenadas oficiais ainda não cadastradas.
      </p>
      <div className="toolbar">
        <label>
          PERCURSO ATÉ
          <select value={cutoff} onChange={(event) => setCutoff(Number(event.target.value))}>
            {knownLogs.map(({ log, id }, index) => (
              <option key={id} value={index}>
                {log.dateTime} · {log.location}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="map-layout">
        <div className="map-panel">
          <svg
            viewBox="0 0 820 430"
            role="img"
            aria-label="Percurso esquemático dos sistemas visitados"
          >
            {visited.slice(1).map(({ log, id }, index) => {
              const from = pointFor(visited[index].log.location);
              const to = pointFor(log.location);
              return from === to ? null : (
                <line key={id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
              );
            })}
            {points.map((point) => (
              <a
                key={point.name}
                href={`#/mission/${visited.filter(({ log }) => log.location === point.name).at(-1).id}`}
              >
                <title>{point.name} — abrir missão</title>
                <circle cx={point.x} cy={point.y} r="8" />
                <text x={point.x - 28} y={point.y + 28}>
                  {point.name}
                </text>
              </a>
            ))}
          </svg>
        </div>
        <aside className="sidepanel">
          <Eyebrow>Última parada</Eyebrow>
          <h3>{lastStop.log.location}</h3>
          <p className="muted">{lastStop.log.dateTime}</p>
          <RouteLink to={`mission/${lastStop.id}`}>{lastStop.log.mission} →</RouteLink>
          <p className="muted small-text section-intro">
            Selecione uma parada para acessar seu arquivo. O seletor acima acompanha a ordem das
            missões.
          </p>
        </aside>
      </div>
    </>
  );
}
