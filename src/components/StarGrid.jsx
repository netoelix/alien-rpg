import { useEffect, useMemo, useRef, useState } from 'react';
import { campaignSystems, campaignTerritories, campaignRoute } from '../../data/star-map.js';
import { drawStarMap, worldPoint } from '../lib/draw-star-map.js';
import { RouteLink } from './Common.jsx';

const noPoints = [];

export function StarGrid({
  campaign,
  onPosition,
  polygonPoints = noPoints,
  marker,
  stops: suppliedStops,
}) {
  const canvas = useRef(null);
  const drag = useRef(null);
  const [zoom, setZoom] = useState(16);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [showTerritories, setShowTerritories] = useState(true);
  const [showReference, setShowReference] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const [referenceImage, setReferenceImage] = useState(null);
  const systems = useMemo(() => campaignSystems(campaign), [campaign]);
  const territories = useMemo(() => campaignTerritories(campaign), [campaign]);
  const stops = useMemo(() => suppliedStops ?? campaignRoute(campaign), [campaign, suppliedStops]);
  const selected = systems.find((system) => system.id === selectedId);
  const choices = systems.filter((system) =>
    (system.name + ' ' + system.installations.join(' '))
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!showReference || referenceImage) return;
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) setReferenceImage(image);
    };
    image.src = '/assets/galaxy-map.jpg';
    return () => {
      active = false;
    };
  }, [showReference, referenceImage]);

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    drawStarMap(context, {
      center,
      zoom,
      systems,
      territories: showTerritories
        ? showReference
          ? territories.filter((entry) => !entry.official)
          : territories
        : [],
      stops: showRoute ? stops : [],
      selectedId,
      referenceImage: showReference ? referenceImage : null,
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
    showReference,
    showRoute,
    referenceImage,
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
    if (event.key === '-') setZoom((current) => Math.max(8, current / 2));
  }
  return (
    <div className="star-map">
      <div className="toolbar map-controls">
        <button type="button" onClick={() => setZoom((current) => Math.min(256, current * 2))}>
          AMPLIAR +
        </button>
        <button type="button" onClick={() => setZoom((current) => Math.max(8, current / 2))}>
          REDUZIR −
        </button>
        <button
          type="button"
          onClick={() => {
            setCenter({ x: 0, y: 0 });
            setZoom(16);
          }}
        >
          CENTRAR EM SOL
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
        <label>
          <input
            type="checkbox"
            checked={showReference}
            onChange={(event) => setShowReference(event.target.checked)}
          />{' '}
          Referência oficial
        </label>
      </div>
      <p className="muted small-text">
        Arraste para navegar. Use os botões ou as setas do teclado. Cada quadrado representa 1 pc; o
        zoom revela a divisão em décimos.
      </p>
      {showReference && (
        <p className="muted small-text">
          A referência conserva as cores originais da imagem; oculte-a para visualizar somente os
          territórios desta campanha.
        </p>
      )}
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
      {official ? 'CATÁLOGO OFICIAL / SOMENTE LEITURA' : 'DESCOBERTA / EXCLUSIVA DESTA CAMPANHA'}
    </p>
  );
}
