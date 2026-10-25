import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  wallSegments,
  removeElement,
  doorPosition,
} from '../src/blueprints/model.js';
import { setCorridorEnd } from '../src/blueprints/corridor-ends.js';
import { openingGeometry } from '../src/blueprints/wall-geometry.js';
const corridor = {
  id: 'c',
  kind: 'corridor',
  width: 4,
  points: [
    { x: 10, y: 10 },
    { x: 30, y: 10 },
  ],
};
test('corridor ends preserve side indices and remap opposite end openings', () => {
  let p = { ...newProject(), elements: [corridor] };
  p = setCorridorEnd(p, 'c', 'closedEnd', true);
  assert.equal(wallSegments(p.elements[0]).length, 3);
  p.elements.push({ id: 'd', kind: 'door', wallId: 'c', segment: 2, t: 0.5, width: 1 });
  const original = doorPosition(p.elements[1], p.elements);
  p = setCorridorEnd(p, 'c', 'closedStart', true);
  assert.equal(p.elements[1].segment, 3);
  assert.deepEqual(doorPosition(p.elements[1], p.elements), original);
  p = setCorridorEnd(p, 'c', 'closedStart', false);
  assert.equal(p.elements[1].segment, 2);
  p = parseProject(JSON.stringify(p));
  assert.equal(p.elements[0].closedEnd, true);
  p = setCorridorEnd(p, 'c', 'closedEnd', false);
  assert.equal(p.elements.length, 1);
  assert.equal(wallSegments(p.elements[0]).length, 2);
});
test('standalone walls accept openings at their center and remove attached openings', () => {
  const wall = {
    id: 'w',
    kind: 'partition',
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
    ],
    walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }],
  };
  const p = parseProject(
    JSON.stringify({
      ...newProject(),
      elements: [wall, { id: 'd', kind: 'door', wallId: 'w', segment: 0, t: 0.5, width: 1 }],
    }),
  );
  const g = openingGeometry(p.elements[1], p.elements);
  assert.equal(g.x, 15);
  assert.equal(g.y, 10);
  assert.equal(g.depth, 0.7);
  assert.equal(removeElement(p, 'w').elements.length, 0);
});

test('closed corridor walls form a continuous contour regardless of edge direction', async () => {
  const { wallRuns } = await import('../src/blueprints/wall-geometry.js');
  const { persistentWallStructure } = await import('../src/blueprints/shared-walls.js');
  for (const flags of [
    { closedStart: true },
    { closedEnd: true },
    { closedStart: true, closedEnd: true },
  ]) {
    const runs = wallRuns(persistentWallStructure({ ...corridor, ...flags }));
    assert.equal(runs.length, 1);
    assert.equal(runs[0].closed, !!(flags.closedStart && flags.closedEnd));
    assert.equal(runs[0].points.length, 4);
  }
});
