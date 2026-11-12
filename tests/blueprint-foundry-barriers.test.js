import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundryBarriers as build } from '../src/blueprints/foundry/barriers.js';
// These topology tests retain the unshifted reference geometry.
const buildFoundryBarriers = (elements, scale) => build(elements, scale, { wallPlacement: 'edge' });
const room = { id: 'r', kind: 'room', x: 2, y: 2, w: 10, h: 8 };
const opening = (type = 'door') => ({
  id: 'd',
  kind: 'door',
  wallId: 'r',
  segment: 0,
  t: 0.5,
  width: 2,
  openingType: type,
});
test('door replaces its wall interval instead of overlaying a blocking wall', () => {
  const b = buildFoundryBarriers([room, opening()], 10);
  assert.equal(b.ready, true);
  assert.equal(b.barriers.length, 6);
  const door = b.barriers.find((b) => b.kind === 'door');
  assert.deepEqual(door.coordinates, [60, 20, 80, 20]);
  assert.equal(door.state, 'closed');
  assert.ok(door.blocks.sight);
  const top = b.barriers.filter((b) => b.coordinates[1] === 20 && b.coordinates[3] === 20);
  assert.equal(top.length, 3);
  assert.equal(
    top.reduce((n, b) => n + Math.abs(b.coordinates[2] - b.coordinates[0]), 0),
    100,
  );
});
test('windows and glass block movement but transmit vision and light', () => {
  for (const type of ['window', 'fortifiedWindow', 'slimWindow']) {
    const b = buildFoundryBarriers([room, opening(type)]).barriers.find((b) => b.kind === 'window');
    assert.deepEqual(b.blocks, { movement: true, sight: false, light: false, sound: true });
  }
  const b = buildFoundryBarriers([
    { ...room, walls: [{ segment: 0, start: 0, end: 1, type: 'glass' }] },
  ]);
  assert.ok(b.barriers.some((w) => w.style === 'glass' && !w.blocks.sight));
});
test('open wall sections stay open; shared boundaries occur only once', () => {
  const r = { ...room, walls: [{ segment: 0, start: 0, end: 1, type: 'open' }] };
  assert.equal(buildFoundryBarriers([r]).barriers.length, 3);
  const second = { ...room, id: 's', x: 12 };
  const b = buildFoundryBarriers([room, second]);
  assert.equal(b.barriers.length, 7);
});
test('rotated rooms and elliptical walls retain closed endpoints', () => {
  for (const r of [
    { ...room, rotation: 37 },
    { ...room, kind: 'ellipse' },
  ]) {
    const { barriers } = buildFoundryBarriers([r]);
    const counts = new Map();
    for (const w of barriers)
      for (const p of [w.coordinates.slice(0, 2), w.coordinates.slice(2)]) {
        const k = p.join(',');
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    assert.ok([...counts.values()].every((n) => n === 2));
  }
});
test('bent corridor has round outer corner and continuous inside bend', () => {
  const e = {
    id: 'c',
    kind: 'corridor',
    width: 2,
    points: [
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 10 },
    ],
    closedStart: true,
    closedEnd: true,
  };
  const b = buildFoundryBarriers([e]);
  assert.ok(b.barriers.length > 8);
  const counts = new Map();
  for (const w of b.barriers)
    for (const p of [w.coordinates.slice(0, 2), w.coordinates.slice(2)]) {
      const k = p.join(',');
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  assert.ok([...counts.values()].every((n) => n === 2));
});
test('corridors no longer block unrelated joined rooms', () => {
  const b = buildFoundryBarriers([
    { ...room, joinWalls: true },
    {
      id: 'c',
      kind: 'corridor',
      width: 2,
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    },
  ]);
  assert.equal(b.ready, true);
  assert.ok(b.barriers.length > 0);
  assert.equal(b.warnings.length, 0);
});

test('joined adjacent rooms have no interior seam and keep their exterior', () => {
  const b = buildFoundryBarriers(
    [
      { ...room, joinWalls: true },
      { ...room, id: 's', x: 12, joinWalls: true },
    ],
    1,
  );
  assert.equal(b.ready, true);
  assert.ok(!b.barriers.some((w) => w.coordinates[0] === 12 && w.coordinates[2] === 12));
  assert.equal(
    b.barriers.reduce(
      (sum, w) =>
        sum + Math.hypot(w.coordinates[2] - w.coordinates[0], w.coordinates[3] - w.coordinates[1]),
      0,
    ),
    56,
  );
});
test('overlapping joined rooms clip internal wall pieces, keeping a closed exterior', () => {
  const b = buildFoundryBarriers(
    [
      { ...room, joinWalls: true },
      { ...room, id: 's', x: 7, y: 6, joinWalls: true },
    ],
    1,
  );
  assert.equal(b.ready, true);
  const counts = new Map();
  for (const wall of b.barriers)
    for (const p of [wall.coordinates.slice(0, 2), wall.coordinates.slice(2)])
      counts.set(p.join(','), (counts.get(p.join(',')) || 0) + 1);
  assert.ok([...counts.values()].every((n) => n === 2));
  assert.equal(
    b.barriers.reduce(
      (sum, w) =>
        sum + Math.hypot(w.coordinates[2] - w.coordinates[0], w.coordinates[3] - w.coordinates[1]),
      0,
    ),
    54,
  );
});
test('joined room does not erase the boundary of a non-joined neighbor', () => {
  const b = buildFoundryBarriers(
    [
      { ...room, joinWalls: true },
      { ...room, id: 's', x: 12 },
    ],
    1,
  );
  assert.ok(b.barriers.some((w) => w.coordinates[0] === 12 && w.coordinates[2] === 12));
});
