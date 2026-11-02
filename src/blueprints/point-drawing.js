import { pathTools } from './path-tools.js';
import { closeVentPoints } from './vent-cycle.js';

const minimumPoints = new Map([
  ...pathTools.map((tool) => [tool, 2]),
  ['polygon', 3],
  ['floorRegion', 3],
]);

export const drawsByPoints = (tool) => minimumPoints.has(tool);
export const canFinishDrawing = (tool, points) =>
  points.length >= (minimumPoints.get(tool) ?? Infinity);

export function appendDrawingPoint(points, point) {
  const last = points.at(-1);
  return last && last.x === point.x && last.y === point.y ? points : [...points, point];
}

export function pointDrawingElement({
  id,
  tool,
  points,
  lineWidth,
  traceStyle,
  regionFinish,
  close,
}) {
  return {
    id,
    kind: tool,
    points: tool === 'vent' && close === true ? closeVentPoints(points) : points,
    width: lineWidth,
    ...(tool === 'trace' ? traceStyle : {}),
    ...(tool === 'floorRegion' ? { floorFinish: regionFinish } : {}),
  };
}
