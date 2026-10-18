import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  wallSegments,
  nearestWall,
  doorPosition,
  moveElement,
  removeElement,
  makeModule,
  snap,
} from '../src/blueprints/model.js';
const room = { id: 'room', kind: 'room', x: 10, y: 10, w: 10, h: 8 };
const door = { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1.5 };
test('projeto local preserva medidas, camadas e objetos no ciclo salvar/abrir', () => {
  const p = {
    ...newProject(),
    name: 'Estação Ω',
    grid: 0.5,
    elements: [room, door, ...makeModule('medical', 30, 20)],
  };
  assert.deepEqual(parseProject(JSON.stringify(p)), p);
  const changed = parseProject(JSON.stringify({ ...p, grid: 10 }));
  assert.deepEqual(changed.elements, p.elements);
  assert.equal(snap(1.3, 0.5), 1.5);
});
test('porta se ancora à parede, acompanha movimento e remoção não destrói a sala', () => {
  const anchor = nearestWall([room], { x: 15, y: 10.2 });
  assert.equal(anchor.wallId, 'room');
  assert.equal(anchor.segment, 0);
  assert.equal(anchor.t, 0.5);
  assert.deepEqual(doorPosition(door, [room]), { x: 15, y: 10, rotation: 0 });
  assert.deepEqual(doorPosition(door, [moveElement(room, 5, 3)]), { x: 20, y: 13, rotation: 0 });
  const p = { ...newProject(), elements: [room, door] };
  assert.deepEqual(removeElement(p, 'door').elements, [room]);
  assert.deepEqual(removeElement(p, 'room').elements, []);
  assert.equal(nearestWall([room], { x: 40, y: 40 }), null);
});
test('corredores e salas curvas fornecem paredes para portas sem mudar o percurso', () => {
  const corridor = {
    id: 'path',
    kind: 'corridor',
    points: [
      { x: 2, y: 2 },
      { x: 12, y: 2 },
      { x: 12, y: 8 },
    ],
    width: 2,
  };
  assert.equal(wallSegments(corridor).length, 4);
  assert.equal(nearestWall([corridor], { x: 6, y: 3 }, 0.1).wallId, 'path');
  assert.equal(wallSegments({ ...room, kind: 'ellipse' }).length, 64);
  const moved = moveElement(corridor, 2, 3);
  assert.deepEqual(moved.points[0], { x: 4, y: 5 });
  assert.deepEqual(corridor.points[0], { x: 2, y: 2 });
});
test('módulos são peças independentes, com IDs próprios e porta válida', () => {
  for (const kind of ['bridge', 'medical', 'quarters']) {
    const parts = [...makeModule(kind, 1, 1), ...makeModule(kind, 20, 20)];
    assert.equal(new Set(parts.map((p) => p.id)).size, parts.length);
    assert.doesNotThrow(() => parseProject(JSON.stringify({ ...newProject(), elements: parts })));
    assert.ok(parts.some((p) => p.kind === 'asset'));
  }
});
test('importação rejeita arquivos inválidos e descarta campos externos', () => {
  const p = newProject();
  for (const bad of [
    { ...p, version: 2 },
    { ...p, width: 0 },
    { ...p, elements: [room, room] },
    { ...p, elements: [door] },
    { ...p, elements: [{ ...room, x: 79 }] },
    { ...p, elements: [{ id: 'a', kind: 'vent', width: 2, points: [] }] },
    { ...p, elements: [{ ...room, kind: 'asset', asset: 'external-url', rotation: 0 }] },
  ])
    assert.throws(() => parseProject(JSON.stringify(bad)));
  const clean = parseProject(
    JSON.stringify({
      ...p,
      script: 'alert(1)',
      elements: [{ ...room, onclick: 'bad', url: 'https://example.com' }],
    }),
  );
  assert.equal(clean.script, undefined);
  assert.equal(clean.elements[0].onclick, undefined);
  assert.equal(clean.elements[0].url, undefined);
});
