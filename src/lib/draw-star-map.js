import { lightYearsPerParsec, routeSegments } from '../../data/star-map.js';
import { mapReference } from '../../data/official-cartography.js';

export const mapViewport = { width: 900, height: 540 };

export function screenPoint(point, center, zoom) {
  return { x: 450 + (point.x - center.x) * zoom, y: 270 - (point.y - center.y) * zoom };
}

export function worldPoint(point, center, zoom) {
  return { x: center.x + (point.x - 450) / zoom, y: center.y - (point.y - 270) / zoom };
}

function drawTerritory(context, territory, center, zoom) {
  context.save();
  context.fillStyle = territory.color;
  context.strokeStyle = territory.color;
  context.lineWidth = 1;
  context.shadowColor = territory.color;
  context.shadowBlur = 16;
  context.beginPath();
  if (territory.shape === 'circle') {
    const point = screenPoint(territory, center, zoom);
    const radius = (territory.radiusLy / lightYearsPerParsec) * zoom;
    const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
    gradient.addColorStop(0, territory.color + 'c0');
    gradient.addColorStop(0.65, territory.color + '70');
    gradient.addColorStop(1, territory.color + '00');
    context.fillStyle = gradient;
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.globalAlpha = 0.6;
    context.stroke();
  } else {
    territory.points.forEach((point, index) => {
      const screen = screenPoint(point, center, zoom);
      if (index === 0) context.moveTo(screen.x, screen.y);
      else context.lineTo(screen.x, screen.y);
    });
    context.closePath();
    context.globalAlpha = territory.kind === 'geographic' ? 0.12 : territory.official ? 0.2 : 0.45;
    context.fill();
    context.globalAlpha = 0.5;
    context.shadowBlur = 0;
    if (territory.kind === 'geographic') context.setLineDash([6, 5]);
    context.stroke();
  }
  context.restore();
}

export function drawStarMap(
  context,
  { center, zoom, systems, territories, stops, selectedId, referenceImage, polygonPoints, marker },
) {
  context.clearRect(0, 0, 900, 540);
  context.fillStyle = '#03130c';
  context.fillRect(0, 0, 900, 540);
  if (referenceImage) {
    const scale = zoom / mapReference.pixelsPerParsec;
    const origin = screenPoint({ x: 0, y: 0 }, center, zoom);
    context.drawImage(
      referenceImage,
      origin.x - mapReference.originX * scale,
      origin.y - mapReference.originY * scale,
      mapReference.width * scale,
      mapReference.height * scale,
    );
  }
  territories.forEach((territory) => drawTerritory(context, territory, center, zoom));
  context.font = '11px monospace';
  const left = Math.floor(center.x - 450 / zoom);
  const right = Math.ceil(center.x + 450 / zoom);
  const bottom = Math.floor(center.y - 270 / zoom);
  const top = Math.ceil(center.y + 270 / zoom);
  for (let x = left; x <= right; x++) {
    const screen = screenPoint({ x, y: 0 }, center, zoom).x;
    context.strokeStyle = x === 0 ? '#468366' : '#164832';
    context.beginPath();
    context.moveTo(screen, 0);
    context.lineTo(screen, 540);
    context.stroke();
    context.fillStyle = '#91b39d';
    if (zoom >= 24 || x % 2 === 0) context.fillText(String(x), screen + 3, 16);
  }
  for (let y = bottom; y <= top; y++) {
    const screen = screenPoint({ x: 0, y }, center, zoom).y;
    context.strokeStyle = y === 0 ? '#468366' : '#164832';
    context.beginPath();
    context.moveTo(0, screen);
    context.lineTo(900, screen);
    context.stroke();
    context.fillStyle = '#91b39d';
    if (zoom >= 24 || y % 2 === 0) context.fillText(String(y), 3, screen - 3);
  }
  if (zoom >= 80) {
    context.strokeStyle = '#16483280';
    context.setLineDash([2, 4]);
    for (let x = left; x <= right; x += 0.1) {
      const screen = screenPoint({ x, y: 0 }, center, zoom).x;
      context.beginPath();
      context.moveTo(screen, 0);
      context.lineTo(screen, 540);
      context.stroke();
    }
    for (let y = bottom; y <= top; y += 0.1) {
      const screen = screenPoint({ x: 0, y }, center, zoom).y;
      context.beginPath();
      context.moveTo(0, screen);
      context.lineTo(900, screen);
      context.stroke();
    }
    context.setLineDash([]);
  }
  context.strokeStyle = '#e9ca7e';
  context.lineWidth = 2;
  routeSegments(stops).forEach(({ from, to }) => {
    const start = screenPoint(from.system, center, zoom);
    const end = screenPoint(to.system, center, zoom);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    if (Math.hypot(end.x - start.x, end.y - start.y) > 20) {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const x = (start.x + end.x) / 2;
      const y = (start.y + end.y) / 2;
      context.beginPath();
      context.moveTo(x - 7 * Math.cos(angle - 0.5), y - 7 * Math.sin(angle - 0.5));
      context.lineTo(x, y);
      context.lineTo(x - 7 * Math.cos(angle + 0.5), y - 7 * Math.sin(angle + 0.5));
      context.stroke();
    }
  });
  const visitedIds = new Set(stops.map((stop) => stop.system?.id));
  for (const system of systems) {
    const point = screenPoint(system, center, zoom);
    if (point.x < -20 || point.x > 920 || point.y < -20 || point.y > 560) continue;
    const selected = system.id === selectedId;
    context.fillStyle = visitedIds.has(system.id)
      ? '#e9ca7e'
      : system.official
        ? '#7ce5c6'
        : '#cfb1ff';
    context.beginPath();
    context.arc(point.x, point.y, selected ? 6 : 3.5, 0, Math.PI * 2);
    context.fill();
    if (selected) {
      context.strokeStyle = '#fff';
      context.beginPath();
      context.arc(point.x, point.y, 10, 0, Math.PI * 2);
      context.stroke();
    }
  }
  // Os rótulos selecionados e visitados têm prioridade em regiões densas.
  const occupied = [];
  const labels = systems.filter(
    (system) => zoom >= 32 || system.id === selectedId || visitedIds.has(system.id),
  );
  labels.sort(
    (a, b) =>
      Number(b.id === selectedId) - Number(a.id === selectedId) ||
      Number(visitedIds.has(b.id)) - Number(visitedIds.has(a.id)),
  );
  for (const system of labels) {
    const point = screenPoint(system, center, zoom);
    const width = context.measureText(system.name).width + 6;
    const candidates = [
      { x: point.x + 9, y: point.y - 18 },
      { x: point.x + 9, y: point.y + 6 },
      { x: point.x - width - 9, y: point.y - 18 },
      { x: point.x - width - 9, y: point.y + 6 },
      { x: point.x - width / 2, y: point.y - 31 },
      { x: point.x - width / 2, y: point.y + 18 },
    ];
    const box = candidates.find(
      (candidate) =>
        candidate.x >= 16 &&
        candidate.x + width <= 900 &&
        candidate.y >= 20 &&
        candidate.y + 15 <= 540 &&
        !occupied.some(
          (other) =>
            candidate.x < other.x + other.width + 3 &&
            candidate.x + width + 3 > other.x &&
            candidate.y < other.y + 18 &&
            candidate.y + 18 > other.y,
        ),
    );
    if (!box) continue;
    occupied.push({ ...box, width });
    context.fillStyle = '#03130ce8';
    context.fillRect(box.x, box.y, width, 15);
    context.fillStyle =
      system.id === selectedId ? '#fff' : visitedIds.has(system.id) ? '#e9ca7e' : '#b7dac5';
    context.fillText(system.name, box.x + 3, box.y + 11);
  }
  context.strokeStyle = '#fff';
  context.setLineDash([5, 4]);
  if (polygonPoints.length) {
    context.beginPath();
    polygonPoints.forEach((point, index) => {
      const screen = screenPoint(point, center, zoom);
      if (index === 0) context.moveTo(screen.x, screen.y);
      else context.lineTo(screen.x, screen.y);
    });
    context.stroke();
    polygonPoints.forEach((point) => {
      const screen = screenPoint(point, center, zoom);
      context.strokeRect(screen.x - 3, screen.y - 3, 6, 6);
    });
  }
  if (marker) {
    const point = screenPoint(marker, center, zoom);
    context.beginPath();
    context.moveTo(point.x - 8, point.y);
    context.lineTo(point.x + 8, point.y);
    context.moveTo(point.x, point.y - 8);
    context.lineTo(point.x, point.y + 8);
    context.stroke();
  }
  context.setLineDash([]);
}
