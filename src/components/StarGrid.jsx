import { useEffect, useRef, useState } from 'react';
import { campaignSystems } from '../../data/star-map.js';

export function StarGrid({ campaign, onPosition }) {
  const canvas = useRef(null);
  const [zoom, setZoom] = useState(32);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);
  const systems = campaignSystems(campaign);
  useEffect(() => {
    const context = canvas.current.getContext('2d');
    context.clearRect(0, 0, 900, 540);
    context.fillStyle = '#03130c';
    context.fillRect(0, 0, 900, 540);
    context.font = '12px monospace';
    const left = Math.floor(center.x - 450 / zoom);
    const right = Math.ceil(center.x + 450 / zoom);
    const bottom = Math.floor(center.y - 270 / zoom);
    const top = Math.ceil(center.y + 270 / zoom);
    context.strokeStyle = '#164832';
    context.fillStyle = '#63947c';
    for (let x = left; x <= right; x++) {
      const screen = 450 + (x - center.x) * zoom;
      context.beginPath();
      context.moveTo(screen, 0);
      context.lineTo(screen, 540);
      context.stroke();
      context.fillText(String(x), screen + 3, 18);
    }
    for (let y = bottom; y <= top; y++) {
      const screen = 270 - (y - center.y) * zoom;
      context.beginPath();
      context.moveTo(0, screen);
      context.lineTo(900, screen);
      context.stroke();
      context.fillText(String(y), 3, screen - 3);
    }
    for (const system of systems) {
      const x = 450 + (system.x - center.x) * zoom;
      const y = 270 - (system.y - center.y) * zoom;
      context.fillStyle = '#69ffab';
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
      context.fillText(system.name, x + 8, y - 8);
    }
  }, [campaign, zoom, center]);
  function choose(event) {
    const bounds = canvas.current.getBoundingClientRect();
    const x = center.x + (((event.clientX - bounds.left) * 900) / bounds.width - 450) / zoom;
    const y = center.y - (((event.clientY - bounds.top) * 540) / bounds.height - 270) / zoom;
    const system = systems.find((entry) => Math.hypot(entry.x - x, entry.y - y) < 12 / zoom);
    setSelected(system || null);
    onPosition?.({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
  return (
    <>
      <div className="toolbar">
        <button onClick={() => setZoom(Math.min(128, zoom * 2))}>AMPLIAR +</button>
        <button onClick={() => setZoom(Math.max(8, zoom / 2))}>REDUZIR −</button>
        <button onClick={() => setCenter({ x: 0, y: 0 })}>CENTRAR EM SOL</button>
        {[
          ['←', -4, 0],
          ['→', 4, 0],
          ['↑', 0, 4],
          ['↓', 0, -4],
        ].map(([label, x, y]) => (
          <button
            key={label}
            aria-label={'Deslocar mapa ' + label}
            onClick={() => setCenter({ x: center.x + x, y: center.y + y })}
          >
            {label}
          </button>
        ))}
      </div>
      <canvas
        ref={canvas}
        width="900"
        height="540"
        style={{ width: '100%', border: '1px solid #164832' }}
        onClick={choose}
        aria-label="Mapa estelar; cada quadrado representa um parsec"
      />
      <label>
        Sistemas cadastrados
        <select
          value={selected?.id || ''}
          onChange={(event) =>
            setSelected(systems.find((system) => system.id === event.target.value) || null)
          }
        >
          <option value="">Selecionar sistema…</option>
          {systems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      {selected && (
        <p>
          {selected.name} · X {selected.x} / Y {selected.y} pc
          <br />
          {selected.installations.join(' · ') || 'Nenhuma instalação cadastrada.'}
        </p>
      )}
    </>
  );
}
