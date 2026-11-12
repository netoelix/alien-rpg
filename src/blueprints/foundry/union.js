import { wallSegments } from '../model.js';
import { corridorCorners } from '../wall-geometry.js';
import { persistentWallStructure } from '../shared-walls.js';
import { arcEdges } from './arc-edges.js';

const polygonEdges = (points) => points.map((p, i) => [p, points[(i + 1) % points.length]]);
export function floorContours(elements) {
  return elements.flatMap((e) => {
    if (['room', 'polygon', 'ellipse'].includes(e.kind)) return [wallSegments(e)];
    if (e.kind !== 'corridor') return [];
    // An SVG round-joined, butt-capped stroke is the union of its segment
    // rectangles and outer corner sectors. These independent polygons also
    // handle crossings without the holes an even-odd single outline produces.
    const contours = e.points.slice(1).flatMap((b, i) => {
      const a = e.points[i],
        length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!length) return [];
      const nx = ((-(b.y - a.y) / length) * e.width) / 2,
        ny = (((b.x - a.x) / length) * e.width) / 2;
      return [
        polygonEdges([
          [a.x + nx, a.y + ny],
          [b.x + nx, b.y + ny],
          [b.x - nx, b.y - ny],
          [a.x - nx, a.y - ny],
        ]),
      ];
    });
    const full = persistentWallStructure({ ...e, joinWalls: false, walls: [] });
    for (const corner of corridorCorners(full)) {
      const edges = arcEdges(corner);
      if (!edges.length) continue;
      const start = edges[0][0],
        end = edges.at(-1)[1];
      const center = e.points
        .slice(1, -1)
        .find(
          (p) =>
            Math.abs(Math.hypot(start[0] - p.x, start[1] - p.y) - e.width / 2) < 1e-6 &&
            Math.abs(Math.hypot(end[0] - p.x, end[1] - p.y) - e.width / 2) < 1e-6,
        );
      if (center)
        contours.push([...edges, [end, [center.x, center.y]], [[center.x, center.y], start]]);
    }
    return contours;
  });
}

const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const sub = (a, b) => a.map((v, i) => v - b[i]);
const at = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function inside(point, edges) {
  let result = false;
  for (const [a, b] of edges) {
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < a[0] + ((point[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1])
    )
      result = !result;
  }
  return result;
}

// Clip joined boundaries at every intersection, including collinear seams.
// Sampling both sides retains the exterior of coincident shapes but removes
// a shared wall when the union has floor on both sides.
export function joinedBoundaryPieces(a, b, elements, contours = floorContours(elements)) {
  const direction = sub(b, a),
    length = Math.hypot(...direction);
  if (!length) return [];
  const cuts = [0, 1];
  for (const edges of contours)
    for (const [c, d] of edges) {
      const other = sub(d, c),
        offset = sub(c, a),
        denominator = cross(direction, other);
      if (Math.abs(denominator) > 1e-10) {
        const t = cross(offset, other) / denominator,
          u = cross(offset, direction) / denominator;
        if (t > 0 && t < 1 && u >= -1e-8 && u <= 1 + 1e-8) cuts.push(t);
      } else if (Math.abs(cross(offset, direction)) / length < 1e-8) {
        for (const p of [c, d]) {
          const delta = sub(p, a),
            t = (delta[0] * direction[0] + delta[1] * direction[1]) / (length * length);
          if (t > 0 && t < 1) cuts.push(t);
        }
      }
    }
  cuts.sort((x, y) => x - y);
  const pieces = [];
  for (let i = 1; i < cuts.length; i++) {
    if (cuts[i] - cuts[i - 1] < 1e-9) continue;
    const middle = at(a, b, (cuts[i] + cuts[i - 1]) / 2);
    const epsilon = Math.min(1e-6, (length * (cuts[i] - cuts[i - 1])) / 10);
    const normal = [(-direction[1] / length) * epsilon, (direction[0] / length) * epsilon];
    const left = middle.map((v, j) => v + normal[j]),
      right = middle.map((v, j) => v - normal[j]);
    if (
      contours.some((edges) => inside(left, edges)) &&
      contours.some((edges) => inside(right, edges))
    )
      continue;
    pieces.push({ a: at(a, b, cuts[i - 1]), b: at(a, b, cuts[i]) });
  }
  return pieces;
}
