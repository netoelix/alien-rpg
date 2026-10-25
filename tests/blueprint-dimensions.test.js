import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject, moveElement, layerFor } from '../src/blueprints/model.js';
import { dimensionLength } from '../src/blueprints/dimensions.js';
import { createModule, placeModule, rotateModule } from '../src/blueprints/modules.js';
const measure = {
  id: 'measure',
  kind: 'dimension',
  points: [
    { x: 10, y: 10 },
    { x: 13, y: 14 },
  ],
};
test('distance remains accurate after save, movement and module rotation', () => {
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [measure] }));
  assert.equal(layerFor('dimension'), 'labels');
  assert.equal(dimensionLength(p.elements[0]), 5);
  assert.equal(dimensionLength(moveElement(measure, 3, 4)), 5);
  const module = rotateModule(createModule(p, ['measure'], 'Medida'), 1);
  const inserted = placeModule(newProject(), module, 20, 20);
  assert.ok(Math.abs(dimensionLength(inserted.project.elements[0]) - 5) < 1e-8);
  assert.equal(
    dimensionLength({
      ...measure,
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 7 },
      ],
    }),
    7,
  );
});
test('dimensions reject zero length, extra endpoints and out of bounds', () => {
  for (const points of [
    [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    ],
    [...measure.points, { x: 14, y: 15 }],
    [
      { x: -1, y: 1 },
      { x: 2, y: 2 },
    ],
  ]) {
    assert.throws(() =>
      parseProject(JSON.stringify({ ...newProject(), elements: [{ ...measure, points }] })),
    );
  }
});

test('projected dimensions and offsets persist without changing anchor points', async () => {
  const { dimensionFrame, dimensionOffset } = await import('../src/blueprints/dimensions.js');
  for (const [mode, length] of [
    ['horizontal', 3],
    ['vertical', 4],
    ['direct', 5],
  ]) {
    const element = { ...measure, mode, offset: 2 };
    const saved = parseProject(JSON.stringify({ ...newProject(), elements: [element] }))
      .elements[0];
    assert.deepEqual(saved, element);
    assert.equal(dimensionLength(saved), length);
    const f = dimensionFrame(saved);
    assert.ok(Math.abs(dimensionOffset(saved, f.a) - 2) < 1e-8);
    assert.deepEqual(saved.points, measure.points);
  }
});
