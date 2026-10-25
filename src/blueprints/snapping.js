import { wallSegments, layerFor } from './model.js';
import { selectionBounds } from './selection.js';
import { objectVisible } from './objects.js';
export function snapAnchors(e) {
  if (e.kind === 'door') return [];
  const edges = wallSegments(e);
  const points = edges.flatMap(([a, b]) => [
    { x: a[0], y: a[1] },
    { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 },
  ]);
  if (!edges.length && e.points) points.push(...e.points);
  const box = selectionBounds(e);
  if (box) {
    points.push({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
    if (!edges.length)
      points.push(
        { x: box.x, y: box.y },
        { x: box.x + box.w, y: box.y },
        { x: box.x, y: box.y + box.h },
        { x: box.x + box.w, y: box.y + box.h },
      );
  }
  return points;
}
export function snapToObjects(
  project,
  point,
  { threshold = 0.5, excluded = [], moving = [], start = point } = {},
) {
  const skip = new Set(excluded);
  const targets = project.elements
    .filter(
      (e) =>
        !skip.has(e.id) &&
        objectVisible(project, e) &&
        project.layers.find((l) => l.id === layerFor(e.kind))?.visible,
    )
    .flatMap(snapAnchors);
  const sources = moving.length
    ? moving
        .flatMap(snapAnchors)
        .map((a) => ({ x: a.x + point.x - start.x, y: a.y + point.y - start.y }))
    : [point];
  let bestX = null,
    bestY = null;
  const nearest = (axis) => {
    const values = [...new Set(targets.map((t) => t[axis]))].sort((a, b) => a - b);
    let best = null;
    for (const source of sources) {
      let lo = 0,
        hi = values.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (values[mid] < source[axis]) lo = mid + 1;
        else hi = mid;
      }
      for (const index of [lo - 1, lo]) {
        if (index < 0 || index >= values.length) continue;
        const delta = values[index] - source[axis];
        if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta)))
          best = { delta, value: values[index] };
      }
    }
    return best;
  };
  bestX = nearest('x');
  bestY = nearest('y');
  return {
    x: point.x + (bestX?.delta || 0),
    y: point.y + (bestY?.delta || 0),
    guides: [
      ...(bestX ? [{ axis: 'x', value: bestX.value }] : []),
      ...(bestY ? [{ axis: 'y', value: bestY.value }] : []),
    ],
  };
}
