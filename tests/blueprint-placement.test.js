import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { openingCandidate } from '../src/blueprints/placement.js';
const room = { id: 'room', kind: 'room', x: 10, y: 10, w: 10, h: 10 };
const p = { ...newProject(), elements: [room] };
test('opening placement fits near corners and rejects missing or short walls', () => {
  const result = openingCandidate(p, { x: 10, y: 10 }, 2, 'window', 1);
  assert.equal(result.error, undefined);
  assert.equal(result.element.openingType, 'window');
  assert.ok(result.element.t > 0);
  assert.ok(openingCandidate(p, { x: 30, y: 30 }, 2, 'door', 1).error);
  assert.ok(openingCandidate(p, { x: 15, y: 10 }, 20, 'door', 1).error);
  assert.ok(
    openingCandidate(
      { ...p, elements: [{ ...room, hidden: true }] },
      { x: 15, y: 10 },
      1,
      'door',
      1,
    ).error,
  );
  assert.deepEqual(p.elements, [room]);
});
