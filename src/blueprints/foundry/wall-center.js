import { wallSegments } from '../model.js';
import { wallWidths } from '../wall-geometry.js';

export function inFloor(p, element) {
  if (element.kind === 'corridor') {
    const radius = element.width / 2;
    for (let i = 1; i < element.points.length; i++) {
      const a = element.points[i - 1],
        b = element.points[i];
      const dx = b.x - a.x,
        dy = b.y - a.y,
        length = Math.hypot(dx, dy);
      if (!length) continue;
      const t = ((p[0] - a.x) * dx + (p[1] - a.y) * dy) / (length * length);
      if (t >= 0 && t <= 1 && Math.abs(dx * (p[1] - a.y) - dy * (p[0] - a.x)) / length < radius)
        return true;
    }
    return element.points.slice(1, -1).some((v) => Math.hypot(p[0] - v.x, p[1] - v.y) < radius);
  }
  let inside = false;
  for (const [a, b] of wallSegments(element))
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < a[0] + ((p[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1])
    )
      inside = !inside;
  return inside;
}

// Move the collision line half-way into the visible outward wall stroke.
// Reconnect shared endpoints after offsetting, including door/window jambs.
export function centerWallBarriers(barriers, owners, pixelsPerMeter) {
  const nodes = new Map();
  const shifted = barriers.map((barrier, index) => {
    const owner = owners[index];
    const a = barrier.coordinates.slice(0, 2),
      b = barrier.coordinates.slice(2);
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      length = Math.hypot(dx, dy);
    const normal = [-dy / length, dx / length];
    const middle = [(a[0] + b[0]) / 2 / pixelsPerMeter, (a[1] + b[1]) / 2 / pixelsPerMeter];
    let side = 0;
    if (owner.element.kind !== 'partition') {
      // Sample far enough to cross the small sagitta of discretized curves.
      const distance = Math.min(0.02, length / pixelsPerMeter / 4);
      const left = inFloor(
        middle.map((v, i) => v + normal[i] * distance),
        owner.element,
      );
      const right = inFloor(
        middle.map((v, i) => v - normal[i] * distance),
        owner.element,
      );
      side = left && !right ? -1 : right && !left ? 1 : 0;
    }
    const amount = (side * (wallWidths[owner.type] ?? wallWidths.internal) * pixelsPerMeter) / 2;
    const entry = {
      a: a.map((v, i) => v + normal[i] * amount),
      b: b.map((v, i) => v + normal[i] * amount),
      amount: Math.abs(amount),
    };
    entry.origin = [...entry.a];
    entry.direction = [dx, dy];
    for (const [key, point] of [
      [a.join(','), 'a'],
      [b.join(','), 'b'],
    ]) {
      if (!nodes.has(key)) nodes.set(key, []);
      nodes.get(key).push({ entry, point });
    }
    return entry;
  });
  for (const members of nodes.values()) {
    if (members.length < 2) continue;
    const points = members.map((m) => m.entry[m.point]);
    let joint = [0, 1].map((i) => points.reduce((sum, p) => sum + p[i], 0) / points.length);
    if (members.length === 2) {
      const [first, second] = members.map((m) => m.entry);
      const u = first.direction,
        v = second.direction;
      const denominator = u[0] * v[1] - u[1] * v[0];
      if (Math.abs(denominator) > 1e-8) {
        const delta = second.origin.map((x, i) => x - first.origin[i]);
        const t = (delta[0] * v[1] - delta[1] * v[0]) / denominator;
        const intersection = first.origin.map((x, i) => x + t * u[i]);
        if (
          Math.hypot(...intersection.map((x, i) => x - joint[i])) <=
          Math.max(1, first.amount, second.amount) * 4
        )
          joint = intersection;
      }
    }
    for (const member of members) member.entry[member.point] = [...joint];
  }
  return barriers.map((barrier, i) => ({
    ...barrier,
    coordinates: [...shifted[i].a, ...shifted[i].b].map((v) => Math.round(v * 1000) / 1000),
  }));
}
