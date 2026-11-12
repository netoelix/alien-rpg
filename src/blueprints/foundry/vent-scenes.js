import { floorElements } from '../floor-store.js';
import { ventNetworks, ventAccess, isClosedVent } from '../ventilation.js';
import { ventPortPosition } from '../vent-ports.js';
import { buildFoundryBarriers } from './barriers.js';
import { inFloor } from './wall-center.js';

function roomArrival(center, width, elements, grid) {
  const rooms = elements.filter((e) => ['room', 'polygon', 'ellipse', 'corridor'].includes(e.kind));
  const r = Math.max(width, grid) / 2;
  const fits = (p) =>
    [
      [-r, -r],
      [r, -r],
      [r, r],
      [-r, r],
    ].every(([x, y]) => rooms.some((e) => inFloor([p.x + x, p.y + y], e)));
  if (fits(center)) return center;
  for (const distance of [r + 0.15, 2 * r + 0.15])
    for (let i = 0; i < 8; i++) {
      const p = {
        x: center.x + Math.cos((i * Math.PI) / 4) * distance,
        y: center.y + Math.sin((i * Math.PI) / 4) * distance,
      };
      if (fits(p)) return p;
    }
  return center;
}

export function buildVentScenes(project, floors, sceneKeys, pixelsPerMeter) {
  const scenes = [],
    locations = new Map(),
    entrances = [];
  for (const floor of floors) {
    const elements = floorElements(project, floor.id).filter((e) => !e.hidden);
    const groups = ventNetworks(elements);
    for (let index = 0; index < groups.length; index++) {
      const group = groups[index],
        key = `${sceneKeys.get(floor.id)}-vents-${index + 1}`;
      const corridors = group.map((vent) => {
        const closed = isClosedVent(vent);
        const ends = [ventAccess(vent, 0, elements), ventAccess(vent, 1, elements)];
        let points = vent.points.map((p, i) =>
          i === 0
            ? { x: ends[0].x, y: ends[0].y }
            : i === vent.points.length - 1
              ? { x: ends[1].x, y: ends[1].y }
              : { ...p },
        );
        if (closed) points = [points.at(-2), ...points, points[1]];
        locations.set(JSON.stringify([floor.id, vent.id]), key);
        if (!closed)
          for (let tip = 0; tip < 2; tip++) {
            if (['junction', 'cap'].includes(ends[tip].type)) continue;
            // Keep the arrival within the duct rather than exactly on its end cap.
            const p = points[tip ? points.length - 1 : 0],
              q = points[tip ? points.length - 2 : 1];
            const length = Math.hypot(q.x - p.x, q.y - p.y),
              inset = Math.min(vent.width / 2, length / 2);
            const center = {
              x: p.x + ((q.x - p.x) / length) * inset,
              y: p.y + ((q.y - p.y) / length) * inset,
            };
            entrances.push({
              floorId: floor.id,
              sceneKey: key,
              elementId: vent.id,
              portId: `tip-${tip}`,
              center,
              floorCenter: roomArrival(p, vent.width, elements, project.grid),
              width: vent.width,
              name: 'Acesso ao duto',
            });
          }
        for (const port of vent.ports || []) {
          const linked = (project.ventLinks || []).some((link) =>
            [link.from, link.to].some(
              (e) => e.floorId === floor.id && e.elementId === vent.id && e.portId === port.id,
            ),
          );
          if (!linked) {
            const center = ventPortPosition(vent.points, port);
            entrances.push({
              floorId: floor.id,
              sceneKey: key,
              elementId: vent.id,
              portId: port.id,
              center,
              floorCenter: roomArrival(center, vent.width, elements, project.grid),
              width: vent.width,
              name: port.label || 'Acesso ao duto',
            });
          }
        }
        return {
          id: vent.id,
          kind: 'corridor',
          points,
          width: vent.width + 0.06,
          joinWalls: true,
          closedStart: !closed,
          closedEnd: !closed,
        };
      });
      scenes.push({
        key,
        name: `${project.name} - ${floor.name} - Ventilação ${index + 1}`,
        sourceFloorId: floor.id,
        kind: 'ventilation',
        width: project.width * pixelsPerMeter,
        height: project.height * pixelsPerMeter,
        grid: { distance: project.grid, size: project.grid * pixelsPerMeter },
        elements: elements.filter((e) => e.kind !== 'vent' || group.includes(e)),
        geometry: buildFoundryBarriers(corridors, pixelsPerMeter, { wallPlacement: 'edge' }),
      });
    }
  }
  return { scenes, locations, entrances };
}
