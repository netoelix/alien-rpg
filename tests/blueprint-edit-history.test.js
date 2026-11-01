import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { startHistory, applyEdit, undoEdit, redoEdit } from '../src/blueprints/edit-history.js';

test('a rejected edit after undo preserves redo; a successful branch replaces it', () => {
  const initial = startHistory(newProject());
  const first = applyEdit(initial, { ...initial.project, name: 'Hangar' });
  const second = applyEdit(first, { ...first.project, name: 'Hangar B' });
  const undone = undoEdit(second);
  assert.equal(undone.project, first.project);
  assert.throws(() => applyEdit(undone, { ...undone.project, width: -1 }), /Medida/);
  assert.equal(redoEdit(undone).project, second.project);
  const branch = applyEdit(undone, { ...undone.project, name: 'Oficina' });
  assert.equal(redoEdit(branch), branch);
  assert.equal(undoEdit(branch).project, first.project);
});

test('only the last fifty changes can be undone; opening a project starts a fresh history', () => {
  let history = startHistory(newProject());
  for (let step = 1; step <= 55; step++) {
    history = applyEdit(history, { ...history.project, name: String(step) });
  }
  for (let step = 0; step < 50; step++) history = undoEdit(history);
  assert.equal(history.project.name, '5');
  assert.equal(undoEdit(history), history);
  for (let step = 0; step < 50; step++) history = redoEdit(history);
  assert.equal(history.project.name, '55');
  const fresh = startHistory(newProject());
  assert.equal(undoEdit(fresh), fresh);
  assert.equal(redoEdit(fresh), fresh);
});
