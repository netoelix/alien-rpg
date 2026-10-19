import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  wallSegments,
  nearestWall,
  doorPosition,
  moveElement,
  moveVertex,
  changeVertexCount,
  removeElement,
  makeModule,
  snap,
  duplicateElement,
  moduleNames,
  assetTypes,
} from '../src/blueprints/model.js';
const room = { id: 'room', kind: 'room', x: 10, y: 10, w: 10, h: 8 };
const door = { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1.5 };
test('inserir e remover vértice preserva portas e o projeto original', () => {
  const polygon = {
    id: 'room',
    kind: 'polygon',
    points: [
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 10 },
      { x: 2, y: 10 },
    ],
  };
  const firstDoor = { ...door, t: 0.75 };
  const otherDoor = { ...door, id: 'other', segment: 3 };
  const original = { ...newProject(), elements: [polygon, firstDoor, otherDoor] };
  const inserted = changeVertexCount(original, polygon.id, 0, 'insert');
  assert.equal(inserted.elements[0].points.length, 5);
  assert.equal(inserted.elements[1].segment, 1);
  assert.equal(inserted.elements[1].t, 0.5);
  assert.equal(inserted.elements[2].segment, 4);
  for (let i = 1; i <= 2; i++)
    assert.deepEqual(
      doorPosition(inserted.elements[i], inserted.elements),
      doorPosition(original.elements[i], original.elements),
    );
  assert.deepEqual(changeVertexCount(inserted, polygon.id, 1, 'remove'), original);
  assert.equal(original.elements[0].points.length, 4);
  const triangle = changeVertexCount(original, polygon.id, 1, 'remove');
  assert.equal(triangle.elements.length, 3);
  assert.ok(doorPosition(triangle.elements[1], triangle.elements));
  assert.throws(() => changeVertexCount(triangle, polygon.id, 0, 'remove'), /3 vértices/);
  assert.throws(
    () =>
      changeVertexCount(
        {
          ...original,
          layers: original.layers.map((layer) => ({ ...layer, locked: layer.id === 'doors' })),
        },
        polygon.id,
        0,
        'insert',
      ),
    /desbloqueie/,
  );
});
test('alteração de pontos em corredor remapeia lados e impede caminhos degenerados', () => {
  const corridor = {
    id: 'room',
    kind: 'corridor',
    width: 2,
    points: [
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 10 },
    ],
  };
  const original = {
    ...newProject(),
    elements: [corridor, { ...door, segment: 1, t: 0.75 }, { ...door, id: 'after', segment: 2 }],
  };
  const inserted = changeVertexCount(original, corridor.id, 0, 'insert');
  assert.equal(inserted.elements[1].segment, 3);
  assert.equal(inserted.elements[2].segment, 4);
  assert.deepEqual(
    doorPosition(inserted.elements[1], inserted.elements),
    doorPosition(original.elements[1], original.elements),
  );
  assert.deepEqual(changeVertexCount(inserted, corridor.id, 1, 'remove'), original);
  assert.throws(() => changeVertexCount(original, corridor.id, 2, 'insert'), /último ponto/);
  const tiny = {
    ...corridor,
    points: [
      { x: 1, y: 1 },
      { x: 1.25, y: 1 },
    ],
  };
  assert.throws(
    () => changeVertexCount({ ...newProject(), elements: [tiny] }, tiny.id, 0, 'insert'),
    /0,25/,
  );
});
test('editar vértice preserva vínculo da porta e recusa colapso do traçado', () => {
  const polygon = {
    id: 'room',
    kind: 'polygon',
    points: [
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 10 },
      { x: 2, y: 10 },
    ],
  };
  const changed = moveVertex(polygon, 1, { x: 12, y: 2 });
  assert.deepEqual(doorPosition(door, [changed]), { x: 7, y: 2, rotation: 0 });
  assert.deepEqual(polygon.points[1], { x: 10, y: 2 });
  assert.doesNotThrow(() =>
    parseProject(JSON.stringify({ ...newProject(), elements: [changed, door] })),
  );
  assert.throws(() => moveVertex(polygon, 9, { x: 0, y: 0 }), /Vértice/);
  const collapsed = moveVertex(polygon, 1, polygon.points[0]);
  assert.throws(() => parseProject(JSON.stringify({ ...newProject(), elements: [collapsed] })));
  for (const kind of ['vent', 'corridor']) {
    const path = {
      id: 'path',
      kind,
      points: [
        { x: 2, y: 2 },
        { x: 6, y: 2 },
      ],
      width: 2,
    };
    assert.throws(() =>
      parseProject(
        JSON.stringify({ ...newProject(), elements: [moveVertex(path, 1, path.points[0])] }),
      ),
    );
  }
});
test('sala em L mantém contorno fechado, portas e formato ao salvar e duplicar', () => {
  const polygon = {
    id: 'room',
    kind: 'polygon',
    points: [
      { x: 2, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 10 },
      { x: 2, y: 10 },
    ],
  };
  const project = { ...newProject(), elements: [polygon, door] };
  assert.deepEqual(parseProject(JSON.stringify(project)), project);
  assert.equal(wallSegments(polygon).length, 6);
  assert.deepEqual(wallSegments(polygon).at(-1), [
    [2, 10],
    [2, 2],
  ]);
  assert.deepEqual(doorPosition(door, [polygon]), { x: 6, y: 2, rotation: 0 });
  const result = duplicateElement(project, polygon.id);
  assert.equal(result.project.elements.length, 4);
  assert.deepEqual(result.project.elements[2].points[0], { x: 3, y: 3 });
  for (const points of [
    [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ],
    [
      { x: 1, y: 1 },
      { x: 8, y: 8 },
      { x: 1, y: 8 },
      { x: 8, y: 1 },
    ],
    [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 8 },
    ],
  ])
    assert.throws(() =>
      parseProject(JSON.stringify({ ...project, elements: [{ ...polygon, points }] })),
    );
});
test('duplicação remapeia portas sem modificar o original e respeita camadas bloqueadas', () => {
  const original = { ...newProject(), elements: [room, door] };
  const result = duplicateElement(original, room.id);
  const copy = result.project.elements.find((element) => element.id === result.selectedId);
  const copiedDoor = result.project.elements.find((element) => element.wallId === copy.id);
  assert.equal(copy.x, room.x + original.grid);
  assert.notEqual(copiedDoor.id, door.id);
  assert.deepEqual(doorPosition(copiedDoor, result.project.elements), {
    x: 16,
    y: 11,
    rotation: 0,
  });
  assert.deepEqual(original.elements, [room, door]);
  assert.equal(removeElement(result.project, room.id).elements.length, 2);
  const locked = {
    ...original,
    layers: original.layers.map((layer) => ({ ...layer, locked: layer.id === 'doors' })),
  };
  assert.throws(() => duplicateElement(locked, room.id), /desbloqueie/);
  assert.throws(() => duplicateElement(original, door.id), /ferramenta Porta/);
});
test('duplicação junto à borda usa deslocamento válido e mantém traçados independentes', () => {
  const original = { ...newProject(), elements: [{ ...room, x: 70, y: 52 }] };
  const result = duplicateElement(original, room.id);
  assert.equal(result.project.elements[1].x, 69);
  const vent = {
    id: 'vent',
    kind: 'vent',
    width: 1,
    points: [
      { x: 1, y: 1 },
      { x: 5, y: 5 },
    ],
  };
  const copied = duplicateElement({ ...newProject(), elements: [vent] }, vent.id).project
    .elements[1];
  assert.deepEqual(copied.points, [
    { x: 2, y: 2 },
    { x: 6, y: 6 },
  ]);
  assert.deepEqual(vent.points[0], { x: 1, y: 1 });
});
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
  for (const kind of Object.keys(moduleNames)) {
    const parts = [...makeModule(kind, 1, 1), ...makeModule(kind, 20, 20)];
    assert.equal(new Set(parts.map((p) => p.id)).size, parts.length);
    assert.doesNotThrow(() => parseProject(JSON.stringify({ ...newProject(), elements: parts })));
    assert.ok(parts.some((p) => p.kind === 'asset'));
    for (const part of parts.filter((p) => p.kind === 'asset')) {
      assert.ok(assetTypes.includes(part.asset));
      const parent = parts
        .filter((p) => p.kind === 'room')
        .find(
          (p) =>
            part.x >= p.x &&
            part.x + part.w <= p.x + p.w &&
            part.y >= p.y &&
            part.y + part.h <= p.y + p.h,
        );
      assert.ok(parent, 'equipamento precisa caber dentro do módulo');
    }
  }
  assert.throws(() => makeModule('unknown', 0, 0), /desconhecido/);
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
