import { nearestWall, fitOpenings, openingHasWall } from './model.js';
import { objectEditable } from './objects.js';
export function openingCandidate(project, point, width, openingType, maxDistance) {
  const hit = nearestWall(
    project.elements.filter((e) => objectEditable(project, e)),
    point,
    maxDistance,
  );
  if (!hit) return { error: 'Aproxime o cursor de uma parede.' };
  const element = {
    id: 'placement-preview',
    kind: 'door',
    openingType,
    wallId: hit.wallId,
    segment: hit.segment,
    t: hit.t,
    width,
  };
  try {
    const fitted = fitOpenings({
      ...project,
      elements: [...project.elements, element],
    }).elements.at(-1);
    if (!openingHasWall(fitted, project.elements))
      return { element: fitted, error: 'Este trecho não possui parede.' };
    return { element: fitted };
  } catch (e) {
    return { element, error: e.message };
  }
}
