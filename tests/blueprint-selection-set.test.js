import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { clickedGroup, boxSelection, toggleSelection } from '../src/blueprints/selection-set.js';

test('reverse marquee selects the room as primary even when its door precedes it', () => {
  const room = { id: 'room', kind: 'room', x: 2, y: 2, w: 4, h: 4 };
  const project = {
    ...newProject(),
    elements: [
      { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1 },
      room,
      { ...room, id: 'other', x: 12 },
    ],
  };
  const box = { start: { x: 8, y: 8 }, end: { x: 1, y: 1 } };
  const selection = boxSelection(project, box, []);
  assert.deepEqual(selection, { selectedId: 'room', ids: ['door', 'room'] });
  const combined = boxSelection(project, { ...box, additive: true }, ['other']);
  assert.equal(combined.selectedId, 'other');
  assert.deepEqual(toggleSelection(project, combined.ids, 'room'), {
    selectedId: 'other',
    ids: ['other'],
  });
  assert.equal(toggleSelection(project, selection.ids, 'room'), null);
});

test('a grouped door selects its own wall and additive gestures retain the chosen primary', () => {
  const room = { id: 'room', kind: 'room', x: 2, y: 2, w: 4, h: 4, groupId: 'g' };
  const other = { ...room, id: 'other', x: 10 };
  const door = {
    id: 'door',
    kind: 'door',
    wallId: room.id,
    groupId: 'g',
    segment: 0,
    t: 0.5,
    width: 1,
  };
  const project = {
    ...newProject(),
    elements: [other, door, room, { ...room, id: 'extra', groupId: undefined, x: 20 }],
  };
  const group = clickedGroup(project, door);
  assert.equal(group.selectedId, 'room');
  assert.equal(clickedGroup(project, other).selectedId, 'other');
  const box = { start: { x: 19, y: 1 }, end: { x: 25, y: 8 }, additive: true };
  const added = boxSelection(project, box, group.ids, group.selectedId);
  assert.equal(added.selectedId, 'room');
  assert.ok(added.ids.includes('extra'));
  assert.deepEqual(toggleSelection(project, added.ids, 'extra', added.selectedId), group);
  assert.equal(toggleSelection(project, added.ids, 'room', added.selectedId).selectedId, 'extra');
});
