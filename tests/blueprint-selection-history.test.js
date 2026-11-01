import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { applyEdit, startHistory, undoEdit, redoEdit } from '../src/blueprints/edit-history.js';
import {
  copyBlueprint,
  draftPaste,
  draftRemoval,
  duplicateSelection,
} from '../src/blueprints/clipboard.js';
import { draftSelectionGroup } from '../src/blueprints/groups.js';

test('group, paste, duplicate and remove keep openings attached across undo and redo', () => {
  const project = {
    ...newProject(),
    elements: [
      { id: 'r', kind: 'room', x: 2, y: 2, w: 5, h: 5 },
      { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 1 },
      { id: 'a', kind: 'asset', asset: 'console', x: 3, y: 3, w: 1, h: 1, rotation: 0 },
    ],
  };
  let history = applyEdit(startHistory(project), draftSelectionGroup(project, ['r', 'a']));
  const clipboard = copyBlueprint(history.project, 'r');
  const pasted = draftPaste(history.project, clipboard, 10, 0);
  history = applyEdit(history, pasted.project);
  const copies = history.project.elements.filter((e) => pasted.ids.includes(e.id));
  assert.equal(copies.find((e) => e.kind === 'door').wallId, pasted.selectedId);
  assert.equal(new Set(copies.map((e) => e.groupId)).size, 1);
  assert.notEqual(copies[0].groupId, history.project.elements[0].groupId);
  const duplicate = duplicateSelection(history.project, pasted.ids);
  history = applyEdit(history, duplicate.project);
  const removed = applyEdit(history, draftRemoval(history.project, duplicate.ids));
  const undone = undoEdit(removed);
  assert.equal(undone.project, history.project);
  assert.throws(() => applyEdit(undone, draftPaste(undone.project, clipboard, 999, 0).project));
  assert.equal(redoEdit(undone).project, removed.project);
});
