import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { snapToObjects } from '../src/blueprints/snapping.js';
const room = { id: 'room', kind: 'room', x: 10, y: 10, w: 10, h: 10 };
const p = { ...newProject(), elements: [room] };
test('snap targets corners and centers within screen-derived tolerance', () => {
  assert.equal(snapToObjects(p, { x: 10.2, y: 15.2 }).x, 10);
  assert.equal(snapToObjects(p, { x: 10.2, y: 15.2 }).y, 15);
  assert.equal(snapToObjects(p, { x: 10.2, y: 15.2 }, { threshold: 0.1 }).guides.length, 0);
});
test('hidden objects and layers and moving selection cannot snap to themselves', () => {
  assert.equal(snapToObjects(p, { x: 10, y: 10 }, { excluded: ['room'] }).guides.length, 0);
  assert.equal(
    snapToObjects({ ...p, elements: [{ ...room, hidden: true }] }, { x: 10, y: 10 }).guides.length,
    0,
  );
  assert.equal(
    snapToObjects(
      { ...p, layers: p.layers.map((l) => ({ ...l, visible: false })) },
      { x: 10, y: 10 },
    ).guides.length,
    0,
  );
});
test('movement aligns object edges instead of the pointer grab point', () => {
  const moving = { id: 'moving', kind: 'room', x: 2, y: 2, w: 2, h: 2 };
  const result = snapToObjects(
    p,
    { x: 9.2, y: 3 },
    { moving: [moving], start: { x: 3, y: 3 }, excluded: ['moving'] },
  );
  assert.ok(Math.abs(result.x - 9) < 1e-8);
  assert.equal(result.guides[0].value, 10);
});
