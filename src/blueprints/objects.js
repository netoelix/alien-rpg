import { layerFor } from './model.js';
import { activeFloor } from './floors.js';
export function objectVisible(project, element) {
  if (element.hidden) return false;
  if (element.kind === 'door') {
    const parent = project.elements.find((item) => item.id === element.wallId);
    if (parent?.hidden) return false;
  }
  return true;
}
export function objectEditable(project, element) {
  const layer = project.layers.find((item) => item.id === layerFor(element.kind));
  const parent = element.wallId && project.elements.find((item) => item.id === element.wallId);
  return (
    objectVisible(project, element) &&
    !element.locked &&
    !parent?.locked &&
    layer?.visible &&
    !layer.locked
  );
}
export function setObjectFlag(project, id, flag, value) {
  if (!['hidden', 'locked'].includes(flag)) throw new Error('Opção de objeto inválida.');
  return {
    ...project,
    elements: project.elements.map((element) =>
      element.id === id ? { ...element, [flag]: !!value } : element,
    ),
  };
}
export function assertObjectChanges(previous, next) {
  if (activeFloor(previous) !== activeFloor(next)) return;
  // Metadata toggles remain available even while an object is locked.
  const geometry = ({ hidden, locked, name, ...element }) => JSON.stringify(element);
  for (const element of previous.elements) {
    if (
      !element.locked &&
      !element.hidden &&
      !(element.wallId && previous.elements.find((item) => item.id === element.wallId)?.locked)
    )
      continue;
    const changed = next.elements.find((item) => item.id === element.id);
    if (!changed || geometry(element) !== geometry(changed))
      throw new Error('Mostre e desbloqueie os objetos envolvidos antes de editar ou remover.');
  }
}
