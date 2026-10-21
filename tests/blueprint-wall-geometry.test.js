import test from 'node:test';
import assert from 'node:assert/strict';
import { wallRuns, wallWidths } from '../src/blueprints/wall-geometry.js';
const room = { kind: 'room', x: 5, y: 5, w: 10, h: 8 };
const full = (segment, type = 'hull') => ({ segment, start: 0, end: 1, type });
test('casco completo forma contorno fechado único, independente da ordem de cadastro', () => {
  const runs = wallRuns({ ...room, walls: [full(2), full(0), full(3), full(1)] });
  assert.equal(runs.length, 1);
  assert.equal(runs[0].closed, true);
  assert.equal(runs[0].points.length, 4);
  assert.ok(runs[0].d.endsWith(' Z'));
});
test('aberturas e mudanças de estilo interrompem a união sem criar ponte', () => {
  const runs = wallRuns({
    ...room,
    walls: [full(0), full(1, 'open'), full(2, 'internal'), full(3)],
  });
  assert.equal(runs.length, 2);
  assert.ok(runs.every((run) => !run.closed));
  const partial = wallRuns({ ...room, walls: [{ ...full(0), end: 0.5 }, full(1)] });
  assert.equal(partial.length, 2);
});
test('elipse e polígono unem bordas; a referência permanece na borda original', () => {
  const ellipse = wallRuns({
    ...room,
    kind: 'ellipse',
    walls: Array.from({ length: 64 }, (_, i) => full(i)),
  });
  assert.equal(ellipse.length, 1);
  assert.equal(ellipse[0].closed, true);
  const polygon = {
    kind: 'polygon',
    points: [
      { x: 1, y: 1 },
      { x: 1, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 1 },
    ],
    walls: [0, 1, 2, 3].map((i) => full(i)),
  };
  assert.equal(wallRuns(polygon)[0].closed, true);
  assert.deepEqual(wallRuns({ ...room, walls: [full(0, 'internal')] })[0].points, [
    [5, 5],
    [15, 5],
  ]);
  assert.equal(wallWidths.internal, 0.2);
});
