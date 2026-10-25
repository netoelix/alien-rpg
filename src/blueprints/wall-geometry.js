import { doorPosition, wallSections, wallSegments } from './model.js';
import { sharedOpeningAnchor } from './shared-walls.js';

export const wallWidths = { internal: 0.2, structural: 0.45, hull: 0.7, glass: 0.2 };
const samePoint = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-7;

// Unpainted intervals still have the default wall drawn by the floor outline.
// Include them in junction calculations without changing the saved project.
export function junctionWallSections(element) {
  const walls = [...(element.walls || [])];
  wallSegments(element).forEach((edge, segment) => {
    const painted = walls
      .filter((wall) => wall.segment === segment)
      .sort((a, b) => a.start - b.start);
    let start = 0;
    for (const wall of painted) {
      if (wall.start > start) walls.push({ segment, start, end: wall.start, type: 'internal' });
      start = Math.max(start, wall.end);
    }
    if (start < 1) walls.push({ segment, start, end: 1, type: 'internal' });
  });
  return wallSections({ ...element, walls }).filter((wall) => wall.type !== 'open');
}

// Fill only the shared corner of two different finishes. The owning floor
// and opening masks still decide which part of the junction is visible.
export function wallTransitions(element) {
  const sections = junctionWallSections(element);
  const transitions = [];
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const first = sections[i],
        second = sections[j];
      if (first.type === second.type) continue;
      const point = samePoint(first.b, second.a)
        ? first.b
        : samePoint(second.b, first.a)
          ? second.b
          : null;
      if (!point) continue;
      // Collinear intervals already meet flush; do not round their transition.
      const u = [first.b[0] - first.a[0], first.b[1] - first.a[1]];
      const v = [second.b[0] - second.a[0], second.b[1] - second.a[1]];
      if (Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-8) continue;
      transitions.push({
        x: point[0],
        y: point[1],
        radius: Math.max(wallWidths[first.type], wallWidths[second.type]),
      });
    }
  }
  return transitions;
}

// Endpoints belonging to different modules also need a common corner cap.
// The union of their floors clips the cap before opening cuts are applied.
export function sharedWallJunctions(structure) {
  const sections = structure.flatMap((element) =>
    junctionWallSections(element).map((wall) => ({ ...wall, owner: element.id })),
  );
  const joints = new Map();
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const a = sections[i],
        b = sections[j];
      if (a.owner === b.owner) continue;
      const point = [a.a, a.b].find((p) => samePoint(p, b.a) || samePoint(p, b.b));
      if (!point) continue;
      const cross = (a.b[0] - a.a[0]) * (b.b[1] - b.a[1]) - (a.b[1] - a.a[1]) * (b.b[0] - b.a[0]);
      if (Math.abs(cross) < 1e-8) continue;
      const key = point.join(':');
      const radius = Math.max(wallWidths[a.type], wallWidths[b.type], joints.get(key)?.radius || 0);
      joints.set(key, { x: point[0], y: point[1], radius });
    }
  }
  return [...joints.values()];
}

// Extend an explicit partition into the perpendicular wall band at its end.
// Unlike exterior corner caps this must survive the neighbouring floor mask.
export function partitionEndCaps(element, structure) {
  if (element.joinWalls) return [];
  const neighbours = structure
    .filter((other) => other.id !== element.id)
    .flatMap(junctionWallSections);
  const caps = [];
  for (const wall of wallSections(element).filter((wall) => wall.type !== 'open')) {
    const dx = wall.b[0] - wall.a[0],
      dy = wall.b[1] - wall.a[1];
    const length = Math.hypot(dx, dy);
    if (!length) continue;
    for (const [point, direction] of [
      [wall.a, -1],
      [wall.b, 1],
    ]) {
      let reach = 0;
      for (const other of neighbours) {
        const ux = other.b[0] - other.a[0],
          uy = other.b[1] - other.a[1];
        const size = Math.hypot(ux, uy);
        if (!size || Math.abs(dx * uy - dy * ux) < 1e-8) continue;
        const t = ((point[0] - other.a[0]) * ux + (point[1] - other.a[1]) * uy) / (size * size);
        const distance =
          Math.abs(ux * (point[1] - other.a[1]) - uy * (point[0] - other.a[0])) / size;
        if (distance > 1e-7 || t < -1e-7 || t > 1 + 1e-7) continue;
        reach = Math.max(reach, wallWidths[other.type]);
      }
      if (reach)
        caps.push({
          type: wall.type,
          d: `M ${point[0]} ${point[1]} L ${point[0] + ((direction * dx) / length) * reach} ${point[1] + ((direction * dy) / length) * reach}`,
        });
    }
  }
  return caps;
}

// Keep the saved anchor on the floor boundary. Only the rendered opening moves
// outward, to the middle of the wall band. Doors and windows share this rule.
export function openingGeometry(opening, elements) {
  opening = sharedOpeningAnchor(opening, elements);
  const anchor = doorPosition(opening, elements);
  if (!anchor) return null;
  const parent = elements.find((element) => element.id === opening.wallId);
  const [a, b] = wallSegments(parent)[opening.segment];
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const half = opening.width / (2 * length);
  const sections = (parent.walls || []).filter(
    (wall) =>
      wall.segment === opening.segment &&
      opening.t + half > wall.start &&
      opening.t - half < wall.end,
  );
  const depth = Math.max(
    wallWidths.internal,
    ...sections.map((section) => wallWidths[section.type] ?? 0),
  );
  let side = -1;
  if (parent.kind === 'partition') side = 0;
  if (parent.kind === 'corridor')
    side =
      opening.segment >= (parent.points.length - 1) * 2 ? 1 : opening.segment % 2 === 0 ? 1 : -1;
  if (parent.kind === 'polygon') {
    const area = parent.points.reduce((sum, point, index, points) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0);
    side = area > 0 ? -1 : 1;
  }
  const angle = (anchor.rotation * Math.PI) / 180;
  const offset = (side * depth) / 2;
  return {
    ...anchor,
    x: anchor.x - Math.sin(angle) * offset,
    y: anchor.y + Math.cos(angle) * offset,
    depth,
    floorSide: -side,
    frameDepth: Math.max(0.35, depth / 2 + 0.12),
  };
}

// Join adjacent sections before stroking: one continuous path produces proper
// corners for both the outline and the inset stripe of a hull.
export function corridorCorners(element) {
  if (element.kind !== 'corridor') return [];
  const edges = wallSegments(element);
  const sections = wallSections(element);
  const corners = [];
  for (let leg = 0; leg < element.points.length - 2; leg++) {
    for (let side = 0; side < 2; side++) {
      const segment = leg * 2 + side;
      const before = sections.find((wall) => wall.segment === segment && wall.end === 1);
      const after = sections.find((wall) => wall.segment === segment + 2 && wall.start === 0);
      if (!before || !after || before.type === 'open' || after.type === 'open') continue;
      const a = edges[segment][1],
        b = edges[segment + 2][0];
      if (samePoint(a, b)) continue;
      const p = element.points[leg],
        v = element.points[leg + 1],
        q = element.points[leg + 2];
      const cross = (v.x - p.x) * (q.y - v.y) - (v.y - p.y) * (q.x - v.x);
      // The inside corner is already covered by the floor mask.
      if (Math.abs(cross) < 1e-8 || (side === 0 ? cross > 0 : cross < 0)) continue;
      const type = wallWidths[before.type] <= wallWidths[after.type] ? before.type : after.type;
      const radius = element.width / 2;
      corners.push({
        type,
        d: `M ${a[0]} ${a[1]} A ${radius} ${radius} 0 0 ${cross > 0 ? 1 : 0} ${b[0]} ${b[1]}`,
      });
    }
  }
  return corners;
}
export function wallRuns(element) {
  const remaining = wallSections(element).filter((wall) => wall.type !== 'open');
  if (element.kind === 'corridor') {
    const edges = wallSegments(element);
    for (const before of remaining) {
      const after = remaining.find(
        (wall) =>
          wall.segment < (element.points.length - 1) * 2 &&
          wall.segment === before.segment + 2 &&
          wall.start === 0 &&
          before.end === 1 &&
          wall.type === before.type,
      );
      if (!after) continue;
      const [a, b] = edges[before.segment],
        [c, d] = edges[after.segment];
      const ux = b[0] - a[0],
        uy = b[1] - a[1];
      const vx = d[0] - c[0],
        vy = d[1] - c[1];
      const cross = ux * vy - uy * vx;
      const inside = before.segment % 2 === 0 ? cross > 0 : cross < 0;
      if (!inside || Math.abs(cross) < 1e-8) continue;
      const t = ((c[0] - a[0]) * vy - (c[1] - a[1]) * vx) / cross;
      const point = [a[0] + t * ux, a[1] + t * uy];
      // Avoid long miters at nearly reversed bends.
      if (Math.hypot(point[0] - b[0], point[1] - b[1]) > element.width * 2) continue;
      before.b = point;
      after.a = point;
    }
  }
  const runs = [];
  while (remaining.length) {
    const first = remaining.shift();
    const points = [first.a, first.b];
    let changed = true;
    while (changed) {
      changed = false;
      const after = remaining.findIndex(
        (wall) =>
          wall.type === first.type &&
          (samePoint(points.at(-1), wall.a) || samePoint(points.at(-1), wall.b)),
      );
      if (after >= 0) {
        const edge = remaining.splice(after, 1)[0];
        points.push(samePoint(points.at(-1), edge.a) ? edge.b : edge.a);
        changed = true;
      }
      const before = remaining.findIndex(
        (wall) =>
          wall.type === first.type &&
          (samePoint(wall.b, points[0]) || samePoint(wall.a, points[0])),
      );
      if (before >= 0) {
        const edge = remaining.splice(before, 1)[0];
        points.unshift(samePoint(edge.b, points[0]) ? edge.a : edge.b);
        changed = true;
      }
    }
    const closed = samePoint(points[0], points.at(-1));
    if (closed) points.pop();
    runs.push({
      type: first.type,
      points,
      closed,
      d:
        points.map((point, index) => `${index ? 'L' : 'M'} ${point[0]} ${point[1]}`).join(' ') +
        (closed ? ' Z' : ''),
    });
  }
  return [...runs, ...corridorCorners(element)];
}
