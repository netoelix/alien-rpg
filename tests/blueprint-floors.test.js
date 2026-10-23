import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import {
  activeFloor,
  floorList,
  addFloor,
  switchFloor,
  renameFloor,
  removeFloor,
} from '../src/blueprints/floors.js';
const fixture = () => ({
  ...newProject(),
  elements: [
    { id: 'a', kind: 'room', x: 2, y: 2, w: 8, h: 8, groupId: 'g' },
    { id: 'd', kind: 'door', wallId: 'a', segment: 0, t: 0.5, width: 1 },
  ],
});
const roundtrip = (project) => parseProject(JSON.stringify(project));
test('legacy project and multiple floors survive save/reopen without mixing objects', () => {
  const original = roundtrip(fixture());
  assert.equal(floorList(original)[0].name, 'Pavimento 1');
  const second = roundtrip(addFloor(original));
  assert.equal(second.elements.length, 0);
  assert.equal(second.floors.length, 2);
  const named = roundtrip(renameFloor(second, 'Ponte'));
  const restored = roundtrip(switchFloor(named, activeFloor(original)));
  assert.deepEqual(restored.elements, original.elements);
  assert.equal(restored.floors[1].name, 'Ponte');
  assert.equal(switchFloor(restored, named.activeFloor).elements.length, 0);
});
test('duplicate floor remaps doors and groups and does not mutate the source', () => {
  const source = fixture();
  const copy = roundtrip(addFloor(source, true));
  assert.notEqual(copy.elements[0].id, 'a');
  assert.notEqual(copy.elements[0].groupId, 'g');
  assert.equal(copy.elements[1].wallId, copy.elements[0].id);
  copy.elements[0].x = 20;
  const original = switchFloor(copy, activeFloor(source));
  assert.equal(original.elements[0].x, 2);
  assert.equal(source.elements[0].x, 2);
});
test('delete deck preserves other decks and refuses to remove the last', () => {
  const original = fixture();
  const second = addFloor(original, true);
  const removed = roundtrip(removeFloor(second));
  assert.equal(removed.floors.length, 1);
  assert.deepEqual(removed.elements, roundtrip(original).elements);
  assert.throws(() => removeFloor(original));
  assert.throws(() => renameFloor(original, '   '));
  assert.throws(() => switchFloor(original, 'missing'));
});
test('inactive decks are validated, including dangling openings and project boundaries', () => {
  const project = addFloor(fixture());
  project.floors[0].elements[1].wallId = 'missing';
  assert.throws(() => roundtrip(project));
  const bounds = addFloor(fixture());
  bounds.width = 10;
  bounds.floors[0].elements[0].x = 9;
  assert.throws(() => roundtrip(bounds));
  assert.throws(() => roundtrip({ ...addFloor(fixture()), activeFloor: 'missing' }));
});
