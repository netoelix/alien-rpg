import { layerFor, moveElement, parseProject, uid } from './model.js';

function checkLayers(project, elements) {
  if (
    elements.some((element) => {
      const layer = project.layers.find((item) => item.id === layerFor(element.kind));
      return !layer?.visible || layer.locked;
    })
  )
    throw new Error('Mostre e desbloqueie as camadas das peças copiadas.');
}

export function copyBlueprint(project, selectedId) {
  if (Array.isArray(selectedId)) {
    const roots = project.elements.filter(
      (element) => selectedId.includes(element.id) && element.kind !== 'door',
    );
    if (!roots.length) throw new Error('Selecione uma estrutura ou peça para copiar.');
    const copies = roots.flatMap((element) => copyBlueprint(project, element.id).elements);
    return {
      selectedId: roots[0].id,
      elements: [...new Map(copies.map((element) => [element.id, element])).values()],
    };
  }
  const source = project.elements.find((element) => element.id === selectedId);
  if (!source || source.kind === 'door')
    throw new Error('Selecione uma peça. Portas e janelas são copiadas junto com sua estrutura.');
  const inside = (element) => {
    if (source.kind !== 'room' || element.kind !== 'asset') return false;
    const angle = ((element.rotation || 0) * Math.PI) / 180;
    return [-1, 1].every((sx) =>
      [-1, 1].every((sy) => {
        const x =
          element.x +
          element.w / 2 +
          ((sx * element.w) / 2) * Math.cos(angle) -
          ((sy * element.h) / 2) * Math.sin(angle);
        const y =
          element.y +
          element.h / 2 +
          ((sx * element.w) / 2) * Math.sin(angle) +
          ((sy * element.h) / 2) * Math.cos(angle);
        return (
          x >= source.x && x <= source.x + source.w && y >= source.y && y <= source.y + source.h
        );
      }),
    );
  };
  const elements = project.elements.filter(
    (element) => element.id === selectedId || element.wallId === selectedId || inside(element),
  );
  checkLayers(project, elements);
  return structuredClone({ selectedId, elements });
}

export function pasteBlueprint(project, clipboard, dx, dy) {
  if (!clipboard?.elements.length) throw new Error('Copie uma peça antes de colar.');
  checkLayers(project, clipboard.elements);
  const ids = new Map(clipboard.elements.map((element) => [element.id, uid()]));
  const copies = clipboard.elements.map((element) =>
    element.kind === 'door'
      ? { ...element, id: ids.get(element.id), wallId: ids.get(element.wallId) }
      : { ...moveElement(element, dx, dy), id: ids.get(element.id) },
  );
  return {
    project: parseProject(
      JSON.stringify({ ...project, elements: [...project.elements, ...copies] }),
    ),
    selectedId: ids.get(clipboard.selectedId),
    ids: copies.map((element) => element.id),
  };
}

export function movePastedGroup(project, ids, dx, dy) {
  checkLayers(
    project,
    project.elements.filter((element) => ids.includes(element.id) || ids.includes(element.wallId)),
  );
  return {
    ...project,
    elements: project.elements.map((element) =>
      ids.includes(element.id) && element.kind !== 'door' ? moveElement(element, dx, dy) : element,
    ),
  };
}
