import { remapPathAnchor } from './path-anchor.js';
import { projectPointToSegment } from './segment-geometry.js';
export const ventPortTypes = {
  grille: 'Grelha lateral',
  ceiling: 'Escotilha de teto',
  floor: 'Escotilha de piso',
};
export function nearestVentPort(points, point) {
  let best = null;
  for (let segment = 0; segment < points.length - 1; segment++) {
    const projection = projectPointToSegment(point, points[segment], points[segment + 1]);
    if (!projection) continue;
    const { t, distance } = projection;
    if (!best || distance < best.distance) best = { segment, t, distance };
  }
  return best;
}
export function ventPortPosition(points, port, width = 0) {
  const a = points[port.segment],
    b = points[port.segment + 1];
  if (!a || !b) return null;
  const dx = b.x - a.x,
    dy = b.y - a.y,
    len = Math.hypot(dx, dy) || 1,
    offset = port.type === 'grille' ? (port.side * width) / 2 : 0;
  return {
    x: a.x + dx * port.t - (dy / len) * offset,
    y: a.y + dy * port.t + (dx / len) * offset,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}
export function normalizeVentPorts(value, points) {
  if (!Array.isArray(value) || value.length > 100)
    throw Error('Limite de 100 acessos intermediários por duto.');
  const ids = new Set();
  return value.map((p) => {
    if (
      !p ||
      typeof p.id !== 'string' ||
      !p.id ||
      p.id.length > 80 ||
      ids.has(p.id) ||
      !Number.isInteger(p.segment) ||
      p.segment < 0 ||
      p.segment >= points.length - 1 ||
      typeof p.t !== 'number' ||
      !Number.isFinite(p.t) ||
      p.t < 0 ||
      p.t > 1 ||
      !Object.hasOwn(ventPortTypes, p.type) ||
      ![1, -1].includes(p.side) ||
      typeof p.label !== 'string' ||
      p.label.length > 80
    )
      throw Error('Acesso intermediário inválido.');
    if (
      p.size !== undefined &&
      (typeof p.size !== 'number' || !Number.isFinite(p.size) || p.size < 0.2 || p.size > 3)
    )
      throw Error('Use largura de saída entre 0,2 e 3 m.');
    if (p.connectWall !== undefined && typeof p.connectWall !== 'boolean')
      throw Error('Ligação à parede inválida.');
    ids.add(p.id);
    return {
      id: p.id,
      segment: p.segment,
      t: p.t,
      type: p.type,
      side: p.side,
      label: p.label,
      ...(p.size !== undefined ? { size: p.size } : {}),
      ...(p.connectWall !== undefined ? { connectWall: p.connectWall } : {}),
    };
  });
}
export function remapVentPorts(source, points, index, action, closed) {
  return source.ports.map((port) => ({
    ...port,
    ...remapPathAnchor(
      port.segment,
      port.t,
      source.points.length,
      index,
      action,
      closed,
      (successor) => ({
        point: ventPortPosition(source.points, port),
        a: points[successor],
        b: points[successor + 1],
      }),
    ),
  }));
}
