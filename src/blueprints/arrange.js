import { parseProject, moveElement, doorPosition } from './model.js';
import { selectionBounds } from './selection.js';
import { objectEditable } from './objects.js';
export const arrangements = {
  left: 'Alinhar à esquerda',
  centerX: 'Centralizar na horizontal',
  right: 'Alinhar à direita',
  top: 'Alinhar pelo topo',
  centerY: 'Centralizar na vertical',
  bottom: 'Alinhar pela base',
  distributeX: 'Espaçar na horizontal',
  distributeY: 'Espaçar na vertical',
};
export function arrangeEquipment(project, ids, mode) {
  if (!Object.hasOwn(arrangements, mode)) throw new Error('Alinhamento inválido.');
  const members = [...new Set(ids)].map((id) => project.elements.find((item) => item.id === id));
  const distribute = mode.startsWith('distribute');
  if (
    members.length < (distribute ? 3 : 2) ||
    members.some((item) => !item || item.kind !== 'asset' || !objectEditable(project, item))
  )
    throw new Error(
      distribute
        ? 'Selecione pelo menos três equipamentos visíveis e desbloqueados.'
        : 'Selecione pelo menos dois equipamentos visíveis e desbloqueados.',
    );
  // Refuse partial movement of a saved group, including groups containing rooms.
  if (
    members.some(
      (item) =>
        item.groupId &&
        project.elements.some((other) => other.groupId === item.groupId && !ids.includes(other.id)),
    )
  )
    throw new Error('Selecione o grupo completo ou desagrupe antes de alinhar.');
  const horizontal = ['left', 'right', 'centerX', 'distributeX'].includes(mode);
  const axis = horizontal ? 'x' : 'y',
    size = horizontal ? 'w' : 'h';
  const boxes = members.map((item) => ({ item, box: selectionBounds(item) }));
  const low = Math.min(...boxes.map(({ box }) => box[axis]));
  const high = Math.max(...boxes.map(({ box }) => box[axis] + box[size]));
  const offsets = new Map();
  if (distribute) {
    boxes.sort((a, b) => a.box[axis] - b.box[axis]);
    const first = boxes[0],
      last = boxes.at(-1);
    const span = last.box[axis] + last.box[size] - first.box[axis];
    const gap = (span - boxes.reduce((sum, { box }) => sum + box[size], 0)) / (boxes.length - 1);
    if (gap < -1e-8)
      throw new Error('Afaste os equipamentos das extremidades para distribuir sem sobreposição.');
    let position = first.box[axis];
    for (const { item, box } of boxes) {
      offsets.set(item.id, position - box[axis]);
      position += box[size] + Math.max(0, gap);
    }
  } else {
    for (const { item, box } of boxes) {
      const position = ['left', 'top'].includes(mode)
        ? low
        : ['right', 'bottom'].includes(mode)
          ? high - box[size]
          : (low + high - box[size]) / 2;
      offsets.set(item.id, position - box[axis]);
    }
  }
  return parseProject(
    JSON.stringify({
      ...project,
      elements: project.elements.map((item) =>
        offsets.has(item.id)
          ? moveElement(
              item,
              horizontal ? offsets.get(item.id) : 0,
              horizontal ? 0 : offsets.get(item.id),
            )
          : item,
      ),
    }),
  );
}
export function objectView(project, id) {
  const item = project.elements.find((element) => element.id === id);
  if (!item) throw new Error('Objeto não encontrado.');
  const door = item.kind === 'door' ? doorPosition(item, project.elements) : null;
  const box = door ? { x: door.x - 1, y: door.y - 1, w: 2, h: 2 } : selectionBounds(item);
  if (!box) throw new Error('Não foi possível localizar o objeto.');
  const zoom = Math.max(
    0.25,
    Math.min(8, project.width / (box.w + 8), project.height / (box.h + 8)),
  );
  return {
    zoom,
    x: box.x + box.w / 2 - project.width / zoom / 2,
    y: box.y + box.h / 2 - project.height / zoom / 2,
  };
}
