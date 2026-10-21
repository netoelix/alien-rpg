import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedWallStructures } from '../src/blueprints/shared-walls.js';
import { openingGeometry } from '../src/blueprints/wall-geometry.js';

test('portas e janelas dos dois módulos usam a mesma divisória visível', () => {
  const a = {
    id: 'a',
    kind: 'room',
    x: 0,
    y: 0,
    w: 10,
    h: 10,
    walls: [{ segment: 1, start: 0, end: 1, type: 'hull' }],
  };
  const b = {
    id: 'b',
    kind: 'room',
    x: 10,
    y: 0,
    w: 10,
    h: 10,
    walls: [{ segment: 3, start: 0, end: 1, type: 'internal' }],
  };
  for (const openingType of ['door', 'window']) {
    const door = { kind: 'door', openingType, width: 2, t: 0.5, wallId: 'a', segment: 1 };
    const neighbor = { ...door, wallId: 'b', segment: 3 };
    const expected = openingGeometry(door, [a, b]);
    assert.deepEqual(openingGeometry(neighbor, [a, b]), expected);
    assert.deepEqual(openingGeometry(neighbor, [b, a]), expected);
    assert.equal(expected.depth, 0.7);
    assert.equal(neighbor.wallId, 'b');
    assert.equal(openingGeometry(neighbor, [a, { ...b, x: 12 }]).depth, 0.2);
  }
});
test('divisórias coincidentes são renderizadas uma vez, inclusive sobreposição parcial', () => {
  const a = {
    id: 'a',
    kind: 'room',
    x: 0,
    y: 0,
    w: 10,
    h: 10,
    walls: [{ segment: 1, start: 0, end: 1, type: 'hull' }],
  };
  const b = {
    id: 'b',
    kind: 'room',
    x: 10,
    y: 5,
    w: 10,
    h: 10,
    walls: [{ segment: 3, start: 0, end: 1, type: 'internal' }],
  };
  const resolved = sharedWallStructures([a, b]);
  assert.equal(resolved[0].walls.length, 1);
  assert.equal(resolved[1].walls.length, 1);
  assert.equal(resolved[1].walls[0].end, 0.5);
  assert.equal(b.walls[0].end, 1);
  assert.deepEqual(
    sharedWallStructures([b, a]).find((e) => e.id === 'b'),
    resolved[1],
  );
  const moved = sharedWallStructures([a, { ...b, x: 12 }]);
  assert.equal(moved[1].walls[0].end, 1);
});
