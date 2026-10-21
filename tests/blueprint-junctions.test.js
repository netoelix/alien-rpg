import test from 'node:test';
import assert from 'node:assert/strict';
import { fitOpenings, newProject } from '../src/blueprints/model.js';
import { corridorCorners } from '../src/blueprints/wall-geometry.js';
test('batentes permanecem dentro da borda e largura excessiva é recusada', () => {
  const room = { id: 'r', kind: 'room', x: 2, y: 2, w: 10, h: 10 };
  const door = { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0, width: 2 };
  const p = { ...newProject(), elements: [room, door] };
  assert.equal(fitOpenings(p).elements[1].t, 0.11200000000000002);
  assert.equal(p.elements[1].t, 0);
  assert.throws(() => fitOpenings({ ...p, elements: [room, { ...door, width: 11 }] }));
});
test('casco conecta lado externo nas duas direções e respeita abertura', () => {
  const corridor = {
    kind: 'corridor',
    width: 2,
    points: [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
    ],
    walls: [0, 1, 2, 3].map((segment) => ({ segment, start: 0, end: 1, type: 'hull' })),
  };
  assert.equal(corridorCorners(corridor).length, 1);
  assert.match(corridorCorners(corridor)[0].d, / A 1 1 /);
  assert.equal(corridorCorners({ ...corridor, points: [...corridor.points].reverse() }).length, 1);
  assert.equal(
    corridorCorners({
      ...corridor,
      walls: corridor.walls.map((w) => (w.segment === 1 ? { ...w, type: 'open' } : w)),
    }).filter((joint) => joint.x === 7 && joint.y === 2).length,
    0,
  );
});

import {
  wallTransitions,
  sharedWallJunctions,
  junctionWallSections,
} from '../src/blueprints/wall-geometry.js';

test('paredes padrão conectam sem aplicar acabamento e recalculam após movimento', () => {
  const a = { id: 'a', kind: 'room', x: 0, y: 0, w: 10, h: 10 };
  const b = { id: 'b', kind: 'room', x: 10, y: 10, w: 5, h: 5 };
  assert.equal(junctionWallSections(a).length, 4);
  assert.ok(sharedWallJunctions([a, b]).some((joint) => joint.x === 10 && joint.y === 10));
  assert.equal(sharedWallJunctions([a, { ...b, x: 12 }]).length, 0);
  assert.equal(a.walls, undefined);
  const partial = { ...a, walls: [{ segment: 0, start: 0.2, end: 0.8, type: 'open' }] };
  const intervals = junctionWallSections(partial).filter((wall) => wall.segment === 0);
  assert.deepEqual(
    intervals.map(({ start, end }) => [start, end]),
    [
      [0, 0.2],
      [0.8, 1],
    ],
  );
});
test('transições preenchem apenas quinas entre estilos diferentes', () => {
  const room = {
    kind: 'room',
    x: 2,
    y: 2,
    w: 10,
    h: 10,
    walls: [
      { segment: 0, start: 0, end: 1, type: 'hull' },
      { segment: 1, start: 0, end: 1, type: 'internal' },
    ],
  };
  const corner = (element) =>
    wallTransitions(element).filter((joint) => joint.x === 12 && joint.y === 2);
  assert.deepEqual(corner(room), [{ x: 12, y: 2, radius: 0.7 }]);
  assert.equal(
    corner({ ...room, walls: room.walls.map((w) => ({ ...w, type: 'hull' })) }).length,
    0,
  );
  assert.equal(
    corner({ ...room, walls: [room.walls[0], { ...room.walls[1], type: 'open' }] }).length,
    0,
  );
  assert.equal(
    wallTransitions({
      ...room,
      walls: [
        { segment: 0, start: 0, end: 0.5, type: 'hull' },
        { segment: 0, start: 0.5, end: 1, type: 'internal' },
      ],
    }).filter((joint) => joint.x === 7 && joint.y === 2).length,
    0,
  );
});

test('divisória prolonga somente o encontro com uma parede perpendicular', async () => {
  const { partitionEndCaps } = await import('../src/blueprints/wall-geometry.js');
  const partition = {
    id: 'a',
    kind: 'room',
    x: 10,
    y: 10,
    w: 10,
    h: 10,
    walls: [{ segment: 3, start: 0, end: 1, type: 'internal' }],
  };
  const upper = { id: 'b', kind: 'room', x: 0, y: 0, w: 20, h: 10 };
  const caps = partitionEndCaps(partition, [partition, upper]);
  assert.deepEqual(caps, [{ type: 'internal', d: 'M 10 10 L 10 9.8' }]);
  assert.equal(partitionEndCaps(partition, [partition, { ...upper, y: -1 }]).length, 0);
  assert.equal(partitionEndCaps({ ...partition, joinWalls: true }, [upper]).length, 0);
  assert.equal(
    partitionEndCaps({ ...partition, walls: [{ segment: 3, start: 0, end: 1, type: 'open' }] }, [
      upper,
    ]).length,
    0,
  );
});
