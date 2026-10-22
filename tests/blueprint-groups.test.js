import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { expandGroups, setSelectionGroup } from '../src/blueprints/groups.js';
import { duplicateSelection } from '../src/blueprints/clipboard.js';
const fixture = () => ({
  ...newProject(),
  elements: [
    { id: 'a', kind: 'room', x: 2, y: 2, w: 8, h: 8 },
    { id: 'b', kind: 'asset', asset: 'console', x: 4, y: 4, w: 2, h: 2, rotation: 0 },
    { id: 'd', kind: 'door', wallId: 'a', segment: 0, t: 0.5, width: 1 },
  ],
});
test('grupo persiste, inclui aberturas e desagrupa sem remover peças', () => {
  const original = fixture();
  const grouped = parseProject(JSON.stringify(setSelectionGroup(original, ['a', 'b'])));
  assert.ok(grouped.elements[0].groupId);
  assert.deepEqual(expandGroups(grouped, ['b']), ['a', 'b', 'd']);
  const ungrouped = setSelectionGroup(grouped, ['b'], true);
  assert.equal(ungrouped.elements.length, 3);
  assert.ok(ungrouped.elements.every((e) => !e.groupId));
  assert.ok(original.elements.every((e) => !e.groupId));
  const copied = duplicateSelection(grouped, expandGroups(grouped, ['a']));
  const copy = copied.project.elements.filter((e) => copied.ids.includes(e.id));
  assert.ok(copy.every((e) => e.groupId === copy[0].groupId));
  assert.notEqual(copy[0].groupId, grouped.elements[0].groupId);
});
test('grupo recusa peça única, camada bloqueada e identificador inválido', () => {
  const project = fixture();
  assert.throws(() => setSelectionGroup(project, ['a']));
  assert.throws(() =>
    setSelectionGroup({ ...project, layers: project.layers.map((l) => ({ ...l, locked: true })) }, [
      'a',
      'b',
    ]),
  );
  assert.throws(() =>
    parseProject(
      JSON.stringify({
        ...project,
        elements: project.elements.map((e) => ({ ...e, groupId: '' })),
      }),
    ),
  );
});

test('rotação do conjunto remapeia paredes e aberturas e quatro giros restauram a planta', async () => {
  const { rotateGroup } = await import('../src/blueprints/groups.js');
  const project = fixture();
  project.elements[0].w = 10;
  project.elements[0].walls = [{ segment: 0, start: 0, end: 1, type: 'hull' }];
  const grouped = setSelectionGroup(project, ['a', 'b']);
  const once = rotateGroup(grouped, ['b']);
  assert.equal(once.elements[0].w, 8);
  assert.equal(once.elements[0].walls[0].segment, 1);
  assert.equal(once.elements[2].segment, 1);
  assert.equal(once.elements[1].rotation, 90);
  let current = grouped;
  for (let i = 0; i < 4; i++) current = rotateGroup(current, ['a']);
  assert.deepEqual(current, grouped);
  assert.deepEqual(rotateGroup(once, ['a'], -1), grouped);
});

test('rotação suporta oval, caminhos e texto sem perder vínculos', async () => {
  const { rotateGroup } = await import('../src/blueprints/groups.js');
  const project = {
    ...newProject(),
    elements: [
      {
        id: 'oval',
        kind: 'ellipse',
        x: 10,
        y: 10,
        w: 8,
        h: 4,
        walls: [{ segment: 0, start: 0, end: 1, type: 'glass' }],
      },
      { id: 'door', kind: 'door', wallId: 'oval', segment: 0, t: 0.5, width: 1 },
      {
        id: 'vent',
        kind: 'vent',
        points: [
          { x: 12, y: 12 },
          { x: 15, y: 12 },
        ],
        width: 0.5,
      },
      { id: 'text', kind: 'label', x: 14, y: 12, text: 'PONTE', size: 1 },
    ],
  };
  const once = rotateGroup(project, ['oval', 'vent', 'text']);
  assert.equal(once.elements[0].walls[0].segment, 16);
  assert.equal(once.elements[1].segment, 16);
  assert.equal(once.elements[2].points[0].x, once.elements[2].points[1].x);
  assert.equal(once.elements[3].text, 'PONTE');
  assert.throws(() =>
    rotateGroup({ ...project, layers: project.layers.map((l) => ({ ...l, locked: true })) }, [
      'oval',
    ]),
  );
  const edge = { ...newProject(), elements: [{ id: 'r', kind: 'room', x: 0, y: 0, w: 12, h: 2 }] };
  assert.throws(() => rotateGroup(edge, ['r']));
  assert.equal(edge.elements[0].w, 12);
});

test('giro livre preserva segmentos, paredes e grupos de polígono com abertura', async () => {
  const { rotateGroup } = await import('../src/blueprints/groups.js');
  const project = {
    ...newProject(),
    elements: [
      {
        id: 'p',
        kind: 'polygon',
        groupId: 'g',
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 10 },
          { x: 20, y: 20 },
          { x: 10, y: 20 },
        ],
        walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }],
      },
      {
        id: 'a',
        kind: 'asset',
        groupId: 'g',
        asset: 'console',
        x: 14,
        y: 14,
        w: 2,
        h: 2,
        rotation: 0,
      },
      { id: 'd', kind: 'door', wallId: 'p', segment: 0, t: 0.5, width: 1 },
    ],
  };
  const result = rotateGroup(project, ['p'], 1, 45);
  assert.equal(result.elements.find((e) => e.id === 'a').rotation, 45);
  assert.equal(result.elements.find((e) => e.id === 'd').wallId, 'p');
  assert.equal(result.elements.find((e) => e.id === 'd').segment, 0);
  assert.deepEqual(result.elements.find((e) => e.id === 'p').walls, project.elements[0].walls);
  assert.equal(result.elements[0].groupId, 'g');
  const restored = rotateGroup(result, ['p'], 1, -45);
  restored.elements[0].points.forEach((p, i) => {
    assert.ok(Math.abs(p.x - project.elements[0].points[i].x) < 1e-8);
    assert.ok(Math.abs(p.y - project.elements[0].points[i].y) < 1e-8);
  });
});

test('giro livre aceita retângulo e recusa ângulo inválido e camadas bloqueadas', async () => {
  const { rotateGroup } = await import('../src/blueprints/groups.js');
  const p = fixture();
  assert.equal(rotateGroup(p, ['a'], 1, 45).elements[0].kind, 'room');
  assert.throws(() => rotateGroup(p, ['b'], 1, NaN), /ângulo/);
  const blocked = { ...p, layers: p.layers.map((l) => ({ ...l, locked: true })) };
  assert.throws(() => rotateGroup(blocked, ['b'], 1, 45), /camadas/);
});

test('alça de conjunto calcula pivô estável e respeita tipos e bloqueios', async () => {
  const { freeRotationFrame, rotationDragAngle } = await import('../src/blueprints/groups.js');
  const project = {
    ...newProject(),
    elements: [
      { id: 'a', kind: 'asset', asset: 'console', x: 10, y: 10, w: 2, h: 2, rotation: 0 },
      { id: 'b', kind: 'asset', asset: 'console', x: 20, y: 10, w: 2, h: 2, rotation: 0 },
    ],
  };
  const frame = freeRotationFrame(project, ['a', 'b']);
  assert.equal(frame.cx, 16);
  assert.equal(frame.cy, 11);
  assert.equal(rotationDragAngle(frame, { x: 16, y: 5 }, { x: 22, y: 11 }), 90);
  assert.equal(rotationDragAngle(frame, { x: 16, y: 5 }, { x: 10, y: 11 }), -90);
  assert.equal(rotationDragAngle(frame, { x: 16, y: 5 }, { x: 16, y: 11 }), 0);
  assert.equal(freeRotationFrame(project, ['a']), null);
  assert.equal(
    freeRotationFrame({ ...project, layers: project.layers.map((l) => ({ ...l, locked: true })) }, [
      'a',
      'b',
    ]),
    null,
  );
  assert.equal(freeRotationFrame(fixture(), ['a', 'b']).rootCount, 2);
  const angle = rotationDragAngle(frame, { x: 16, y: 5 }, { x: 20, y: 7 }, 15);
  assert.equal(angle, 45);
});

test('rotação aceita pivô escolhido sem deslocá-lo e valida suas coordenadas', async () => {
  const { rotateGroup } = await import('../src/blueprints/groups.js');
  const project = {
    ...newProject(),
    elements: [
      {
        id: 'p',
        kind: 'polygon',
        points: [
          { x: 20, y: 20 },
          { x: 24, y: 20 },
          { x: 24, y: 24 },
          { x: 20, y: 24 },
        ],
      },
      { id: 'd', kind: 'door', wallId: 'p', segment: 0, t: 0.5, width: 1 },
    ],
  };
  const result = rotateGroup(project, ['p'], 1, 90, { cx: 20, cy: 20 });
  assert.deepEqual(result.elements[0].points, [
    { x: 20, y: 20 },
    { x: 20, y: 24 },
    { x: 16, y: 24 },
    { x: 16, y: 20 },
  ]);
  assert.equal(result.elements[1].wallId, 'p');
  const restored = rotateGroup(result, ['p'], 1, -90, { cx: 20, cy: 20 });
  assert.deepEqual(restored.elements[0].points, project.elements[0].points);
  assert.throws(() => rotateGroup(project, ['p'], 1, 30, { cx: NaN, cy: 20 }), /pivô/);
  assert.throws(() => rotateGroup(project, ['p'], 1, 30, { cx: -1, cy: 20 }), /pivô/);
});

test('converter retângulo preserva contorno, equipamentos, grupo e aberturas', async () => {
  const { convertRoomsToPolygons, rotateGroup } = await import('../src/blueprints/groups.js');
  const { wallSegments } = await import('../src/blueprints/model.js');
  const project = fixture();
  const converted = convertRoomsToPolygons(project, ['a']);
  assert.equal(converted.elements[0].kind, 'polygon');
  assert.deepEqual(wallSegments(converted.elements[0]), wallSegments(project.elements[0]));
  assert.equal(converted.elements.find((e) => e.id === 'd').wallId, 'a');
  assert.equal(converted.elements.find((e) => e.id === 'd').segment, 0);
  assert.equal(converted.elements.find((e) => e.id === 'b').x, 4);
  assert.equal(project.elements[0].kind, 'room');
  assert.doesNotThrow(() => rotateGroup(converted, ['a', 'b'], 1, 15));
  const blocked = { ...project, layers: project.layers.map((l) => ({ ...l, locked: true })) };
  assert.throws(() => convertRoomsToPolygons(blocked, ['a']), /estrutura/);
});

test('sala por vértices, corredor e duto oferecem rotação individual com aberturas vinculadas', async () => {
  const { freeRotationFrame } = await import('../src/blueprints/groups.js');
  for (const kind of ['polygon', 'corridor', 'vent']) {
    const project = {
      ...newProject(),
      elements: [
        {
          id: 'p',
          kind,
          points: [
            { x: 10, y: 10 },
            { x: 20, y: 10 },
            { x: 20, y: 20 },
          ],
          width: 2,
        },
      ],
    };
    const frame = freeRotationFrame(project, ['p']);
    assert.equal(frame.rootCount, 1);
    assert.deepEqual(frame.ids, ['p']);
    assert.equal(frame.cx, 15);
    assert.equal(frame.cy, 15);
  }
  const p = {
    ...newProject(),
    elements: [
      {
        id: 'p',
        kind: 'polygon',
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 10 },
          { x: 20, y: 20 },
        ],
      },
      { id: 'd', kind: 'door', wallId: 'p', segment: 0, t: 0.5, width: 1 },
    ],
  };
  assert.deepEqual(freeRotationFrame(p, ['p']).ids, ['p', 'd']);
  assert.equal(freeRotationFrame(p, ['d']), null);
});
