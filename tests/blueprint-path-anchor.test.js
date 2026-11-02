import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject, changeVertexCount } from '../src/blueprints/model.js';
const save = (p) => parseProject(JSON.stringify(p));
test('removing a corridor endpoint keeps doors on their original cap and side after reopening', () => {
  const corridor = {
    id: 'c',
    kind: 'corridor',
    width: 2,
    closedStart: true,
    closedEnd: true,
    points: [
      { x: 3, y: 4 },
      { x: 13, y: 4 },
      { x: 13, y: 14 },
    ],
  };
  const door = (id, segment) => ({ id, kind: 'door', wallId: 'c', segment, t: 0.5, width: 0.75 });
  const p = save({
    ...newProject(),
    elements: [corridor, door('start', 4), door('end', 5), door('side', 3)],
  });
  const result = save(changeVertexCount(p, 'c', 0, 'remove'));
  assert.deepEqual(
    result.elements.slice(1).map((e) => [e.id, e.segment, e.t]),
    [
      ['start', 2, 0.5],
      ['end', 3, 0.5],
      ['side', 1, 0.5],
    ],
  );
});
test('splitting a retraced vent keeps the hatch on the later pass', () => {
  const v = {
    id: 'v',
    kind: 'vent',
    width: 1,
    points: [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 15 },
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 20, y: 5 },
    ],
    ports: [{ id: 'port', type: 'floor', label: '', side: 1, segment: 3, t: 0.75 }],
  };
  const p = save({ ...newProject(), elements: [v] });
  const next = save(changeVertexCount(p, 'v', 3, 'insert'));
  assert.deepEqual(next.elements[0].ports, [{ ...v.ports[0], segment: 4, t: 0.5 }]);
});

test('a folded capped corridor rejects collapsing its return before remapping doors', () => {
  const points = [
    { x: 4, y: 4 },
    { x: 12, y: 4 },
    { x: 4, y: 4 },
  ];
  const corridor = {
    id: 'c',
    kind: 'corridor',
    width: 2,
    closedStart: true,
    closedEnd: true,
    points,
  };
  const p = save({
    ...newProject(),
    elements: [corridor, { id: 'd', kind: 'door', wallId: 'c', segment: 4, t: 0.5, width: 0.75 }],
  });
  const before = JSON.stringify(p);
  assert.throws(() => changeVertexCount(p, 'c', 1, 'remove'), /0,25 m/);
  assert.equal(JSON.stringify(p), before);
  const split = save(changeVertexCount(p, 'c', 0, 'insert'));
  assert.equal(split.elements[1].segment, 6);
  assert.deepEqual(save(changeVertexCount(split, 'c', 1, 'remove')), p);
});

test('removing the first polygon corner keeps a nearby door on the replacement wall', () => {
  const points = [
    { x: 4, y: 4 },
    { x: 16, y: 4 },
    { x: 16, y: 8 },
    { x: 4, y: 8 },
  ];
  const room = { id: 'r', kind: 'polygon', points };
  const opening = (id, segment, t, openingType) => ({
    id,
    kind: 'door',
    wallId: 'r',
    segment,
    t,
    width: 0.5,
    openingType,
  });
  const p = save({
    ...newProject(),
    elements: [room, opening('d', 0, 0.8, 'door'), opening('w', 1, 0.5, 'fortifiedWindow')],
  });
  const next = save(changeVertexCount(p, 'r', 0, 'remove'));
  assert.equal(next.elements[1].segment, 2);
  assert.equal(next.elements[2].segment, 0);
  assert.equal(next.elements[2].openingType, 'fortifiedWindow');
  assert.equal(next.elements[2].t, 0.5);
});

test('splitting and restoring the closing polygon edge preserves a window on each half', () => {
  const room = {
    id: 'r',
    kind: 'polygon',
    points: [
      { x: 4, y: 4 },
      { x: 16, y: 4 },
      { x: 16, y: 16 },
      { x: 4, y: 16 },
    ],
  };
  const windows = [0.25, 0.75].map((t, i) => ({
    id: 'w' + i,
    kind: 'door',
    wallId: 'r',
    segment: 3,
    t,
    width: 1,
    openingType: 'slimWindow',
  }));
  const p = save({ ...newProject(), elements: [room, ...windows] });
  const split = save(changeVertexCount(p, 'r', 3, 'insert'));
  assert.deepEqual(
    split.elements.slice(1).map((e) => [e.segment, e.t]),
    [
      [3, 0.5],
      [4, 0.5],
    ],
  );
  assert.deepEqual(save(changeVertexCount(split, 'r', 4, 'remove')), p);
});

test('removing a corner rejects newly overlapping openings and accepts separated ones', () => {
  const room = {
    id: 'r',
    kind: 'polygon',
    points: [
      { x: 4, y: 8 },
      { x: 9, y: 2 },
      { x: 14, y: 8 },
      { x: 14, y: 14 },
      { x: 4, y: 14 },
    ],
  };
  const opening = (id, segment, t, type) => ({
    kind: 'door',
    id,
    wallId: 'r',
    segment,
    t,
    width: 2,
    openingType: type,
  });
  const make = (a, b) =>
    save({
      ...newProject(),
      elements: [room, opening('d', 0, a, 'door'), opening('w', 1, b, 'window')],
    });
  const crowded = make(0.9, 0.1),
    before = JSON.stringify(crowded);
  assert.throws(() => changeVertexCount(crowded, 'r', 1, 'remove'), /sobrepostas/);
  assert.equal(JSON.stringify(crowded), before);
  const result = save(changeVertexCount(make(0.3, 0.7), 'r', 1, 'remove'));
  assert.deepEqual(
    result.elements.slice(1).map((e) => [e.segment, e.openingType]),
    [
      [0, 'door'],
      [0, 'window'],
    ],
  );
  assert.ok(result.elements[2].t - result.elements[1].t > 0.2);
});

test('splitting respects the full window and frame clearance on a polygon or either corridor side', () => {
  const points = [
    { x: 4, y: 4 },
    { x: 14, y: 4 },
    { x: 14, y: 14 },
    { x: 4, y: 14 },
  ];
  for (const [kind, segment] of [
    ['polygon', 0],
    ['corridor', 0],
    ['corridor', 1],
  ]) {
    const parent = { id: 'r', kind, points, ...(kind === 'corridor' ? { width: 2 } : {}) };
    const make = (t) =>
      save({
        ...newProject(),
        elements: [
          parent,
          {
            kind: 'door',
            id: 'w',
            wallId: 'r',
            segment,
            t,
            width: 2,
            openingType: 'fortifiedWindow',
          },
        ],
      });
    for (const t of [0.5, 0.61, 0.39]) {
      const p = make(t),
        before = JSON.stringify(p);
      assert.throws(() => changeVertexCount(p, 'r', 0, 'insert'), /Afaste a abertura/);
      assert.equal(JSON.stringify(p), before);
    }
    const p = make(0.612);
    const split = save(changeVertexCount(p, 'r', 0, 'insert'));
    assert.equal(split.elements[1].openingType, 'fortifiedWindow');
    assert.ok(Math.abs(split.elements[1].t - 0.224) < 1e-8);
  }
});
