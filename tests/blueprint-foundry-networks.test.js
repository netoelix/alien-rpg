import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundryBarriers } from '../src/blueprints/foundry/barriers.js';
import { syncDoorGroup } from '../src/blueprints/foundry/door-sync.js';
import { newProject } from '../src/blueprints/model.js';
import { buildFoundryPackage } from '../src/blueprints/foundry/package.js';
import { prepareFoundryImport } from '../src/blueprints/foundry/importer.js';
const corridor = (id, points) => ({
  id,
  kind: 'corridor',
  width: 2,
  points: points.map(([x, y]) => ({ x, y })),
  joinWalls: true,
  closedStart: true,
  closedEnd: true,
});
function closed(barriers) {
  const counts = new Map();
  for (const w of barriers)
    for (const p of [w.coordinates.slice(0, 2), w.coordinates.slice(2)])
      counts.set(p.join(','), (counts.get(p.join(',')) || 0) + 1);
  assert.ok(
    [...counts.values()].every((n) => n === 2),
    JSON.stringify([...counts].filter(([, n]) => n !== 2)),
  );
}
test('crossing joined corridors retain only the exterior, including centered corners', () => {
  const b = buildFoundryBarriers(
    [
      corridor('a', [
        [2, 8],
        [14, 8],
      ]),
      corridor('b', [
        [8, 2],
        [8, 14],
      ]),
    ],
    100,
  );
  assert.equal(b.ready, true);
  closed(b.barriers);
  assert.ok(!b.barriers.some((w) => w.coordinates.every((v) => v > 700 && v < 900)));
});
test('corridor joins a room without an internal cap or gap', () => {
  const b = buildFoundryBarriers(
    [
      { id: 'r', kind: 'room', x: 2, y: 2, w: 8, h: 8, joinWalls: true },
      corridor('c', [
        [8, 6],
        [16, 6],
      ]),
    ],
    100,
  );
  assert.equal(b.ready, true);
  closed(b.barriers);
  assert.ok(
    !b.barriers.some(
      (w) =>
        w.coordinates[0] === 1000 &&
        w.coordinates[2] === 1000 &&
        w.coordinates[1] > 500 &&
        w.coordinates[1] < 700,
    ),
  );
});
test('rounded corridor bend stays closed after union with another corridor', () => {
  const b = buildFoundryBarriers(
    [
      corridor('a', [
        [2, 2],
        [10, 2],
        [10, 12],
      ]),
      corridor('b', [
        [10, 8],
        [16, 8],
      ]),
    ],
    100,
  );
  assert.equal(b.ready, true);
  closed(b.barriers);
});
test('curved door segments export with one common synchronization group', () => {
  const b = buildFoundryBarriers([
    { id: 'r', kind: 'ellipse', x: 2, y: 2, w: 12, h: 12 },
    { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 2, openingType: 'door' },
  ]);
  const doors = b.barriers.filter((w) => w.kind === 'door');
  assert.equal(b.ready, true);
  assert.ok(doors.length > 1);
  assert.ok(doors.every((w) => w.doorGroup === 'd'));
  closed(b.barriers);
});
test('only elected GM synchronizes siblings and recursive updates are ignored', async () => {
  const updates = [];
  const wall = { id: 'a', door: 1, flags: { 'alien-blueprint-importer': { doorGroup: 'd' } } };
  wall.parent = {
    walls: [wall, { ...wall, id: 'b', ds: 0 }, { ...wall, id: 'other', flags: {} }],
    async updateEmbeddedDocuments(...args) {
      updates.push(args);
    },
  };
  const game = {
    user: { id: 'gm1' },
    users: [
      { id: 'gm2', isGM: true, active: true },
      { id: 'gm1', isGM: true, active: true },
    ],
  };
  await syncDoorGroup(wall, { ds: 1 }, {}, game);
  assert.deepEqual(updates[0], ['Wall', [{ _id: 'b', ds: 1 }], { blueprintDoorSync: true }]);
  await syncDoorGroup(wall, { ds: 2 }, { blueprintDoorSync: true }, game);
  game.user.id = 'gm2';
  await syncDoorGroup(wall, { ds: 2 }, {}, game);
  assert.equal(updates.length, 1);
});
test('disconnected crossing ducts use separate scenes and preserve access pairs', () => {
  const p = newProject();
  p.elements = [
    {
      id: 'a',
      kind: 'vent',
      width: 1,
      points: [
        { x: 2, y: 8 },
        { x: 14, y: 8 },
      ],
    },
    {
      id: 'b',
      kind: 'vent',
      width: 1,
      points: [
        { x: 8, y: 2 },
        { x: 8, y: 14 },
      ],
    },
  ];
  const b = buildFoundryPackage(p);
  assert.equal(b.scenes.length, 3);
  const vents = b.scenes.filter((s) => s.kind === 'ventilation');
  assert.equal(vents.length, 2);
  for (const s of vents) {
    assert.equal(s.elements.filter((e) => e.kind === 'vent').length, 1);
    closed(s.geometry.barriers);
  }
  assert.equal(b.accesses.length, 8);
  prepareFoundryImport(b, new Map(b.scenes.map((s) => [s.key, 'image.png'])));
});
test('closed vent loop creates one bounded network without invented tip entrances', () => {
  const p = newProject();
  p.elements = [
    {
      id: 'a',
      kind: 'vent',
      width: 1,
      points: [
        { x: 2, y: 2 },
        { x: 8, y: 2 },
        { x: 8, y: 8 },
        { x: 2, y: 8 },
        { x: 2, y: 2 },
      ],
    },
  ];
  const b = buildFoundryPackage(p);
  assert.equal(b.scenes.length, 2);
  assert.equal(b.accesses.length, 0);
  closed(b.scenes[1].geometry.barriers);
});

test('full-width corridor doors and windows do not turn perpendicular sides into openings', () => {
  for (const openingType of ['door', 'window']) {
    const b = buildFoundryBarriers([
      corridor('c', [
        [2, 5],
        [12, 5],
      ]),
      { id: 'd', kind: 'door', wallId: 'c', segment: 0, t: 0.5, width: 10, openingType },
    ]);
    assert.equal(b.ready, true);
    const openings = b.barriers.filter((w) => w.sourceId === 'd');
    assert.ok(openings.length > 0);
    assert.ok(openings.every((w) => Math.abs(w.coordinates[1] - w.coordinates[3]) < 0.001));
    closed(b.barriers);
  }
});
