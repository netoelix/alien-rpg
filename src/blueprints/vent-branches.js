import { wallSegments, openingHasWall } from './model.js';
import { ventPortPosition } from './vent-ports.js';
// Cast only toward the chosen side, so a nearby wall behind the duct is never selected.
export function ventBranch(vent, port, elements) {
  if (port.type !== 'grille' || !port.connectWall) return null;
  const start = ventPortPosition(vent.points, port, vent.width);
  if (!start) return null;
  const angle = (start.angle * Math.PI) / 180,
    ray = { x: -Math.sin(angle) * port.side, y: Math.cos(angle) * port.side };
  const surfaces = elements.filter(
    (e) => !e.hidden && ['room', 'ellipse', 'polygon', 'corridor', 'partition'].includes(e.kind),
  );
  let best = null;
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  for (const wall of surfaces)
    for (const [segment, [a, b]] of wallSegments(wall).entries()) {
      const edge = { x: b[0] - a[0], y: b[1] - a[1] },
        den = cross(ray, edge);
      if (Math.abs(den) < 1e-8) continue;
      const diff = { x: a[0] - start.x, y: a[1] - start.y },
        distance = cross(diff, edge) / den,
        t = cross(diff, ray) / den;
      const size = port.size ?? Math.min(0.65, vent.width * 0.8),
        half = size / 2 / Math.max(0.0001, Math.hypot(edge.x, edge.y));
      if (
        distance < 0.001 ||
        distance > 2 ||
        t < half ||
        t > 1 - half ||
        (best && best.distance <= distance)
      )
        continue;
      if (!openingHasWall({ wallId: wall.id, segment, t, width: size }, surfaces)) continue;
      best = {
        start,
        end: { x: start.x + ray.x * distance, y: start.y + ray.y * distance },
        distance,
        angle: (Math.atan2(edge.y, edge.x) * 180) / Math.PI,
        wallId: wall.id,
      };
    }
  return best;
}
