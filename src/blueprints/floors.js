import { uid } from './ids.js';
import { activeFloor, floorList } from './floor-store.js';
export { activeFloor, floorList } from './floor-store.js';
// The active deck lives in elements. Inactive decks hold their own snapshots.
// Existing geometry operations therefore never see objects from another deck.
export function switchFloor(project, id) {
  const current = activeFloor(project);
  const floors = floorList(project);
  const target = floors.find((floor) => floor.id === id);
  if (!target) throw new Error('Pavimento não encontrado.');
  if (id === current) return project;
  return {
    ...project,
    activeFloor: id,
    elements: target.elements || [],
    floors: floors.map((floor) =>
      floor.id === current
        ? { ...floor, elements: project.elements }
        : floor.id === id
          ? { id: floor.id, name: floor.name }
          : floor,
    ),
  };
}
export function addFloor(project, duplicate = false, basement = false) {
  const floors = floorList(project);
  if (floors.length >= 20) throw new Error('Limite de 20 pavimentos por projeto.');
  const id = uid();
  const ids = new Map(project.elements.map((element) => [element.id, uid()]));
  const groups = new Map();
  const elements = duplicate
    ? project.elements.map((element) => {
        const copy = structuredClone(element);
        copy.id = ids.get(element.id);
        if (copy.wallId) copy.wallId = ids.get(copy.wallId);
        if (copy.groupId) {
          if (!groups.has(copy.groupId)) groups.set(copy.groupId, uid());
          copy.groupId = groups.get(copy.groupId);
        }
        return copy;
      })
    : [];
  const source = floors.find((floor) => floor.id === activeFloor(project));
  let index = floors.length + 1;
  while (floors.some((floor) => floor.name === 'Pavimento ' + index)) index++;
  const name = duplicate ? source.name.slice(0, 65) + ' — cópia' : 'Pavimento ' + index;
  const groundFloor = project.groundFloor || floors[0].id;
  const depth = floors.findIndex((f) => f.id === groundFloor) + 1;
  const entry = { id, name: basement ? 'Subsolo ' + depth : name, elements };
  return switchFloor(
    {
      ...project,
      activeFloor: activeFloor(project),
      groundFloor,
      floors: basement ? [entry, ...floors] : [...floors, entry],
    },
    id,
  );
}
export function renameFloor(project, name) {
  if (!name.trim() || name.trim().length > 80) throw new Error('Use um nome de 1 a 80 caracteres.');
  return {
    ...project,
    floors: floorList(project).map((floor) =>
      floor.id === activeFloor(project) ? { ...floor, name: name.trim() } : floor,
    ),
  };
}
export function removeFloor(project) {
  const floors = floorList(project);
  if (floors.length === 1) throw new Error('Mantenha pelo menos um pavimento.');
  const id = activeFloor(project);
  const next = switchFloor(project, floors.find((floor) => floor.id !== id).id);
  const remaining = next.floors.filter((f) => f.id !== id);
  const ground = project.groundFloor || floors[0].id;
  return {
    ...next,
    floors: remaining,
    groundFloor:
      ground === id
        ? remaining[
            Math.min(
              floors.findIndex((f) => f.id === id),
              remaining.length - 1,
            )
          ].id
        : ground,
  };
}
export function reorderFloor(project, step) {
  const floors = [...floorList(project)];
  const index = floors.findIndex((f) => f.id === activeFloor(project));
  const target = index + step;
  if (Math.abs(step) !== 1 || !floors[target]) throw Error('Não há pavimento nessa direção.');
  const affected = new Set([floors[index].id, floors[target].id]);
  if (
    [...(project.connections || []), ...(project.ventLinks || [])].some(
      (link) => affected.has(link.from.floorId) || affected.has(link.to.floorId),
    )
  )
    throw Error('Desvincule as conexões verticais dos dois pavimentos antes de trocar a ordem.');
  const groundIndex = floors.findIndex((f) => f.id === (project.groundFloor || floors[0].id));
  [floors[index], floors[target]] = [floors[target], floors[index]];
  return { ...project, floors, groundFloor: floors[groundIndex].id };
}
