export const circulationTypes = { path: 'Caminho', sidewalk: 'Calçada', road: 'Rua' };
export const isCirculation = (e) =>
  e.kind === 'trace' && Object.hasOwn(circulationTypes, e.traceType);
export function circulationStyle(e) {
  return {
    edge: e.edge ?? (e.traceType === 'path' ? 'line' : 'curb'),
    finish:
      e.traceType === 'road'
        ? 'smooth'
        : (e.surface ?? (e.traceType === 'sidewalk' ? 'slabs' : 'smooth')),
    markings: e.markings === true,
  };
}
export function normalizeCirculation(e) {
  const s = circulationStyle(e);
  if (
    !['none', 'line', 'curb'].includes(s.edge) ||
    !['smooth', 'slabs'].includes(s.finish) ||
    (e.surface !== undefined && !['smooth', 'slabs'].includes(e.surface)) ||
    (e.markings !== undefined && typeof e.markings !== 'boolean')
  )
    throw new Error('Acabamento de circulação inválido.');
  return { edge: s.edge, surface: s.finish, markings: s.markings };
}
export function traceBounds(e) {
  const pad = e.width / 2 + 0.2;
  return {
    left: Math.min(...e.points.map((p) => p.x)) - pad,
    right: Math.max(...e.points.map((p) => p.x)) + pad,
    top: Math.min(...e.points.map((p) => p.y)) - pad,
    bottom: Math.max(...e.points.map((p) => p.y)) + pad,
  };
}
export function overlappingTraces(a, b) {
  const x = traceBounds(a),
    y = traceBounds(b);
  return x.left <= y.right && x.right >= y.left && x.top <= y.bottom && x.bottom >= y.top;
}
// Equal-distance joints perpendicular to the local path, with bounded SVG complexity.
export function pavementJoints(points, width, inset = 0.18) {
  const segments = points
    .slice(1)
    .map((b, i) => {
      const a = points[i],
        length = Math.hypot(b.x - a.x, b.y - a.y);
      return { a, b, length };
    })
    .filter((s) => s.length > 1e-6);
  const total = segments.reduce((n, s) => n + s.length, 0),
    spacing = Math.max(1.5, width * 0.6, total / 600);
  const half = Math.max(0.02, width / 2 - Math.min(inset, width * 0.2));
  const joints = [];
  let traveled = 0,
    next = spacing / 2;
  for (const s of segments) {
    while (next < traveled + s.length && joints.length < 600) {
      const t = (next - traveled) / s.length,
        x = s.a.x + (s.b.x - s.a.x) * t,
        y = s.a.y + (s.b.y - s.a.y) * t;
      const nx = -(s.b.y - s.a.y) / s.length,
        ny = (s.b.x - s.a.x) / s.length;
      joints.push({
        a: { x: x - nx * half, y: y - ny * half },
        b: { x: x + nx * half, y: y + ny * half },
      });
      next += spacing;
    }
    traveled += s.length;
  }
  return joints;
}
