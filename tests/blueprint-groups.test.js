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
