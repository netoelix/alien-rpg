import { activeFloor, floorList } from './floors.js';
import { floorElements } from './connections.js';
import { wallSegments } from './model.js';
export function stairDestinations(project, element) {
  if (element.asset !== 'stairs') return [];
  const current = activeFloor(project),
    floors = floorList(project);
  return (project.connections || []).flatMap((link) => {
    const other =
      link.from.floorId === current && link.from.elementId === element.id
        ? link.to
        : link.to.floorId === current && link.to.elementId === element.id
          ? link.from
          : null;
    if (!other) return [];
    const floor = floors.find((f) => f.id === other.floorId),
      elements = floorElements(project, other.floorId),
      target = elements.find((e) => e.id === other.elementId);
    if (!floor || !target) return [];
    const x = target.x + target.w / 2,
      y = target.y + target.h / 2;
    const rooms = elements
      .filter((e) => ['room', 'ellipse', 'polygon'].includes(e.kind))
      .map((room) => {
        let inside = false,
          area = 0;
        for (const [a, b] of wallSegments(room)) {
          if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0])
            inside = !inside;
          area += a[0] * b[1] - b[0] * a[1];
        }
        return { room, inside, area: Math.abs(area) };
      })
      .filter((e) => e.inside)
      .sort((a, b) => a.area - b.area);
    const name = rooms[0]?.room.name?.trim();
    return [
      (floors.findIndex((f) => f.id === other.floorId) > floors.findIndex((f) => f.id === current)
        ? '↑ '
        : '↓ ') +
        floor.name +
        (name ? ' · ' + name : ''),
    ];
  });
}
