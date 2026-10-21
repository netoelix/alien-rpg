import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, setWallArc } from '../src/blueprints/model.js';
const project = () => ({
  ...newProject(),
  elements: [{ id: 'r', kind: 'ellipse', x: 5, y: 5, w: 10, h: 10 }],
});
test('arco atravessa zero e mantém o projeto original', () => {
  const original = project();
  const result = setWallArc(original, 'r', 270, 450, 'hull');
  assert.equal(result.elements[0].walls.length, 32);
  assert.equal(original.elements[0].walls, undefined);
  assert.equal(setWallArc(project(), 'r', 0, 360, 'glass').elements[0].walls.length, 64);
  assert.throws(() => setWallArc(original, 'r', 90, 80, 'hull'));
  assert.throws(() => setWallArc(original, 'r', 0, 361, 'hull'));
});
test('arco com abertura sobre porta falha sem aplicar alterações parciais', () => {
  const original = project();
  original.elements.push({ id: 'd', kind: 'door', wallId: 'r', segment: 10, t: 0.5, width: 1 });
  assert.throws(() => setWallArc(original, 'r', 0, 180, 'open'));
  assert.equal(original.elements[0].walls, undefined);
});
