import test from 'node:test';
import assert from 'node:assert/strict';
import { editPathVertex } from '../src/blueprints/gesture-transform.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
const point = (x, y) => ({ x, y });
const start = point(10, 10),
  end = point(12, 12);
test('shared circulation endpoints move across road and path, isolated crossings and sidewalks stay put', () => {
  const road = {
    kind: 'trace',
    traceType: 'road',
    id: 'r',
    points: [point(5, 10), start],
    sidewalkWidth: 1,
  };
  const path = { ...road, id: 'p', traceType: 'path', points: [start, point(15, 15)] };
  const crossing = { ...path, id: 'x', points: [point(10, 5), start, point(10, 15)] };
  const others = [
    crossing,
    { ...path, id: 's', traceType: 'sidewalk' },
    { ...path, id: 'locked', locked: true },
  ];
  const next = editPathVertex({ elements: [road, path, ...others] }, road, 1, end);
  assert.deepEqual(next.elements[1].points[0], end);
  assert.deepEqual(next.elements.slice(2), others);
  assert.equal(next.elements[0].sidewalkWidth, 1);
});
test('connected open corridor ends retain edited wall, opposite cap and anchored door after save', () => {
  const first = { kind: 'corridor', id: 'a', width: 2, points: [point(5, 10), start] };
  const second = {
    ...first,
    id: 'b',
    closedEnd: true,
    points: [start, point(20, 10)],
    walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }],
  };
  const door = { kind: 'door', id: 'd', wallId: 'b', segment: 2, t: 0.5, width: 0.75 };
  const capped = { ...first, id: 'c', closedEnd: true };
  const save = (p) => parseProject(JSON.stringify(p));
  const project = save({ ...newProject(), elements: [first, second, door, capped] });
  const next = save(editPathVertex(project, project.elements[0], 1, end));
  assert.deepEqual(next.elements[1].points[0], end);
  assert.deepEqual(next.elements[1].walls, project.elements[1].walls);
  assert.equal(next.elements[1].closedEnd, true);
  assert.deepEqual(next.elements.slice(2), project.elements.slice(2));
});
