import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { prepareEdit } from '../src/blueprints/prepare-edit.js';

const room = { id: 'room', kind: 'room', x: 2, y: 2, w: 10, h: 10 };
const door = { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0, width: 1 };

test('an edit fits the opening before returning a saveable snapshot', () => {
  const project = { ...newProject(), elements: [room] };
  const candidate = { ...project, elements: [room, door] };
  const edited = prepareEdit(project, candidate);
  assert.equal(edited.elements[1].t, 0.062);
  assert.equal(candidate.elements[1].t, 0);
  assert.equal(project.elements.length, 1);
  assert.deepEqual(parseProject(JSON.stringify(edited)), edited);
});

test('moving a door on a locked room rejects the edit and preserves the previous snapshot', () => {
  const project = parseProject(
    JSON.stringify({
      ...newProject(),
      elements: [
        { ...room, locked: true },
        { ...door, t: 0.5 },
      ],
    }),
  );
  const before = JSON.stringify(project);
  const candidate = {
    ...project,
    elements: [project.elements[0], { ...project.elements[1], t: 0.8 }],
  };
  assert.throws(() => prepareEdit(project, candidate), /desbloqueie/);
  assert.equal(JSON.stringify(project), before);
});
