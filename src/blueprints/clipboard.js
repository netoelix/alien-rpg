import { rotatePoint } from './orientation.js';
import { layerFor, moveElement, parseProject, uid, openingHasWall, fitOpenings } from './model.js';
import { selectionBounds } from './selection.js';

function checkLayers(project, elements) {
  if (
    elements.some((element) => {
      const layer = project.layers.find((item) => item.id === layerFor(element.kind));
      return element.hidden || element.locked || !layer?.visible || layer.locked;
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
        const p = rotatePoint(source, x, y, true);
        return (
          p.x >= source.x - 1e-8 &&
          p.x <= source.x + source.w + 1e-8 &&
          p.y >= source.y - 1e-8 &&
          p.y <= source.y + source.h + 1e-8
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
  const groups = new Map(
    clipboard.elements.filter((e) => e.groupId).map((e) => [e.groupId, uid()]),
  );
  const copies = clipboard.elements.map((element) =>
    element.kind === 'door'
      ? { ...element, id: ids.get(element.id), wallId: ids.get(element.wallId) }
      : { ...moveElement(element, dx, dy), id: ids.get(element.id) },
  );
  copies.forEach((element) => {
    if (element.groupId) element.groupId = groups.get(element.groupId);
  });
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

export function removeSelection(project, ids) {
  const removed = project.elements.filter(
    (element) => ids.includes(element.id) || ids.includes(element.wallId),
  );
  checkLayers(project, removed);
  const removedIds = new Set(removed.map((element) => element.id));
  return parseProject(
    JSON.stringify({
      ...project,
      elements: project.elements.filter((element) => !removedIds.has(element.id)),
    }),
  );
}

export function duplicateSelection(project, ids) {
  // Duplicate exactly the selected pieces plus dependent openings. Unlike copying
  // a single room, do not silently include unselected equipment inside it.
  const elements = project.elements.filter(
    (element) => ids.includes(element.id) || ids.includes(element.wallId),
  );
  checkLayers(project, elements);
  const roots = elements.filter((element) => element.kind !== 'door');
  if (!roots.length) throw new Error('Selecione uma estrutura ou peça para duplicar.');
  if (elements.some((element) => element.kind === 'door' && !ids.includes(element.wallId)))
    throw new Error('Selecione também a estrutura das portas e janelas.');
  const clipboard = { selectedId: roots[0].id, elements };
  const step = project.grid;
  const boxes = roots.map(selectionBounds);
  const width =
    Math.ceil(
      (Math.max(...boxes.map((b) => b.x + b.w)) - Math.min(...boxes.map((b) => b.x))) / step,
    ) *
      step +
    step;
  const height =
    Math.ceil(
      (Math.max(...boxes.map((b) => b.y + b.h)) - Math.min(...boxes.map((b) => b.y))) / step,
    ) *
      step +
    step;
  for (const [dx, dy] of [
    [step, step],
    [-step, -step],
    [step, 0],
    [-step, 0],
    [0, step],
    [0, -step],
    [width, 0],
    [-width, 0],
    [0, height],
    [0, -height],
  ]) {
    try {
      const copy = pasteBlueprint(project, clipboard, dx, dy);
      copy.project = fitOpenings(copy.project);
      if (
        copy.project.elements.some(
          (element) =>
            copy.ids.includes(element.id) &&
            element.kind === 'door' &&
            !openingHasWall(element, copy.project.elements),
        )
      )
        continue;
      return copy;
    } catch {
      /* Try another offset within the map. */
    }
  }
  throw new Error('Não há espaço para duplicar a seleção. Amplie a planta ou remova peças.');
}
