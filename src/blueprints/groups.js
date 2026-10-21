import { layerFor, parseProject, uid } from './model.js';
import { selectionBounds } from './selection.js';

export function rotateGroup(project, ids, direction = 1) {
  if (direction !== 1 && direction !== -1) throw new Error('Rotação inválida.');
  const members = new Set(expandGroups(project, ids));
  const selected = project.elements.filter((e) => members.has(e.id));
  const roots = selected.filter((e) => e.kind !== 'door');
  if (!roots.length) throw new Error('Selecione as peças que deseja girar.');
  if (
    selected.some((e) => {
      const layer = project.layers.find((l) => l.id === layerFor(e.kind));
      return !layer?.visible || layer.locked;
    })
  )
    throw new Error('Mostre e desbloqueie todas as camadas do conjunto.');
  if (selected.some((e) => e.kind === 'door' && !members.has(e.wallId)))
    throw new Error('Selecione também a estrutura da abertura.');
  const boxes = roots.map(selectionBounds);
  const cx = (Math.min(...boxes.map((b) => b.x)) + Math.max(...boxes.map((b) => b.x + b.w))) / 2;
  const cy = (Math.min(...boxes.map((b) => b.y)) + Math.max(...boxes.map((b) => b.y + b.h))) / 2;
  const clean = (n) => Math.round(n * 1e10) / 1e10;
  const point = (x, y) => ({
    x: clean(cx - direction * (y - cy)),
    y: clean(cy + direction * (x - cx)),
  });
  const segment = (kind, value) =>
    kind === 'room'
      ? (value + (direction === 1 ? 1 : 3)) % 4
      : kind === 'ellipse'
        ? (value + (direction === 1 ? 16 : 48)) % 64
        : value;
  const elements = project.elements.map((e) => {
    if (!members.has(e.id)) return e;
    if (e.kind === 'door') {
      const parent = project.elements.find((item) => item.id === e.wallId);
      return { ...e, segment: segment(parent.kind, e.segment) };
    }
    if (e.points) return { ...e, points: e.points.map((p) => point(p.x, p.y)) };
    if (e.kind === 'label') return { ...e, ...point(e.x, e.y) };
    const center = point(e.x + e.w / 2, e.y + e.h / 2);
    if (e.kind === 'asset')
      return {
        ...e,
        x: clean(center.x - e.w / 2),
        y: clean(center.y - e.h / 2),
        rotation: (((e.rotation + direction * 90) % 360) + 360) % 360,
      };
    return {
      ...e,
      x: clean(center.x - e.h / 2),
      y: clean(center.y - e.w / 2),
      w: e.h,
      h: e.w,
      ...(e.walls
        ? { walls: e.walls.map((wall) => ({ ...wall, segment: segment(e.kind, wall.segment) })) }
        : {}),
    };
  });
  for (const element of elements.filter((e) => members.has(e.id) && e.kind === 'asset')) {
    const box = selectionBounds(element);
    if (
      box.x < -1e-8 ||
      box.y < -1e-8 ||
      box.x + box.w > project.width + 1e-8 ||
      box.y + box.h > project.height + 1e-8
    )
      throw new Error('A rotação ultrapassa os limites da planta.');
  }
  return parseProject(JSON.stringify({ ...project, elements }));
}

export function expandGroups(project, ids) {
  const chosen = new Set(ids);
  const groups = new Set(
    project.elements.filter((e) => chosen.has(e.id) && e.groupId).map((e) => e.groupId),
  );
  project.elements.forEach((e) => {
    if (groups.has(e.groupId)) chosen.add(e.id);
  });
  project.elements.forEach((e) => {
    if (chosen.has(e.wallId)) chosen.add(e.id);
  });
  return project.elements.filter((e) => chosen.has(e.id)).map((e) => e.id);
}

export function setSelectionGroup(project, ids, ungroup = false) {
  const members = expandGroups(project, ids);
  const elements = project.elements.filter((e) => members.includes(e.id));
  if (!ungroup && elements.filter((e) => e.kind !== 'door').length < 2)
    throw new Error('Selecione pelo menos duas peças para agrupar.');
  if (
    elements.some((e) => {
      const layer = project.layers.find((l) => l.id === layerFor(e.kind));
      return !layer?.visible || layer.locked;
    })
  )
    throw new Error('Mostre e desbloqueie todas as camadas do grupo.');
  const groupId = ungroup ? null : uid();
  return parseProject(
    JSON.stringify({
      ...project,
      elements: project.elements.map((e) => {
        if (!members.includes(e.id)) return e;
        const { groupId: previous, ...rest } = e;
        return groupId ? { ...rest, groupId } : rest;
      }),
    }),
  );
}
