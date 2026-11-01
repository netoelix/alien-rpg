import { parseProject, fitOpenings, openingHasWall } from './model.js';
import { pruneConnections } from './connections.js';
import { assertObjectChanges } from './objects.js';
import { followVentWalls } from './ventilation.js';

export function prepareEdit(project, next) {
  const valid = parseProject(
    JSON.stringify(pruneConnections(fitOpenings(followVentWalls(project, next)))),
  );
  assertObjectChanges(project, valid);
  for (const opening of valid.elements.filter((element) => element.kind === 'door')) {
    const previous = project.elements.find((element) => element.id === opening.id);
    if (
      JSON.stringify(previous) !== JSON.stringify(opening) &&
      !openingHasWall(opening, valid.elements)
    )
      throw new Error(
        'Este trecho está aberto. Restaure a parede em Editar paredes antes de colocar uma porta ou janela.',
      );
  }
  return valid;
}
