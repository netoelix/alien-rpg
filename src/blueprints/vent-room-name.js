import { wallSegments } from './model.js';
// Test the point and a small neighbourhood: wall-mounted grilles sit on the boundary.
export function ventRoomName(elements, point) {
  if (!point) return '';
  const rooms = elements.filter(
    (e) => !e.hidden && ['room', 'ellipse', 'polygon', 'corridor'].includes(e.kind),
  );
  const contains = (edges, x, y) => {
    let inside = false;
    for (const [a, b] of edges)
      if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0])
        inside = !inside;
    return inside;
  };
  const candidates = rooms
    .map((room) => {
      const edges = wallSegments(room);
      let area = 0;
      for (const [a, b] of edges) area += a[0] * b[1] - b[0] * a[1];
      const direct = contains(edges, point.x, point.y);
      const near =
        direct ||
        [
          [0.15, 0],
          [-0.15, 0],
          [0, 0.15],
          [0, -0.15],
        ].some(([x, y]) => contains(edges, point.x + x, point.y + y));
      return { room, near, direct, area: Math.abs(area) };
    })
    .filter((x) => x.near)
    .sort((a, b) => Number(b.direct) - Number(a.direct) || a.area - b.area);
  return candidates[0]?.room.name?.trim() || '';
}
