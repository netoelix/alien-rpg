import { layerFor, parseProject, uid, wallSegments } from './model.js';
import { selectionBounds } from './selection.js';

export function rotateGroup(project, ids, direction = 1, freeAngle = null, pivot = null) {
  if (direction !== 1 && direction !== -1) throw new Error('Rotação inválida.');
  const members = new Set(expandGroups(project, ids));
  const selected = project.elements.filter((e) => members.has(e.id));
  const roots = selected.filter((e) => e.kind !== 'door');
  if (!roots.length) throw new Error('Selecione as peças que deseja girar.');
  if (
    selected.some((e) => {
      const layer = project.layers.find((l) => l.id === layerFor(e.kind));
      return e.hidden || e.locked || !layer?.visible || layer.locked;
    })
  )
    throw new Error('Mostre e desbloqueie todas as camadas do conjunto.');
  if (selected.some((e) => e.kind === 'door' && !members.has(e.wallId)))
    throw new Error('Selecione também a estrutura da abertura.');
  if (freeAngle !== null && (!Number.isFinite(freeAngle) || Math.abs(freeAngle) > 360))
    throw new Error('Informe um ângulo entre −360° e 360°.');

  const degrees = freeAngle ?? direction * 90;
  const radians = (degrees * Math.PI) / 180;
  const boxes = roots.map(selectionBounds);
  if (
    pivot &&
    (!Number.isFinite(pivot.cx) ||
      !Number.isFinite(pivot.cy) ||
      pivot.cx < 0 ||
      pivot.cy < 0 ||
      pivot.cx > project.width ||
      pivot.cy > project.height)
  )
    throw new Error('O pivô deve estar dentro da planta.');
  const cx =
    pivot?.cx ??
    (Math.min(...boxes.map((b) => b.x)) + Math.max(...boxes.map((b) => b.x + b.w))) / 2;
  const cy =
    pivot?.cy ??
    (Math.min(...boxes.map((b) => b.y)) + Math.max(...boxes.map((b) => b.y + b.h))) / 2;
  const clean = (n) => Math.round(n * 1e10) / 1e10;
  const point = (x, y) => ({
    x: clean(cx + Math.cos(radians) * (x - cx) - Math.sin(radians) * (y - cy)),
    y: clean(cy + Math.sin(radians) * (x - cx) + Math.cos(radians) * (y - cy)),
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
      if (freeAngle !== null) return e;
      const parent = project.elements.find((item) => item.id === e.wallId);
      return { ...e, segment: segment(parent.kind, e.segment) };
    }
    if (e.points) return { ...e, points: e.points.map((p) => point(p.x, p.y)) };
    if (e.kind === 'label') return { ...e, ...point(e.x, e.y) };
    const center = point(e.x + e.w / 2, e.y + e.h / 2);
    if (e.kind === 'asset' || (freeAngle !== null && ['room', 'ellipse'].includes(e.kind)))
      return {
        ...e,
        x: clean(center.x - e.w / 2),
        y: clean(center.y - e.h / 2),
        rotation: ((((e.rotation || 0) + degrees) % 360) + 360) % 360,
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
  for (const element of elements.filter((e) => members.has(e.id) && e.kind !== 'door')) {
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

export function freeRotationFrame(project, ids) {
  const members = new Set(expandGroups(project, ids));
  const selected = project.elements.filter((e) => members.has(e.id));
  const roots = selected.filter((e) => e.kind !== 'door');
  if (
    !roots.length ||
    (roots.length === 1 && !['polygon', 'corridor', 'vent'].includes(roots[0].kind)) ||
    selected.some((e) => {
      const layer = project.layers.find((l) => l.id === layerFor(e.kind));
      return (
        e.hidden ||
        e.locked ||
        !layer?.visible ||
        layer.locked ||
        (e.kind === 'door' && !members.has(e.wallId))
      );
    })
  )
    return null;
  const boxes = roots.map(selectionBounds);
  const left = Math.min(...boxes.map((b) => b.x)),
    top = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.w)),
    bottom = Math.max(...boxes.map((b) => b.y + b.h));
  return {
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    top,
    bottom,
    rootCount: roots.length,
    ids: [...members],
  };
}

export function rotationDragAngle(frame, start, end, step = 1) {
  if (Math.hypot(end.x - frame.cx, end.y - frame.cy) < 0.01) return 0;
  const delta =
    ((Math.atan2(end.y - frame.cy, end.x - frame.cx) -
      Math.atan2(start.y - frame.cy, start.x - frame.cx)) *
      180) /
    Math.PI;
  return Math.round((((delta + 540) % 360) - 180) / step) * step;
}

export function convertRoomsToPolygons(project, ids) {
  const members = new Set(expandGroups(project, ids));
  const rooms = project.elements.filter((e) => members.has(e.id) && e.kind === 'room');
  if (!rooms.length) throw new Error('Selecione uma sala retangular.');
  const structure = project.layers.find((l) => l.id === layerFor('room'));
  if (!structure?.visible || structure.locked) throw new Error('Mostre e desbloqueie a estrutura.');
  const converted = new Set(rooms.map((e) => e.id));
  return parseProject(
    JSON.stringify({
      ...project,
      elements: project.elements.map((e) => {
        if (!converted.has(e.id)) return e;
        const { x, y, w, h, rotation, ...rest } = e;
        return {
          ...rest,
          kind: 'polygon',
          points: wallSegments(e).map(([start]) => ({ x: start[0], y: start[1] })),
        };
      }),
    }),
  );
}
