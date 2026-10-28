import { traceGeometry } from './trace-geometry.js';
export const reliefTypes = { talus: 'Talude', cliff: 'Penhasco' };
export function reliefGeometry(element) {
  const geometry = traceGeometry(element);
  const fractures = geometry.marks.map((mark, i) => {
    const dx = mark.b.x - mark.a.x,
      dy = mark.b.y - mark.a.y;
    const at = (t, bend = 0) => ({
      x: mark.a.x + dx * t - dy * bend,
      y: mark.a.y + dy * t + dx * bend,
    });
    return element.traceType === 'talus'
      ? [mark.a, at(i % 2 ? 0.58 : 1)]
      : [
          mark.a,
          at(0.33, i % 2 ? 0.13 : -0.13),
          at(0.65, i % 2 ? -0.1 : 0.1),
          at(0.85 + (i % 3) * 0.08),
        ];
  });
  return { center: geometry.center, fractures };
}
