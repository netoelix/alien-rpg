import { useEffect, useMemo, useRef, useState } from 'react';
import { campaignSystems, campaignTerritories, campaignRoute } from '../../data/star-map.js';
import { drawStarMap, worldPoint } from '../lib/draw-star-map.js';
import { SystemLocations } from './SystemLocations.jsx';
import { RouteLink } from './Common.jsx';

const noPoints = [];

export function StarGrid({
  campaign,
  onPosition,
  polygonPoints = noPoints,
  marker,
  stops: suppliedStops,
  focusSystemId,
}) {
  const canvas = useRef(null);
  const drag = useRef(null);
  const [zoom, setZoom] = useState(16);
  const [center, setCenter] = useState(() => {
    const system = campaignSystems(campaign).find((item) => item.id === focusSystemId);
    return system ? { x: system.x, y: system.y } : { x: 0, y: 0 };
  });
  const [selectedId, setSelectedId] = useState(focusSystemId || '');
  const [search, setSearch] = useState('');
  const [showTerritories, setShowTerritories] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const systems = useMemo(() => campaignSystems(campaign), [campaign]);
  const territories = useMemo(() => campaignTerritories(campaign), [campaign]);
  const stops = useMemo(() => suppliedStops ?? campaignRoute(campaign), [campaign, suppliedStops]);
  const selected = systems.find((system) => system.id === selectedId);
  const choices = systems.filter((system) =>
    (
      system.name +
      ' ' +
      system.installations.join(' ') +
      ' ' +
      (system.locations || [])
        .map((location) =>
          [location.name, location.commonName, location.installations].filter(Boolean).join(' '),
        )
        .join(' ')
    )
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    drawStarMap(context, {
      center,
      zoom,
      systems,
      territories: showTerritories ? territories : [],
      stops: showRoute ? stops : [],
      selectedId,
      polygonPoints,
      marker,
    });
  }, [
    center,
    zoom,
    systems,
    territories,
    stops,
    selectedId,
    showTerritories,
    showRoute,
    polygonPoints,
    marker,
  ]);

  function canvasPoint(event) {
    const bounds = canvas.current.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) * 900) / bounds.width,
      y: ((event.clientY - bounds.top) * 540) / bounds.height,
    };
  }
  function choose(point) {
    const world = worldPoint(point, center, zoom);
    const nearest = systems.reduce((best, system) => {
      const distance = Math.hypot(system.x - world.x, system.y - world.y);
      return !best || distance < best.distance ? { system, distance } : best;
    }, null);
    setSelectedId(nearest?.distance <= 12 / zoom ? nearest.system.id : '');
    onPosition?.({ x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 });
  }
  function selectSystem(id) {
    const system = systems.find((entry) => entry.id === id);
    setSelectedId(id);
    if (system) setCenter({ x: system.x, y: system.y });
  }
  function fitRoute() {
    const points = stops.flatMap((stop) => (stop.system ? [stop.system] : []));
    if (!points.length) return;
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    setCenter({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
    setZoom(
      Math.max(0.02, Math.min(64, 760 / Math.max(1, maxX - minX), 420 / Math.max(1, maxY - minY))),
    );
  }
  function keyboard(event) {
    const directions = {
      ArrowLeft: [-3, 0],
      ArrowRight: [3, 0],
      ArrowUp: [0, 3],
      ArrowDown: [0, -3],
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      setCenter((current) => ({ x: current.x + direction[0], y: current.y + direction[1] }));
    }
    if (event.key === '+' || event.key === '=') setZoom((current) => Math.min(256, current * 2));
    if (event.key === '-') setZoom((current) => Math.max(2, current / 2));
  }
  return (
    <div className="star-map">
      <div className="map-canvas-frame">
        <div className="toolbar map-controls">
          <button
            type="button"
            aria-label="Ampliar mapa"
            title="Ampliar"
            onClick={() => setZoom((current) => Math.min(256, current * 2))}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Reduzir mapa"
            title="Reduzir"
            onClick={() => setZoom((current) => Math.max(2, current / 2))}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              setCenter({ x: 0, y: 0 });
              setZoom(16);
            }}
          >
            SOL
          </button>
          <button type="button" onClick={fitRoute} disabled={!stops.some((stop) => stop.system)}>
            ROTA
          </button>
          {[
            ['←', -4, 0],
            ['→', 4, 0],
            ['↑', 0, 4],
            ['↓', 0, -4],
          ].map(([label, x, y]) => (
            <button
              type="button"
              key={label}
              aria-label={'Deslocar mapa ' + label}
              onClick={() => setCenter((current) => ({ x: current.x + x, y: current.y + y }))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="map-layer-controls">
          <label>
            <input
              type="checkbox"
              checked={showTerritories}
              onChange={(event) => setShowTerritories(event.target.checked)}
            />{' '}
            Territórios
          </label>
          <label>
            <input
              type="checkbox"
              checked={showRoute}
              onChange={(event) => setShowRoute(event.target.checked)}
            />{' '}
            Percurso
          </label>
        </div>
        <canvas
          ref={canvas}
          width="900"
          height="540"
          tabIndex="0"
          aria-label="Mapa estelar interativo. Use as setas para navegar, mais e menos para ajustar o zoom. A lista abaixo permite selecionar sistemas."
          onKeyDown={keyboard}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            canvas.current.setPointerCapture(event.pointerId);
            drag.current = { point: canvasPoint(event), center, moved: false };
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            const point = canvasPoint(event);
            const start = drag.current;
            const dx = point.x - start.point.x;
            const dy = point.y - start.point.y;
            if (Math.hypot(dx, dy) > 5) start.moved = true;
            if (start.moved)
              setCenter({ x: start.center.x - dx / zoom, y: start.center.y + dy / zoom });
          }}
          onPointerUp={(event) => {
            if (drag.current && !drag.current.moved) choose(canvasPoint(event));
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        />
      </div>
      <p className="muted small-text">
        Arraste para navegar. Use os botões ou as setas do teclado. Cada quadrado representa 1 pc; o
        zoom revela a divisão em décimos.
      </p>
      <div className="map-legend">
        <span>
          <i style={{ background: '#7ce5c6' }} /> Sistema oficial
        </span>
        <span>
          <i style={{ background: '#cfb1ff' }} /> Sistema da campanha
        </span>
        <span>
          <i style={{ background: '#e9ca7e' }} /> Sistema visitado / rota
        </span>
      </div>
      {showTerritories && (
        <div className="map-legend">
          {territories.map((territory) => (
            <span key={territory.id}>
              <i style={{ background: territory.color }} />
              {territory.name}
              {territory.kind === 'geographic' ? ' · região' : ''}
            </span>
          ))}
        </div>
      )}
      <div className="map-search">
        <label>
          Buscar sistema ou instalação
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label>
          Sistemas cadastrados
          <select value={selectedId} onChange={(event) => selectSystem(event.target.value)}>
            <option value="">Selecionar sistema…</option>
            {selected && !choices.some((system) => system.id === selected.id) && (
              <option value={selected.id}>{selected.name}</option>
            )}
            {choices.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
                {system.installations.length ? ' · ' + system.installations.join(' / ') : ''}
                {system.official ? ' · oficial' : ' · campanha'}
              </option>
            ))}
          </select>
        </label>
      </div>
      {selected && (
        <aside className="map-system-panel">
          <EyebrowText official={selected.official} />
          <h2>{selected.name}</h2>
          <p>
            X {selected.x} / Y {selected.y} pc
          </p>
          {selected.installations.length ? (
            <ul>
              {selected.installations.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nenhuma instalação indicada neste cadastro.</p>
          )}
          <SystemLocations locations={selected.locations} />
          {stops
            .filter((stop) => stop.system?.id === selected.id)
            .map((stop) => (
              <p key={stop.id}>
                {stop.arrival}
                {stop.departure ? ' → ' + stop.departure : ''}
                {Number.isInteger(stop.missionIndex) && campaign.timelines?.[stop.missionIndex] && (
                  <>
                    {' '}
                    ·{' '}
                    <RouteLink to={'mission/' + stop.missionIndex}>
                      {campaign.timelines[stop.missionIndex].mission}
                    </RouteLink>
                  </>
                )}
              </p>
            ))}
        </aside>
      )}
    </div>
  );
}

function EyebrowText({ official }) {
  return (
    <p className="eyebrow">
      {official ? 'CATÁLOGO OFICIAL / CONSULTA' : 'DESCOBERTA / EXCLUSIVA DESTA CAMPANHA'}
    </p>
  );
}
