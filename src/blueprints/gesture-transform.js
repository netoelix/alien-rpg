import { rotateGroup, rotationDragAngle } from './groups.js';
import { movePastedGroup, translateGroup } from './clipboard.js';
import { isClosedVent } from './vent-cycle.js';
import { projectPointToSegment } from './segment-geometry.js';
import { dimensionOffset } from './dimensions.js';
import { moveDestinationLabel } from './destination-labels.js';
import { moveElement, nearestWall, moveVertex } from './model.js';
import { resizeElement, rotateAsset } from './resize.js';

export function gestureUsesSnap(kind) {
  return !['rotate', 'rotateGroup', 'destinationLabel'].includes(kind);
}

function endpointFamily(element, index) {
  if (!element.points || element.hidden || element.locked) return null;
  if (index !== 0 && index !== element.points.length - 1) return null;
  if (element.kind === 'corridor')
    return (index === 0 ? element.closedStart : element.closedEnd) ? null : 'corridor';
  return element.kind === 'trace' && ['road', 'path'].includes(element.traceType)
    ? 'circulation'
    : null;
}

// Carry automatic branch endpoints with the edited run, including T branches.
export function editPathVertex(project, element, index, end) {
  const changed = moveVertex(element, index, end);
  const family = endpointFamily(element, index);
  const runs = [];
  if (element.kind === 'vent' && !element.hidden) {
    for (let i = 1; i < element.points.length; i++) {
      if (
        changed.points[i] !== element.points[i] ||
        changed.points[i - 1] !== element.points[i - 1]
      )
        runs.push(i);
    }
  }
  return {
    ...project,
    elements: project.elements.map((item) => {
      if (item.id === element.id) return changed;
      if (family && item.points) {
        const origin = element.points[index];
        const endpoints = [0, item.points.length - 1].filter(
          (i) =>
            endpointFamily(item, i) === family &&
            Math.hypot(item.points[i].x - origin.x, item.points[i].y - origin.y) < 0.00001,
        );
        if (endpoints.length) {
          const points = [...item.points];
          for (const i of endpoints) points[i] = { ...end };
          return { ...item, points };
        }
      }
      if (!runs.length || item.kind !== 'vent' || item.locked || item.hidden || isClosedVent(item))
        return item;
      let points = item.points;
      for (const side of [0, 1]) {
        if ((item.accesses?.[side] || 'auto') !== 'auto') continue;
        const at = side ? points.length - 1 : 0;
        for (const i of runs) {
          const hit = projectPointToSegment(
            item.points[at],
            element.points[i - 1],
            element.points[i],
          );
          if (!hit || hit.distance > 0.00001) continue;
          const tip =
            i === 1 && hit.t === 0 ? 0 : i === element.points.length - 1 && hit.t === 1 ? 1 : -1;
          if (!isClosedVent(element) && tip >= 0 && (element.accesses?.[tip] || 'auto') !== 'auto')
            continue;
          const a = changed.points[i - 1],
            b = changed.points[i];
          if (points === item.points) points = [...points];
          points[at] = { x: a.x + (b.x - a.x) * hit.t, y: a.y + (b.y - a.y) * hit.t };
          break;
        }
      }
      return points === item.points ? item : { ...item, points };
    }),
  };
}

// Other gestures either create objects or operate on a whole selection.
export function transformGestureTarget(project, gesture) {
  if (!gesture) return null;
  const { kind, element, start, end } = gesture;
  let changed;
  switch (kind) {
    case 'dimensionOffset':
      changed = { ...element, offset: dimensionOffset(element, end) };
      break;
    case 'vertex':
      return editPathVertex(project, element, gesture.index, end);
    case 'destinationLabel':
      changed = moveDestinationLabel(element, gesture.labelKey, end.x - start.x, end.y - start.y);
      break;
    case 'rotate':
      changed = rotateAsset(element, start, end, project, gesture.step);
      break;
    case 'resize':
      changed = resizeElement(
        element,
        gesture.handle,
        end.x - start.x,
        end.y - start.y,
        project,
        gesture.proportional,
      );
      break;
    default:
      return null;
  }
  return {
    ...project,
    elements: project.elements.map((item) => (item.id === element.id ? changed : item)),
  };
}

export function moveGestureTarget(project, gesture, group, { preview = false } = {}) {
  const { element, start, end } = gesture;
  if (group?.selectedId === element.id) {
    const move = preview ? translateGroup : movePastedGroup;
    return move(project, group.ids, end.x - start.x, end.y - start.y);
  }
  let changed;
  if (element.kind === 'door') {
    const wall = nearestWall(project.elements, end);
    if (!wall) return null;
    changed = { ...element, wallId: wall.wallId, segment: wall.segment, t: wall.t };
  } else {
    changed = moveElement(element, end.x - start.x, end.y - start.y);
  }
  return {
    ...project,
    elements: project.elements.map((item) => (item.id === element.id ? changed : item)),
  };
}

export function rotateGestureGroup(project, { frame, start, end, step }) {
  const angle = rotationDragAngle(frame, start, end, step);
  if (angle === 0) return { project, angle, error: '' };
  try {
    return { project: rotateGroup(project, frame.ids, 1, angle, frame), angle, error: '' };
  } catch (error) {
    return { project, angle, error: error.message };
  }
}
