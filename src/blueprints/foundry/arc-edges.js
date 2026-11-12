export function arcEdges(corner) {
  const numbers = corner.d.match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi).map(Number);
  const [ax, ay, r, , , , sweep, bx, by] = numbers;
  const dx = bx - ax,
    dy = by - ay,
    d = Math.hypot(dx, dy);
  if (!d) return [];
  const height = Math.sqrt(Math.max(0, r * r - (d * d) / 4));
  const sign = sweep ? 1 : -1;
  const cx = (ax + bx) / 2 - ((sign * dy) / d) * height,
    cy = (ay + by) / 2 + ((sign * dx) / d) * height;
  const start = Math.atan2(ay - cy, ax - cx);
  let delta = Math.atan2(by - cy, bx - cx) - start;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  const count = Math.max(2, Math.ceil(Math.abs(delta) / (Math.PI / 32)));
  const points = Array.from({ length: count + 1 }, (_, i) => [
    cx + r * Math.cos(start + (delta * i) / count),
    cy + r * Math.sin(start + (delta * i) / count),
  ]);
  points[0] = [ax, ay];
  points[count] = [bx, by];
  return points.slice(1).map((p, i) => [points[i], p]);
}
