// Pure geometry: no editor state, snapping policy or domain imports.
// A zero-length segment has no projection, matching existing callers.
export function projectPointToSegment(point, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return null;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  return {
    t,
    x: a.x + t * dx,
    y: a.y + t * dy,
    distance: Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy),
  };
}
