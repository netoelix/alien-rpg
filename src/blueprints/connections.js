import { validVentLink } from './vent-links.js';
import { uid } from './model.js';
import { activeFloor, floorList } from './floors.js';

export function floorElements(project, id) {
  return id === activeFloor(project)
    ? project.elements
    : floorList(project).find((floor) => floor.id === id)?.elements || [];
}
export function validEndpoint(project, endpoint) {
  return (
    floorList(project).some((floor) => floor.id === endpoint.floorId) &&
    floorElements(project, endpoint.floorId).some(
      (element) =>
        element.id === endpoint.elementId &&
        element.kind === 'asset' &&
        ['stairs', 'elevator'].includes(element.asset),
    )
  );
}
export function pruneConnections(project) {
  if (project.ventLinks)
    project = { ...project, ventLinks: project.ventLinks.filter((l) => validVentLink(project, l)) };
  if (!project.connections) return project;
  return {
    ...project,
    connections: project.connections.filter(
      (link) => validEndpoint(project, link.from) && validEndpoint(project, link.to),
    ),
  };
}
export function addConnection(project, targetId, type, x, y) {
  return addConnections(project, [targetId], type, x, y);
}
export function addConnections(project, targetIds, type, x, y) {
  const ids = [...new Set(targetIds)];
  const current = activeFloor(project);
  if (
    !['stairs', 'elevator'].includes(type) ||
    !ids.length ||
    (type === 'stairs' && ids.length !== 1) ||
    ids.some((id) => id === current || !floorList(project).some((floor) => floor.id === id))
  )
    throw new Error('Escolha outro pavimento; elevadores aceitam vários destinos.');
  if (
    ![x, y].every(Number.isFinite) ||
    x < 0 ||
    y < 0 ||
    x + 2 > project.width ||
    y + 2 > project.height
  )
    throw new Error('Posicione a conexão de 2 × 2 m dentro dos limites da planta.');
  const layer = project.layers.find((item) => item.id === 'equipment');
  if (!layer?.visible || layer.locked)
    throw new Error('Mostre e desbloqueie a camada Equipamentos.');
  const stops = [current, ...ids].map((floorId) => ({
    floorId,
    element: { id: uid(), kind: 'asset', asset: type, x, y, w: 2, h: 2, rotation: 0 },
  }));
  // Each stop shares one physical asset; pairwise links allow travel from any stop.
  const links = [];
  for (let i = 0; i < stops.length; i++) {
    for (let j = i + 1; j < stops.length; j++) {
      links.push({
        id: uid(),
        from: { floorId: stops[i].floorId, elementId: stops[i].element.id },
        to: { floorId: stops[j].floorId, elementId: stops[j].element.id },
      });
    }
  }
  return {
    ...project,
    activeFloor: current,
    elements: [...project.elements, stops[0].element],
    floors: floorList(project).map((floor) => {
      const stop = stops.find((item) => item.floorId === floor.id);
      return stop && floor.id !== current
        ? { ...floor, elements: [...(floor.elements || []), stop.element] }
        : floor;
    }),
    connections: [...(project.connections || []), ...links],
  };
}
