import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPointToSegment } from '../src/blueprints/segment-geometry.js';
import { nearestVentPort } from '../src/blueprints/vent-ports.js';
import { floorElements, updateFloorElements } from '../src/blueprints/floor-store.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { addFloor, activeFloor } from '../src/blueprints/floors.js';
import { connectVentFloor, ventLinkEndpoint } from '../src/blueprints/vent-links.js';

test('segment projection clamps endpoints, handles diagonals and ignores zero-length edges', () => {
  const a = { x: 2, y: 3 },
    b = { x: 6, y: 7 };
  assert.deepEqual(projectPointToSegment({ x: 2, y: 7 }, a, b), {
    x: 4,
    y: 5,
    t: 0.5,
    distance: Math.sqrt(8),
  });
  assert.equal(projectPointToSegment({ x: -2, y: -1 }, a, b).t, 0);
  assert.equal(projectPointToSegment({ x: 10, y: 11 }, a, b).t, 1);
  assert.equal(projectPointToSegment(a, a, a), null);
  assert.deepEqual(nearestVentPort([a, a, b], { x: 4, y: 5 }), {
    segment: 1,
    t: 0.5,
    distance: 0,
  });
});

test('floor writes preserve other decks and never mutate the input', () => {
  const p = addFloor({ ...newProject(), elements: [{ id: 'original' }] });
  const before = JSON.stringify(p);
  const active = activeFloor(p),
    inactive = p.floors[0].id;
  const updated = updateFloorElements(
    updateFloorElements(p, active, [{ id: 'active' }]),
    inactive,
    [{ id: 'inactive' }],
  );
  assert.deepEqual(floorElements(updated, active), [{ id: 'active' }]);
  assert.deepEqual(floorElements(updated, inactive), [{ id: 'inactive' }]);
  assert.equal(JSON.stringify(p), before);
  assert.throws(() => updateFloorElements(p, 'missing', []), /Pavimento/);
});

test('vent connection can create its destination on the active floor without losing either deck', () => {
  let p = {
    ...newProject(),
    elements: [
      {
        id: 'source',
        kind: 'vent',
        width: 1,
        points: [
          { x: 3, y: 3 },
          { x: 12, y: 3 },
        ],
        ports: [{ id: 'port', type: 'ceiling', side: 1, segment: 0, t: 0.5, label: '' }],
      },
    ],
  };
  const from = { floorId: activeFloor(p), elementId: 'source', portId: 'port' };
  p = addFloor(p);
  const before = JSON.stringify(p),
    target = activeFloor(p);
  const next = parseProject(JSON.stringify(connectVentFloor(p, from, target)));
  assert.equal(activeFloor(next), target);
  assert.equal(next.elements.length, 1);
  assert.equal(floorElements(next, from.floorId)[0].id, 'source');
  assert.equal(ventLinkEndpoint(next, next.ventLinks[0].to).port.type, 'floor');
  assert.equal(JSON.stringify(p), before);
});

test('file boundary remains limited and inactive snapshots reject invalid measures', () => {
  assert.throws(() => parseProject(' '.repeat(5_000_001)), /5 MB/);
  assert.throws(() => parseProject('{'), SyntaxError);
  let p = { ...newProject(), elements: [{ id: 'room', kind: 'room', x: 2, y: 2, w: 8, h: 8 }] };
  p = addFloor(p);
  const saved = JSON.stringify(p);
  assert.equal(
    JSON.stringify(parseProject(saved)),
    JSON.stringify(parseProject(JSON.stringify(parseProject(saved)))),
  );
  p.floors[0].elements[0].w = -1;
  assert.throws(() => parseProject(JSON.stringify(p)), /Medida/);
});
