import { traceGeometry } from './trace-geometry.js';
export const reliefTypes = { talus: 'Talude', cliff: 'Penhasco', canyon: 'Cânion' };
export function reliefGeometry(element) {
  const geometry = traceGeometry(element);
  const canyon = element.traceType === 'canyon';
  const banks = canyon ? [geometry.left, geometry.right] : [geometry.center];
  const fractures = geometry.marks.flatMap((sample, i) => {
    const marks = canyon
      ? [1, -1].map((side) => {
          const dx = (sample.b.x - sample.a.x) * side;
          const dy = (sample.b.y - sample.a.y) * side;
          const reach = 0.6 + ((i + side + 1) % 4) * 0.035;
          return {
            a: { x: sample.a.x + dx, y: sample.a.y + dy },
            b: { x: sample.a.x + dx * reach, y: sample.a.y + dy * reach },
          };
        })
      : [sample];
    return marks.map((mark) => {
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
  });
  return { center: geometry.center, banks, fractures };
}
