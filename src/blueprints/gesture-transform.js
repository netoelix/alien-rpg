import { rotateGroup, rotationDragAngle } from './groups.js';
import { movePastedGroup, translateGroup } from './clipboard.js';
import { dimensionOffset } from './dimensions.js';
import { moveDestinationLabel } from './destination-labels.js';
import { moveElement, nearestWall, moveVertex } from './model.js';
import { resizeElement, rotateAsset } from './resize.js';

export function gestureUsesSnap(kind) {
  return !['rotate', 'rotateGroup', 'destinationLabel'].includes(kind);
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
      changed = moveVertex(element, gesture.index, end);
      break;
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
