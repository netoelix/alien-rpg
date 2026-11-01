import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { gesturePreview } from '../src/blueprints/gesture-preview.js';
import { rotateGestureGroup } from '../src/blueprints/gesture-transform.js';

const project = {
  ...newProject(),
  elements: [
    { id: 'r', kind: 'room', x: 10, y: 10, w: 6, h: 4 },
    { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 1 },
  ],
};
function turn(cx, cy, degrees) {
  const radians = (degrees * Math.PI) / 180;
  return {
    kind: 'rotateGroup',
    frame: { cx, cy, ids: ['r', 'd'] },
    step: 15,
    start: { x: cx + 4, y: cy },
    end: { x: cx + 4 * Math.cos(radians), y: cy + 4 * Math.sin(radians) },
  };
}
test('group handle snaps around the chosen pivot and keeps the opening in the preview and release', () => {
  const gesture = turn(10, 10, 88);
  const preview = gesturePreview({ project, gesture, tool: 'select', points: [] });
  const release = rotateGestureGroup(project, gesture);
  assert.equal(release.error, '');
  assert.equal(release.angle, 90);
  assert.deepEqual(release.project.elements, preview.drawn.elements);
  assert.equal(release.project.elements[1].wallId, 'r');
  assert.notEqual(release.project.elements[0].x, 10);
});
test('an out-of-bounds rotation reports the same error on release, and a zero turn retains the snapshot', () => {
  const gesture = turn(0, 0, 90);
  const preview = gesturePreview({ project, gesture, tool: 'select', points: [] });
  const release = rotateGestureGroup(project, gesture);
  assert.match(release.error, /limites/);
  assert.equal(preview.groupRotationError, release.error);
  assert.equal(release.project, project);
  assert.equal(rotateGestureGroup(project, turn(10, 10, 2)).project, project);
});
