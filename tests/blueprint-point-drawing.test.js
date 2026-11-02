import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendDrawingPoint,
  canFinishDrawing,
  pointDrawingElement,
} from '../src/blueprints/point-drawing.js';
test('linear paths finish with two points, areas need three and only vents explicitly close', () => {
  const points = [
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 4, y: 4 },
  ];
  for (const tool of ['corridor', 'vent', 'trace'])
    assert.equal(canFinishDrawing(tool, points.slice(0, 2)), true);
  for (const tool of ['polygon', 'floorRegion', 'wall', 'dimension'])
    assert.equal(canFinishDrawing(tool, points.slice(0, 2)), false);
  assert.equal(canFinishDrawing('polygon', points), true);
  assert.equal(appendDrawingPoint(points, { ...points[2] }), points);
  for (const tool of ['trace', 'corridor', 'vent']) {
    const el = pointDrawingElement({
      id: 'x',
      tool,
      points,
      lineWidth: 2,
      traceStyle: { traceType: 'road' },
      close: true,
    });
    assert.equal(el.points.length, tool === 'vent' ? 4 : 3);
    assert.equal(el.traceType, tool === 'trace' ? 'road' : undefined);
  }
  assert.equal(points.length, 3);
});
