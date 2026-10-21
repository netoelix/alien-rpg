import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { copyBlueprint, pasteBlueprint, movePastedGroup } from '../src/blueprints/clipboard.js';

const fixture = () => ({
  ...newProject(),
  elements: [
    { id: 'room', kind: 'room', x: 5, y: 5, w: 10, h: 10 },
    { id: 'desk', kind: 'asset', asset: 'console', x: 7, y: 7, w: 2, h: 2, rotation: 0 },
    { id: 'outside', kind: 'asset', asset: 'console', x: 25, y: 25, w: 2, h: 2, rotation: 0 },
    {
      id: 'window',
      kind: 'door',
      openingType: 'window',
      wallId: 'room',
      segment: 0,
      t: 0.5,
      width: 1,
    },
  ],
});

test('clipboard guarda snapshot independente com equipamentos e aberturas', () => {
  const project = fixture();
  const clipboard = copyBlueprint(project, 'room');
  assert.equal(clipboard.elements.length, 3);
  project.elements[0].x = 10;
  const first = pasteBlueprint(project, clipboard, 1, 1);
  const second = pasteBlueprint(first.project, clipboard, 2, 2);
  assert.equal(first.project.elements.find((e) => e.id === first.selectedId).x, 6);
  assert.notEqual(first.selectedId, second.selectedId);
  const opening = first.project.elements.find((e) => first.ids.includes(e.id) && e.kind === 'door');
  assert.equal(opening.wallId, first.selectedId);
  assert.equal(opening.openingType, 'window');
  const moved = movePastedGroup(first.project, first.ids, 3, 2);
  assert.equal(moved.elements.find((e) => e.id === first.selectedId).x, 9);
  assert.equal(moved.elements.find((e) => first.ids.includes(e.id) && e.kind === 'asset').x, 11);
  assert.equal(moved.elements.find((e) => e.id === 'outside').x, 25);
});

test('clipboard respeita camadas e limites sem aplicar cópia parcial', () => {
  const project = fixture();
  const clipboard = copyBlueprint(project, 'room');
  assert.throws(() => pasteBlueprint(project, clipboard, project.width, 0));
  assert.equal(project.elements.length, 4);
  const blocked = {
    ...project,
    layers: project.layers.map((layer) => ({ ...layer, locked: true })),
  };
  assert.throws(() => copyBlueprint(blocked, 'room'));
  assert.throws(() => pasteBlueprint(blocked, clipboard, 1, 1));
  assert.throws(() => movePastedGroup(blocked, ['room'], 1, 1));
  assert.throws(() => copyBlueprint(project, 'window'));
});
