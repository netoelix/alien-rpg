// Keep active-floor storage knowledge here. Readers retain legacy fallback behavior.
export function floorList(project) {
  return project.floors || [{ id: 'deck-1', name: 'Pavimento 1' }];
}
export function activeFloor(project) {
  return project.activeFloor || floorList(project)[0].id;
}
export function floorElements(project, id) {
  return id === activeFloor(project)
    ? project.elements
    : floorList(project).find((f) => f.id === id)?.elements || [];
}
export function updateFloorElements(project, id, elements) {
  if (!floorList(project).some((f) => f.id === id)) throw Error('Pavimento não encontrado.');
  if (id === activeFloor(project)) return { ...project, elements };
  return {
    ...project,
    floors: floorList(project).map((f) => (f.id === id ? { ...f, elements } : f)),
  };
}
