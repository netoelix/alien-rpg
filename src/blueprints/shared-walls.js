import { doorPosition, wallSections, wallSegments } from './model.js';

// Resolve only the visual anchor; saved openings remain attached to their room.
export function sharedOpeningAnchor(opening, elements) {
  const anchor = doorPosition(opening, elements);
  if (!anchor) return opening;
  const structure = elements.filter((element) =>
    ['room', 'ellipse', 'polygon', 'corridor'].includes(element.kind),
  );
  const angle = (anchor.rotation * Math.PI) / 180;
  for (const element of sharedWallStructures(structure)) {
    if (element.joinWalls && element.id !== opening.wallId) continue;
    for (const section of wallSections(element)) {
      if (section.type === 'open') continue;
      const [a, b] = wallSegments(element)[section.segment];
      const dx = b[0] - a[0],
        dy = b[1] - a[1];
      const length = Math.hypot(dx, dy);
      if (!length) continue;
      if (Math.abs(dx * Math.sin(angle) - dy * Math.cos(angle)) / length > 1e-7) continue;
      if (Math.abs(dx * (anchor.y - a[1]) - dy * (anchor.x - a[0])) / length > 1e-7) continue;
      const t = ((anchor.x - a[0]) * dx + (anchor.y - a[1]) * dy) / (length * length);
      if (t <= section.start + 1e-7 || t >= section.end - 1e-7) continue;
      return { ...opening, wallId: element.id, segment: section.segment, t };
    }
  }
  return opening;
}

// Resolve overlapping collinear sections before rendering. Keep original data
// intact so moving an environment apart restores its own complete walls.
export function sharedWallStructures(structure) {
  const candidates = structure.flatMap((element) =>
    wallSections(element)
      .filter((wall) => wall.type !== 'open')
      .map((wall) => ({ ...wall, owner: element.id, manual: !element.joinWalls })),
  );
  const priority = (a, b) => Number(b.manual) - Number(a.manual) || a.owner.localeCompare(b.owner);
  candidates.sort(priority);
  return structure.map((element) => ({
    ...element,
    walls: (element.walls || []).flatMap((wall) => {
      if (wall.type === 'open') return [wall];
      const current = candidates.find(
        (item) =>
          item.owner === element.id && item.segment === wall.segment && item.start === wall.start,
      );
      if (!current) return [wall];
      const dx = current.b[0] - current.a[0],
        dy = current.b[1] - current.a[1];
      const length = Math.hypot(dx, dy);
      let intervals = [[0, 1]];
      for (const other of candidates) {
        if (other.owner === element.id || priority(other, current) >= 0) continue;
        const cross = (point) =>
          Math.abs(dx * (point[1] - current.a[1]) - dy * (point[0] - current.a[0])) / length;
        if (cross(other.a) > 1e-7 || cross(other.b) > 1e-7) continue;
        const project = (point) =>
          ((point[0] - current.a[0]) * dx + (point[1] - current.a[1]) * dy) / (length * length);
        const start = Math.min(project(other.a), project(other.b));
        const end = Math.max(project(other.a), project(other.b));
        intervals = intervals.flatMap(([a, b]) => {
          if (end <= a || start >= b) return [[a, b]];
          return [...(start > a ? [[a, start]] : []), ...(end < b ? [[end, b]] : [])];
        });
      }
      return intervals.map(([a, b]) => ({
        ...wall,
        start: wall.start + a * (wall.end - wall.start),
        end: wall.start + b * (wall.end - wall.start),
      }));
    }),
  }));
}
