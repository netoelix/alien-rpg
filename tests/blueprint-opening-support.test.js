import test from 'node:test';
import assert from 'node:assert/strict';
import { openingHasWall } from '../src/blueprints/model.js';
test('aberturas exigem parede visível ou divisória explícita', () => {
  const a = { id: 'a', kind: 'room', x: 0, y: 0, w: 10, h: 10 };
  const b = { id: 'b', kind: 'room', x: 10, y: 0, w: 10, h: 10 };
  const door = { kind: 'door', wallId: 'a', segment: 1, t: 0.5, width: 2 };
  assert.equal(openingHasWall(door, [a]), true);
  assert.equal(openingHasWall(door, [a, b]), true);
  const manual = { ...a, walls: [{ segment: 1, start: 0, end: 1, type: 'hull' }] };
  assert.equal(openingHasWall(door, [manual, b]), true);
  assert.equal(openingHasWall(door, [{ ...manual, joinWalls: true }, b]), false);
  assert.equal(
    openingHasWall(door, [
      { ...manual, walls: [{ segment: 1, start: 0, end: 1, type: 'open' }] },
      b,
    ]),
    false,
  );
});
