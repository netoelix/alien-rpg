import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  setWallSection,
  wallSections,
  moveElement,
  duplicateElement,
  changeVertexCount,
  removeElement,
} from '../src/blueprints/model.js';
const room = { id: 'r', kind: 'room', x: 5, y: 5, w: 10, h: 10 };
const project = () => ({ ...newProject(), elements: [room] });
const section = { segment: 1, start: 0.2, end: 0.8, type: 'hull' };
test('paredes explícitas sobrevivem ao arquivo, movimento e duplicação', () => {
  const p = setWallSection(project(), 'r', section);
  assert.deepEqual(parseProject(JSON.stringify(p)), p);
  assert.equal(project().elements[0].walls, undefined);
  const before = wallSections(p.elements[0])[0];
  const moved = wallSections(moveElement(p.elements[0], 2, 3))[0];
  assert.deepEqual(moved.a, [before.a[0] + 2, before.a[1] + 3]);
  const copied = duplicateElement(p, 'r');
  assert.deepEqual(copied.project.elements.find((e) => e.id === copied.selectedId).walls, [
    section,
  ]);
  const reset = setWallSection(p, 'r', { ...section, type: 'auto' });
  assert.deepEqual(reset, project());
});
test('abertura livre protege portas e aceita remoção explícita', () => {
  const door = { id: 'd', kind: 'door', wallId: 'r', segment: 1, t: 0.5, width: 1 };
  const p = { ...project(), elements: [room, door] };
  assert.throws(() => setWallSection(p, 'r', { ...section, type: 'open' }), /porta/);
  const opening = setWallSection(removeElement(p, 'd'), 'r', { ...section, type: 'open' });
  assert.throws(
    () => parseProject(JSON.stringify({ ...opening, elements: [...opening.elements, door] })),
    /porta/,
  );
  assert.doesNotThrow(() =>
    setWallSection(p, 'r', { segment: 1, start: 0, end: 0.2, type: 'open' }),
  );
});
test('validação recusa trechos inválidos e respeita camada bloqueada', () => {
  for (const bad of [
    { ...section, start: 0.9 },
    { ...section, segment: 88 },
    { ...section, type: 'bad' },
  ])
    assert.throws(() => setWallSection(project(), 'r', bad));
  const locked = project();
  locked.layers[0].locked = true;
  assert.throws(() => setWallSection(locked, 'r', section), /desbloqueie/);
});
test('paredes curvas e poligonais mantêm vínculos; alterar topologia exige restaurar paredes', () => {
  for (const shape of [
    { id: 'r', kind: 'ellipse', x: 5, y: 5, w: 10, h: 10 },
    {
      id: 'r',
      kind: 'polygon',
      points: [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
        { x: 15, y: 15 },
        { x: 5, y: 15 },
      ],
    },
  ]) {
    const p = setWallSection({ ...project(), elements: [shape] }, 'r', section);
    assert.equal(wallSections(p.elements[0]).length, 1);
    if (shape.points) assert.throws(() => changeVertexCount(p, 'r', 0, 'insert'), /automáticas/);
  }
});
