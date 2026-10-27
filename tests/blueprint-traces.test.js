import test from 'node:test';
import assert from 'node:assert/strict';
import { traceGeometry } from '../src/blueprints/trace-geometry.js';
import { newProject, parseProject, changeVertexCount } from '../src/blueprints/model.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
const trace = {
  id: 't',
  kind: 'trace',
  traceType: 'rail',
  width: 2,
  rounded: true,
  side: 1,
  points: [
    { x: 10, y: 10 },
    { x: 20, y: 10 },
    { x: 20, y: 20 },
  ],
};
test('traces persist, edit vertices and copy through modules', () => {
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [trace] }));
  assert.deepEqual(p.elements[0], trace);
  assert.equal(changeVertexCount(p, 't', 0, 'insert').elements[0].points.length, 4);
  const module = createModule(p, ['t'], 'Trilho');
  assert.equal(placeModule(newProject(), module, 30, 30).project.elements[0].traceType, 'rail');
  assert.throws(() =>
    parseProject(JSON.stringify({ ...p, elements: [{ ...trace, traceType: 'unknown-type' }] })),
  );
});
test('curves generate finite rails, marks are bounded, ledge side reverses', () => {
  const g = traceGeometry(trace);
  assert.ok(g.center.length > trace.points.length);
  assert.ok([...g.left, ...g.right].every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
  const straight = {
    ...trace,
    traceType: 'ledge',
    rounded: false,
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
    ],
  };
  assert.ok(traceGeometry(straight).marks[0].b.y > 10);
  assert.ok(traceGeometry({ ...straight, side: -1 }).marks[0].b.y < 10);
  assert.ok(
    traceGeometry({
      ...trace,
      points: [
        { x: 0, y: 0 },
        { x: 2000, y: 0 },
      ],
    }).marks.length <= 600,
  );
  assert.equal(
    traceGeometry({
      ...trace,
      points: [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
    }).marks.length,
    0,
  );
});
