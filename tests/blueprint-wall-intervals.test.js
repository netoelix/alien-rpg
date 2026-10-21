import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, setWallSection, parseProject } from '../src/blueprints/model.js';
import { openingGeometry } from '../src/blueprints/wall-geometry.js';

const room = { id: 'r', kind: 'room', x: 5, y: 5, w: 10, h: 10 };
const project = () => ({ ...newProject(), elements: [room] });
const section = (start, end, type = 'hull') => ({ segment: 0, start, end, type });
const apply = (p, start, end, type) => setWallSection(p, 'r', section(start, end, type));

test('pintar um intervalo preserva os dois lados e reúne estilos iguais', () => {
  const original = apply(project(), 0, 1, 'hull');
  const split = apply(original, 0.3, 0.7, 'glass');
  assert.deepEqual(split.elements[0].walls, [
    section(0, 0.3),
    section(0.3, 0.7, 'glass'),
    section(0.7, 1),
  ]);
  assert.deepEqual(original.elements[0].walls, [section(0, 1)]);
  assert.deepEqual(apply(split, 0.3, 0.7, 'hull'), original);
  assert.deepEqual(parseProject(JSON.stringify(split)), split);
});

test('restaurar automática remove somente o intervalo e preserva outras bordas', () => {
  const full = setWallSection(apply(project(), 0, 1, 'hull'), 'r', {
    ...section(0, 1),
    segment: 1,
  });
  const gap = apply(full, 0.2, 0.8, 'auto');
  assert.deepEqual(gap.elements[0].walls, [
    section(0, 0.2),
    section(0.8, 1),
    { ...section(0, 1), segment: 1 },
  ]);
  assert.deepEqual(apply(apply(project(), 0, 1, 'hull'), 0, 1, 'auto'), project());
  assert.throws(() => apply(full, 0.8, 0.2, 'auto'));
});

test('importação recusa sobreposição, mas aceita intervalos adjacentes', () => {
  const read = (walls) =>
    parseProject(JSON.stringify({ ...project(), elements: [{ ...room, walls }] }));
  assert.throws(() => read([section(0, 0.7), section(0.5, 1)]), /sobrepor/);
  assert.throws(() => read([section(0, 1), section(0, 1)]), /sobrepor/);
  assert.doesNotThrow(() => read([section(0.5, 1), section(0, 0.5, 'glass')]));
});

test('portas e janelas protegem seus intervalos e usam a maior espessura na transição', () => {
  const door = {
    id: 'd',
    kind: 'door',
    wallId: 'r',
    segment: 0,
    t: 0.5,
    width: 2,
    openingType: 'window',
  };
  const p = { ...project(), elements: [room, door] };
  const mixed = apply(apply(p, 0, 0.5, 'glass'), 0.5, 1, 'hull');
  assert.equal(openingGeometry(door, mixed.elements).depth, 0.7);
  assert.throws(() => apply(mixed, 0.4, 0.6, 'open'));
  assert.doesNotThrow(() => apply(mixed, 0, 0.3, 'open'));
});
