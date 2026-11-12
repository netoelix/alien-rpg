import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundryBarriers } from '../src/blueprints/foundry/barriers.js';
const room = { id: 'r', kind: 'room', x: 2, y: 2, w: 10, h: 8 };
function closed(barriers) {
  const nodes = new Map();
  for (const b of barriers)
    for (const p of [b.coordinates.slice(0, 2), b.coordinates.slice(2)])
      nodes.set(p.join(','), (nodes.get(p.join(',')) || 0) + 1);
  assert.ok([...nodes.values()].every((n) => n === 2));
}
test('default room barriers run at the center of the painted wall and meet at corners', () => {
  const b = buildFoundryBarriers([room], 100);
  assert.ok(
    b.barriers.some((w) => JSON.stringify(w.coordinates) === JSON.stringify([190, 190, 1210, 190])),
  );
  closed(b.barriers);
});
test('door and window stay connected to their shifted wall', () => {
  for (const type of ['door', 'window']) {
    const b = buildFoundryBarriers(
      [
        room,
        { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 2, openingType: type },
      ],
      100,
    );
    assert.deepEqual(b.barriers.find((w) => w.sourceId === 'd').coordinates, [600, 190, 800, 190]);
    closed(b.barriers);
  }
});
test('structural thickness controls offset while partition center stays unchanged', () => {
  const b = buildFoundryBarriers(
    [{ ...room, walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }] }],
    100,
  );
  assert.equal(b.barriers.find((w) => w.style === 'hull').coordinates[1], 165);
  closed(b.barriers);
  const p = buildFoundryBarriers(
    [
      {
        id: 'p',
        kind: 'partition',
        points: [
          { x: 2, y: 2 },
          { x: 8, y: 2 },
        ],
      },
    ],
    100,
  );
  assert.deepEqual(p.barriers[0].coordinates, [200, 200, 800, 200]);
});
test('rotated and elliptical rooms preserve a closed contour after centering', () => {
  for (const shape of [
    { ...room, rotation: 37 },
    { ...room, kind: 'ellipse' },
  ])
    closed(buildFoundryBarriers([shape]).barriers);
});
test('a bent corridor retains a closed contour after centering', () => {
  closed(
    buildFoundryBarriers([
      {
        id: 'c',
        kind: 'corridor',
        width: 2,
        closedStart: true,
        closedEnd: true,
        points: [
          { x: 2, y: 2 },
          { x: 10, y: 2 },
          { x: 10, y: 10 },
        ],
      },
    ]).barriers,
  );
});
