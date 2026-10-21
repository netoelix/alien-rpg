import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { selectionBounds, selectInBox } from '../src/blueprints/selection.js';
import {
  copyBlueprint,
  pasteBlueprint,
  removeSelection,
  duplicateSelection,
} from '../src/blueprints/clipboard.js';

test('exclusão e duplicação em conjunto preservam peças externas e respeitam vínculos bloqueados', () => {
  const project = {
    ...newProject(),
    elements: [
      { id: 'a', kind: 'room', x: 2, y: 2, w: 8, h: 8 },
      { id: 'b', kind: 'asset', asset: 'console', x: 4, y: 4, w: 2, h: 2, rotation: 0 },
      { id: 'c', kind: 'asset', asset: 'console', x: 7, y: 7, w: 1, h: 1, rotation: 0 },
      { id: 'd', kind: 'door', wallId: 'a', segment: 0, t: 0.5, width: 1 },
    ],
  };
  const removed = removeSelection(project, ['a', 'b']);
  assert.deepEqual(
    removed.elements.map((e) => e.id),
    ['c'],
  );
  assert.equal(project.elements.length, 4);
  const copy = duplicateSelection(project, ['a', 'b']);
  assert.equal(copy.ids.length, 3);
  assert.equal(copy.project.elements.length, 7);
  assert.equal(copy.project.elements.at(-1).wallId, copy.selectedId);
  const blocked = {
    ...project,
    layers: project.layers.map((layer) =>
      layer.id === 'doors' ? { ...layer, locked: true } : layer,
    ),
  };
  assert.throws(() => removeSelection(blocked, ['a', 'b']));
  assert.throws(() => duplicateSelection(blocked, ['a', 'b']));
  assert.equal(blocked.elements.length, 4);
});

test('seleção por área exige contenção e respeita camadas e direção do arraste', () => {
  const project = {
    ...newProject(),
    elements: [
      { id: 'a', kind: 'room', x: 2, y: 2, w: 4, h: 4 },
      { id: 'b', kind: 'room', x: 5, y: 5, w: 4, h: 4 },
    ],
  };
  assert.deepEqual(selectInBox(project, { x: 0, y: 0 }, { x: 7, y: 7 }), ['a']);
  assert.deepEqual(selectInBox(project, { x: 7, y: 7 }, { x: 0, y: 0 }), ['a']);
  assert.deepEqual(
    selectInBox(
      { ...project, layers: project.layers.map((l) => ({ ...l, locked: true })) },
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ),
    [],
  );
  const box = selectionBounds({ kind: 'asset', x: 2, y: 2, w: 4, h: 2, rotation: 90 });
  assert.ok(Math.abs(box.w - 2) < 1e-8);
  assert.ok(Math.abs(box.h - 4) < 1e-8);
});

test('copiar seleção múltipla não duplica peças compartilhadas e remapeia vínculos', () => {
  const project = {
    ...newProject(),
    elements: [
      { id: 'a', kind: 'room', x: 2, y: 2, w: 8, h: 8 },
      { id: 'b', kind: 'asset', asset: 'console', x: 4, y: 4, w: 2, h: 2, rotation: 0 },
      { id: 'd', kind: 'door', wallId: 'a', segment: 0, t: 0.5, width: 1 },
    ],
  };
  const copied = copyBlueprint(project, ['a', 'b']);
  assert.equal(copied.elements.length, 3);
  const pasted = pasteBlueprint(project, copied, 2, 2);
  assert.equal(pasted.ids.length, 3);
  assert.equal(pasted.project.elements.at(-1).wallId, pasted.selectedId);
});

test('duplicação procura outra posição quando a porta fica sem suporte na sobreposição', async () => {
  const { exampleProject, openingHasWall } = await import('../src/blueprints/model.js');
  const project = exampleProject();
  const room = project.elements.find((element) => element.kind === 'room');
  const result = duplicateSelection(project, [room.id]);
  for (const door of result.project.elements.filter(
    (element) => result.ids.includes(element.id) && element.kind === 'door',
  )) {
    assert.ok(openingHasWall(door, result.project.elements));
  }
});
