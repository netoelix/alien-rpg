export const ventPortTypes = {
  grille: 'Grelha lateral',
  ceiling: 'Escotilha de teto',
  floor: 'Escotilha de piso',
};
export function nearestVentPort(points, point) {
  let best = null;
  for (let segment = 0; segment < points.length - 1; segment++) {
    const a = points[segment],
      b = points[segment + 1],
      dx = b.x - a.x,
      dy = b.y - a.y,
      len = dx * dx + dy * dy;
    if (!len) continue;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / len));
    const distance = Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy);
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
export function remapVentPorts(source, points) {
  return (source.ports || []).map((port) => {
    const a = source.points[port.segment],
      b = source.points[port.segment + 1];
    const same = points.findIndex(
      (p, i) =>
        i < points.length - 1 &&
        p.x === a.x &&
        p.y === a.y &&
        points[i + 1].x === b.x &&
        points[i + 1].y === b.y,
    );
    if (same >= 0) return { ...port, segment: same };
    const match = nearestVentPort(points, ventPortPosition(source.points, port));
    return { ...port, segment: match.segment, t: match.t };
  });
}
