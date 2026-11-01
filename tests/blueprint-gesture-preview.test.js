import { moveGestureTarget } from '../src/blueprints/gesture-transform.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { gesturePreview } from '../src/blueprints/gesture-preview.js';
import { newProject } from '../src/blueprints/model.js';

test('dragging a door previews the new wall without changing its saved parent', () => {
  const room = { kind: 'room', id: 'a', x: 2, y: 2, w: 6, h: 6 };
  const target = { ...room, id: 'b', x: 20 };
  const door = { kind: 'door', id: 'd', wallId: 'a', segment: 0, t: 0.5, width: 1 };
  const project = { ...newProject(), elements: [room, target, door] };
  const options = {
    project,
    tool: 'select',
    points: [],
    gesture: { kind: 'move', element: door, end: { x: 23, y: 2 } },
  };
  const { drawn } = gesturePreview(options);
  assert.equal(drawn.elements[2].wallId, 'b');
  assert.equal(drawn.elements[2].t, 0.5);
  assert.equal(project.elements[2].wallId, 'a');
});

test('drawing a pool backwards previews its four corners and leaves the project empty', () => {
  const project = newProject();
  const { preview } = gesturePreview({
    project,
    points: [],
    tool: 'room',
    areaPurpose: 'pool',
    regionFinish: {},
    gesture: { kind: 'room', start: { x: 9, y: 7 }, end: { x: 3, y: 2 } },
  });
  assert.equal(preview[0].floorFinish.type, 'pool');
  assert.deepEqual(preview[0].points, [
    { x: 3, y: 2 },
    { x: 9, y: 2 },
    { x: 9, y: 7 },
    { x: 3, y: 7 },
  ]);
  assert.equal(project.elements.length, 0);
});

test('group drag previews the committed coordinates and keeps the door on its room', () => {
  const room = { id: 'r', kind: 'room', x: 3, y: 4, w: 6, h: 6 };
  const door = { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 1 };
  const project = { ...newProject(), elements: [room, door] };
  const gesture = { kind: 'move', element: room, start: { x: 3, y: 4 }, end: { x: 7, y: 6 } };
  const group = { selectedId: 'r', ids: ['r', 'd'] };
  const { drawn } = gesturePreview({
    project,
    gesture,
    pastedGroup: group,
    tool: 'select',
    points: [],
  });
  const moved = moveGestureTarget(project, gesture, group);
  assert.deepEqual(drawn.elements, moved.elements);
  assert.deepEqual(moved.elements[0], { ...room, x: 7, y: 6 });
  assert.deepEqual(moved.elements[1], door);
  const locked = { ...project, elements: [room, { ...door, locked: true }] };
  assert.throws(() => moveGestureTarget(locked, gesture, group), /desbloqueie/);
  assert.equal(project.elements[0].x, 3);
});
