import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import {
  objectVisible,
  objectEditable,
  setObjectFlag,
  assertObjectChanges,
} from '../src/blueprints/objects.js';
import { selectInBox } from '../src/blueprints/selection.js';
import { rotateGroup } from '../src/blueprints/groups.js';
const fixture = () => ({
  ...newProject(),
  elements: [
    { id: 'room', kind: 'room', x: 2, y: 2, w: 10, h: 10 },
    { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1 },
    { id: 'asset', kind: 'asset', asset: 'console', x: 4, y: 4, w: 1, h: 1, rotation: 0 },
  ],
});
test('object visibility and lock persist independently and legacy files remain visible', () => {
  let project = fixture();
  assert.equal(objectVisible(project, project.elements[0]), true);
  project = setObjectFlag(project, 'room', 'hidden', true);
  project = setObjectFlag(project, 'asset', 'locked', true);
  const saved = parseProject(JSON.stringify(project));
  assert.equal(saved.elements[0].hidden, true);
  assert.equal(saved.elements[2].locked, true);
  assert.equal(objectVisible(saved, saved.elements[1]), false);
  assert.equal(objectVisible(saved, saved.elements[2]), true);
  assert.deepEqual(selectInBox(saved, { x: 0, y: 0 }, { x: 20, y: 20 }), []);
  assert.throws(() =>
    parseProject(
      JSON.stringify({ ...project, elements: [{ ...project.elements[0], locked: 'yes' }] }),
    ),
  );
});
test('lock rejects indirect transformations and deletion while allowing unlock', () => {
  const project = setObjectFlag(fixture(), 'room', 'locked', true);
  assert.equal(objectEditable(project, project.elements[1]), false);
  assert.throws(() =>
    assertObjectChanges(project, {
      ...project,
      elements: project.elements.filter((e) => e.id !== 'room'),
    }),
  );
  assert.throws(() =>
    assertObjectChanges(project, {
      ...project,
      elements: project.elements.map((e) => (e.id === 'door' ? { ...e, t: 0.7 } : e)),
    }),
  );
  assert.throws(() => rotateGroup(project, ['room', 'asset']));
  assert.doesNotThrow(() =>
    assertObjectChanges(project, setObjectFlag(project, 'room', 'locked', false)),
  );
});
