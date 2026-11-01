import {
  rotateGestureGroup,
  moveGestureTarget,
  transformGestureTarget,
} from './gesture-transform.js';
import { followVentWalls } from './ventilation.js';
import { areaElement, areaTools } from './area-tools.js';
const emptyDrawingPreview = [];
export function rectangle(g) {
  return {
    id: 'preview',
    kind: g.kind,
    x: Math.min(g.start.x, g.end.x),
    y: Math.min(g.start.y, g.end.y),
    w: Math.abs(g.start.x - g.end.x),
    h: Math.abs(g.start.y - g.end.y),
  };
}
export function gesturePreview({
  project,
  gesture,
  points,
  cursor,
  tool,
  areaPurpose,
  regionFinish,
  traceStyle,
  lineWidth,
  pastedGroup,
}) {
  let drawn = transformGestureTarget(project, gesture) ?? project,
    preview = emptyDrawingPreview;
  if (gesture && ['room', 'ellipse'].includes(gesture.kind)) preview = [rectangle(gesture)];
  if (points.length && !['dimension', 'wall'].includes(tool))
    preview = [
      {
        id: 'preview',
        kind: tool,
        ...(tool === 'trace' ? traceStyle : {}),
        ...(tool === 'floorRegion' ? { floorFinish: regionFinish } : {}),
        width: lineWidth,
        points: cursor ? [...points, cursor] : points,
      },
    ];
  if (preview.length && areaTools.includes(tool))
    preview = preview.map((e) => areaElement(e, areaPurpose, regionFinish));
  if (gesture?.kind === 'move')
    drawn = moveGestureTarget(project, gesture, pastedGroup, { preview: true }) ?? project;
  const rotation = gesture?.kind === 'rotateGroup' ? rotateGestureGroup(project, gesture) : null;
  if (rotation) drawn = rotation.project;
  drawn = followVentWalls(project, drawn);
  return {
    drawn,
    preview,
    groupAngle: rotation?.angle ?? 0,
    groupRotationError: rotation?.error ?? '',
  };
}
