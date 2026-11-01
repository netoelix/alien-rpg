import test from 'node:test';
import assert from 'node:assert/strict';
import { gesturePreview } from '../src/blueprints/gesture-preview.js';
import { transformGestureTarget } from '../src/blueprints/gesture-transform.js';
import { applyEdit, startHistory, undoEdit } from '../src/blueprints/edit-history.js';
import { newProject } from '../src/blueprints/model.js';

test('dragging the west edge previews and commits the same dimensions and undo restores the room', () => {
  const room = { id: 'room', kind: 'room', x: 10, y: 10, w: 10, h: 8 };
  const project = { ...newProject(), elements: [room] };
  const gesture = {
    kind: 'resize',
    element: room,
    handle: 'w',
    start: { x: 10, y: 14 },
    end: { x: 7, y: 21 },
  };
  const { drawn } = gesturePreview({ project, gesture, points: [], tool: 'select' });
  const history = applyEdit(startHistory(project), transformGestureTarget(project, gesture));
  for (const result of [drawn, history.project]) {
    const { x, y, w, h } = result.elements[0];
    assert.deepEqual({ x, y, w, h }, { x: 7, y: 10, w: 13, h: 8 });
  }
  assert.equal(undoEdit(history).project.elements[0].w, 10);
});
