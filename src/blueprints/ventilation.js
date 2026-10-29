import { nearestWall, openingHasWall, wallSegments } from './model.js';
export const ventAccessTypes = {
  auto: 'Automático',
  grille: 'Grelha',
  hatch: 'Escotilha (legado)',
  ceiling: 'Acesso no teto · círculo',
  floor: 'Acesso no chão · X',
  open: 'Aberto',
  cap: 'Tampado',
};
import { isClosedVent } from './vent-cycle.js';
export { isClosedVent, closeVentPoints } from './vent-cycle.js';
// Only endpoints connect; crossing centerlines alone never joins networks.
export function ventConnection(vent, index, elements) {
  if ((vent.accesses?.[index] || 'auto') !== 'auto') return null;
  const point = index ? vent.points.at(-1) : vent.points[0];
  let best = null;
  for (const target of elements) {
    if (target.kind !== 'vent' || target.id === vent.id || target.hidden) continue;
    for (let i = 1; i < target.points.length; i++) {
      const a = target.points[i - 1],
        b = target.points[i];
      const dx = b.x - a.x,
        dy = b.y - a.y,
        length = dx * dx + dy * dy;
      if (!length) continue;
      const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length));
      if (
        (i === 1 && t === 0 && (target.accesses?.[0] || 'auto') !== 'auto') ||
        (i === target.points.length - 1 && t === 1 && (target.accesses?.[1] || 'auto') !== 'auto')
      )
        continue;
      const x = a.x + t * dx,
        y = a.y + t * dy,
        distance = Math.hypot(x - point.x, y - point.y);
      if (distance <= 0.15 && (!best || distance < best.distance))
        best = { x, y, distance, targetId: target.id };
    }
  }
  return best;
}
export function ventNetworks(elements) {
  const vents = elements.filter((e) => e.kind === 'vent' && !e.hidden);
  const parent = new Map(vents.map((e) => [e.id, e.id]));
  const root = (id) => {
    while (parent.get(id) !== id) id = parent.get(id);
    return id;
  };
  for (const vent of vents)
    for (const index of [0, 1]) {
      const match = ventConnection(vent, index, vents);
      if (match) parent.set(root(vent.id), root(match.targetId));
    }
  const groups = new Map();
  for (const vent of vents) {
    const key = root(vent.id);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(vent);
  }
  return [...groups.values()];
}
export function ventAccess(vent, index, elements) {
  if (isClosedVent(vent)) return { ...vent.points[0], type: 'junction', angle: 0 };
  const connection = ventConnection(vent, index, elements);
  if (connection) return { x: connection.x, y: connection.y, type: 'junction', angle: 0 };
  const point = index ? vent.points.at(-1) : vent.points[0],
    other = index ? vent.points.at(-2) : vent.points[1];
  let angle = (Math.atan2(point.y - other.y, point.x - other.x) * 180) / Math.PI;
  const surfaces = elements.filter(
    (e) => ['room', 'ellipse', 'polygon', 'partition'].includes(e.kind) && !e.hidden,
  );
  const candidate = nearestWall(surfaces, point, 0.3);
  const wall =
    candidate && openingHasWall({ ...candidate, width: vent.width }, surfaces) ? candidate : null;
  const inside = surfaces.some((e) => {
    if (e.kind === 'partition') return false;
    let found = false;
    for (const [a, b] of wallSegments(e)) {
      if (
        a[1] > point.y !== b[1] > point.y &&
        point.x < ((b[0] - a[0]) * (point.y - a[1])) / (b[1] - a[1]) + a[0]
      )
        found = !found;
    }
    return found;
  });
  const requested = vent.accesses?.[index] || 'auto';
  const type = requested === 'auto' ? (wall ? 'grille' : inside ? 'hatch' : 'open') : requested;
  let position = point;
  if (type === 'grille' && wall) {
    const [a, b] = wallSegments(surfaces.find((e) => e.id === wall.wallId))[wall.segment];
    position = { x: a[0] + (b[0] - a[0]) * wall.t, y: a[1] + (b[1] - a[1]) * wall.t };
    angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  }
  return { ...position, type, angle };
}
export function ventSeams(vent) {
  const result = [];
  for (let i = 1; i < vent.points.length; i++) {
    const a = vent.points[i - 1],
      b = vent.points[i],
      length = Math.hypot(b.x - a.x, b.y - a.y),
      count = Math.min(40, Math.floor(length / Math.max(1, vent.width * 1.5)));
    for (let j = 1; j <= count; j++) {
      const t = j / (count + 1);
      result.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      });
    }
    if (result.length >= 400) break;
  }
  return result.slice(0, 400);
}

// Bind from the previous geometry so old projects and copied modules need no ID metadata.
export function followVentWalls(previous, next) {
  if (previous === next || previous.activeFloor !== next.activeFloor) return next;
  const oldById = new Map(previous.elements.map((e) => [e.id, e]));
  const nextById = new Map(next.elements.map((e) => [e.id, e]));
  const walls = previous.elements.filter(
    (e) => ['room', 'ellipse', 'polygon', 'partition'].includes(e.kind) && !e.hidden,
  );
  if (
    !walls.some(
      (e) =>
        nextById.has(e.id) &&
        JSON.stringify(wallSegments(e)) !== JSON.stringify(wallSegments(nextById.get(e.id))),
    )
  )
    return next;
  let changed = false;
  const elements = next.elements.map((vent) => {
    const old = oldById.get(vent.id);
    if (vent.kind !== 'vent' || !old || old.kind !== 'vent') return vent;
    let points = vent.points;
    for (const index of [0, 1]) {
      const i = index ? points.length - 1 : 0;
      const oldPoint = index ? old.points.at(-1) : old.points[0];
      // Explicit movement of the duct takes precedence over the wall relationship.
      if (points[i].x !== oldPoint.x || points[i].y !== oldPoint.y) continue;
      if (!['auto', 'grille'].includes(vent.accesses?.[index] || 'auto')) continue;
      if (ventAccess(old, index, previous.elements).type !== 'grille') continue;
      const anchor = nearestWall(walls, oldPoint, 0.3);
      if (!anchor) continue;
      const wall = nextById.get(anchor.wallId);
      if (!wall || wall.hidden || !openingHasWall({ ...anchor, width: vent.width }, next.elements))
        continue;
      const edge = wallSegments(wall)[anchor.segment];
      const oldEdge = wallSegments(oldById.get(wall.id))[anchor.segment];
      if (JSON.stringify(edge) === JSON.stringify(oldEdge)) continue;
      if (!edge) continue;
      const [a, b] = edge;
      const point = { x: a[0] + (b[0] - a[0]) * anchor.t, y: a[1] + (b[1] - a[1]) * anchor.t };
      if (point.x === points[i].x && point.y === points[i].y) continue;
      if (points === vent.points) points = [...points];
      points[i] = point;
    }
    if (points === vent.points) return vent;
    changed = true;
    return { ...vent, points };
  });
  return changed ? { ...next, elements } : next;
}
