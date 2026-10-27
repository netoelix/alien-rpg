import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { destinationLines, moveDestinationLabel } from '../src/blueprints/destination-labels.js';
import { ventAccess } from '../src/blueprints/ventilation.js';
test('destination boxes wrap long names without discarding words', () => {
  const text = 'Pavimento superior · Laboratório de análise e descontaminação';
  const lines = destinationLines(text);
  assert.ok(lines.length > 1);
  assert.ok(lines.every((l) => l.length <= 24));
  assert.equal(lines.join(' '), text);
  assert.ok(destinationLines('A'.repeat(80)).every((l) => l.length <= 24));
});
test('ceiling/floor endpoints and independent label offsets survive saving', () => {
  const vent = {
    id: 'v',
    kind: 'vent',
    width: 1.5,
    points: [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
    ],
    accesses: ['ceiling', 'floor'],
  };
  const moved = moveDestinationLabel(moveDestinationLabel(vent, 'end-0', 2, 3), 'end-1', -1, 4);
  assert.deepEqual(vent.destinationOffsets, undefined);
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [moved] }));
  const e = p.elements[0];
  assert.deepEqual(e.destinationOffsets, { 'end-0': { dx: 2, dy: 3 }, 'end-1': { dx: -1, dy: 4 } });
  assert.equal(ventAccess(e, 0, []).type, 'ceiling');
  assert.equal(ventAccess(e, 1, []).type, 'floor');
  assert.deepEqual(e.points, vent.points);
  assert.throws(() =>
    parseProject(
      JSON.stringify({
        ...p,
        elements: [{ ...e, destinationOffsets: { bad: { dx: 'oops', dy: 0 } } }],
      }),
    ),
  );
});
