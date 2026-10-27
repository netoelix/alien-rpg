export const waterFinishes = { pool: 'Água · piscina', lake: 'Água · lago' };
export function waterRegionPath(points, smooth = false) {
  if (points.length < 3) return '';
  if (!smooth) return points.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ') + 'Z';
  const mid = (a, b) => `${(a.x + b.x) / 2} ${(a.y + b.y) / 2}`;
  return (
    'M' +
    mid(points.at(-1), points[0]) +
    points.map((p, i) => `Q${p.x} ${p.y} ${mid(p, points[(i + 1) % points.length])}`).join(' ') +
    'Z'
  );
}
