import { followVentWalls } from '../src/blueprints/ventilation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ventAccess,
  ventSeams,
  ventNetworks,
  ventConnection,
} from '../src/blueprints/ventilation.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
const room = { id: 'r', kind: 'room', x: 10, y: 10, w: 10, h: 10 };
const vent = {
  id: 'v',
  kind: 'vent',
  width: 1,
  points: [
    { x: 5, y: 15 },
    { x: 10.1, y: 15 },
  ],
};
test('vent access aligns to walls, detects interiors and leaves outside ends open', () => {
  const access = ventAccess(vent, 1, [room]);
  assert.equal(access.type, 'grille');
  assert.equal(access.x, 10);
  assert.equal(access.y, 15);
  assert.equal(ventAccess(vent, 0, [room]).type, 'open');
  assert.equal(
    ventAccess({ ...vent, points: [vent.points[0], { x: 15, y: 15 }] }, 1, [room]).type,
    'hatch',
  );
  assert.equal(ventAccess(vent, 1, [{ ...room, hidden: true }]).type, 'open');
  const partition = {
    id: 'p',
    kind: 'partition',
    points: [
      { x: 20, y: 10 },
      { x: 20, y: 20 },
    ],
  };
  assert.equal(ventAccess(vent, 1, [partition]).type, 'open');
});
test('manual access choices persist and removed wall does not suggest grille', () => {
  const changed = { ...vent, accesses: ['cap', 'hatch'] };
  assert.equal(ventAccess(changed, 1, [room]).type, 'hatch');
  const parsed = parseProject(JSON.stringify({ ...newProject(), elements: [changed] }));
  assert.deepEqual(parsed.elements[0].accesses, ['cap', 'hatch']);
  const openRoom = { ...room, walls: [{ segment: 3, start: 0, end: 1, type: 'open' }] };
  assert.notEqual(ventAccess(vent, 1, [openRoom]).type, 'grille');
  assert.throws(() =>
    parseProject(
      JSON.stringify({ ...newProject(), elements: [{ ...vent, accesses: ['bad', 'auto'] }] }),
    ),
  );
  assert.equal(
    parseProject(JSON.stringify({ ...newProject(), elements: [vent] })).elements[0].accesses,
    undefined,
  );
});
test('duct seams remain bounded for large maps and ignore zero-length segments', () => {
  assert.equal(
    ventSeams({
      ...vent,
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
    }).length,
    0,
  );
  assert.ok(
    ventSeams({ ...vent, points: Array.from({ length: 200 }, (_, i) => ({ x: i * 100, y: 0 })) })
      .length <= 400,
  );
});

test('endpoint branches connect, crossings and explicit access remain independent', () => {
  const main = {
    id: 'main',
    kind: 'vent',
    width: 1,
    points: [
      { x: 0, y: 10 },
      { x: 20, y: 10 },
    ],
  };
  const branch = {
    id: 'branch',
    kind: 'vent',
    width: 1,
    points: [
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ],
  };
  assert.equal(ventNetworks([main, branch]).length, 1);
  assert.equal(ventAccess(branch, 1, [main, branch]).type, 'junction');
  assert.equal(ventConnection(branch, 1, [main]).targetId, 'main');
  const crossing = {
    ...branch,
    points: [
      { x: 10, y: 0 },
      { x: 10, y: 20 },
    ],
  };
  assert.equal(ventNetworks([main, crossing]).length, 2);
  assert.equal(ventNetworks([main, { ...branch, accesses: ['auto', 'cap'] }]).length, 2);
  assert.equal(ventNetworks([main, { ...branch, hidden: true }]).flat().length, 1);
  assert.equal(
    ventNetworks([
      main,
      {
        ...branch,
        points: [
          { x: 10, y: 0 },
          { x: 10, y: 9 },
        ],
      },
    ]).length,
    2,
  );
  assert.deepEqual(branch.points, [
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ]);
});

test('wall grilles follow translation and proportional resizing, including reopened projects', () => {
  const duct = {
    ...vent,
    points: [
      { x: 5, y: 15 },
      { x: 10, y: 15 },
    ],
  };
  const before = { ...newProject(), elements: [room, duct] };
  const moved = { ...before, elements: [{ ...room, x: 12, y: 12 }, duct] };
  const result = followVentWalls(before, moved);
  assert.deepEqual(result.elements[1].points, [
    { x: 5, y: 15 },
    { x: 12, y: 17 },
  ]);
  assert.deepEqual(duct.points, [
    { x: 5, y: 15 },
    { x: 10, y: 15 },
  ]);
  const reopened = parseProject(JSON.stringify(result));
  const resized = {
    ...reopened,
    elements: reopened.elements.map((e) => (e.id === 'r' ? { ...e, h: 20 } : e)),
  };
  assert.deepEqual(followVentWalls(reopened, resized).elements[1].points[1], { x: 12, y: 22 });
});
test('free hatches, moved ducts, removed parents and floor switches do not follow', () => {
  const duct = {
    ...vent,
    points: [
      { x: 5, y: 15 },
      { x: 10, y: 15 },
    ],
  };
  const before = { ...newProject(), elements: [room, duct] };
  const movedDuct = {
    ...duct,
    points: [
      { x: 7, y: 15 },
      { x: 12, y: 15 },
    ],
  };
  const next = { ...before, elements: [{ ...room, x: 12 }, movedDuct] };
  assert.equal(followVentWalls(before, next), next);
  const hatch = { ...duct, accesses: ['auto', 'hatch'] };
  const hatchBefore = { ...before, elements: [room, hatch] };
  const hatchNext = { ...before, elements: [{ ...room, x: 12 }, hatch] };
  assert.equal(followVentWalls(hatchBefore, hatchNext), hatchNext);
  const deleted = { ...before, elements: [duct] };
  assert.equal(followVentWalls(before, deleted), deleted);
  const switched = { ...next, activeFloor: 'other' };
  assert.equal(followVentWalls(before, switched), switched);
});
test('copied geometry binds to its own wall without references to original IDs', () => {
  const copyRoom = { ...room, id: 'copy-room', x: 30 };
  const copyVent = {
    ...vent,
    id: 'copy-vent',
    points: [
      { x: 25, y: 15 },
      { x: 30, y: 15 },
    ],
  };
  const before = { ...newProject(), elements: [room, vent, copyRoom, copyVent] };
  const next = {
    ...before,
    elements: before.elements.map((e) => (e.id === copyRoom.id ? { ...e, x: 32 } : e)),
  };
  const result = followVentWalls(before, next);
  assert.deepEqual(result.elements[3].points[1], { x: 32, y: 15 });
  assert.equal(result.elements[1], vent);
});
