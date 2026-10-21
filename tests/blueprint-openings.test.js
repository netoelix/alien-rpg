import test from 'node:test';
import assert from 'node:assert/strict';
import { openingGeometry } from '../src/blueprints/wall-geometry.js';
import {
  newProject,
  parseProject,
  duplicateElement,
  removeElement,
  setWallSection,
} from '../src/blueprints/model.js';

const room = { id: 'r', kind: 'room', x: 5, y: 5, w: 10, h: 10 };
const opening = { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 2 };
const full = (segment, type) => ({ segment, type, start: 0, end: 1 });

test('aberturas acompanham espessura e lado externo nas quatro bordas', () => {
  for (const [type, depth] of [
    ['internal', 0.2],
    ['structural', 0.45],
    ['hull', 0.7],
    ['glass', 0.2],
  ]) {
    const parent = { ...room, walls: [0, 1, 2, 3].map((segment) => full(segment, type)) };
    const expected = [
      [10, 5 - depth / 2],
      [15 + depth / 2, 10],
      [10, 15 + depth / 2],
      [5 - depth / 2, 10],
    ];
    expected.forEach(([x, y], segment) => {
      const result = openingGeometry({ ...opening, segment }, [parent]);
      assert.ok(Math.abs(result.x - x) < 1e-9);
      assert.ok(Math.abs(result.y - y) < 1e-9);
      assert.ok(result.frameDepth > depth / 2);
    });
  }
  assert.equal(openingGeometry(opening, [room]).y, 4.9);
});

test('lado externo respeita orientação do polígono e os dois lados do corredor', () => {
  const points = [
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 15, y: 15 },
    { x: 5, y: 15 },
  ];
  const forward = { id: 'r', kind: 'polygon', points };
  const reverse = { ...forward, points: [...points].reverse() };
  assert.equal(openingGeometry(opening, [forward]).y, 4.9);
  assert.equal(openingGeometry({ ...opening, segment: 2 }, [reverse]).y, 4.9);
  const corridor = {
    id: 'r',
    kind: 'corridor',
    width: 2,
    points: [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
    ],
  };
  assert.equal(openingGeometry(opening, [corridor]).y, 6.1);
  assert.equal(openingGeometry({ ...opening, segment: 1 }, [corridor]).y, 3.9);
});

test('janela conserva vínculo no arquivo, duplicação e exclusão do ambiente', () => {
  const window = { ...opening, openingType: 'window' };
  const project = parseProject(JSON.stringify({ ...newProject(), elements: [room, window] }));
  assert.equal(project.elements[1].openingType, 'window');
  const copied = duplicateElement(project, 'r').project;
  assert.equal(copied.elements.filter((element) => element.openingType === 'window').length, 2);
  assert.equal(removeElement(project, 'r').elements.length, 0);
  assert.throws(() => setWallSection(project, 'r', full(0, 'open')));
  assert.throws(() =>
    parseProject(
      JSON.stringify({ ...project, elements: [room, { ...window, openingType: 'invalid' }] }),
    ),
  );
  assert.deepEqual(openingGeometry(window, [room]), openingGeometry(opening, [room]));
});

test('trechos parciais só afetam aberturas que os intersectam', () => {
  const parent = { ...room, walls: [{ ...full(0, 'hull'), start: 0.7 }] };
  assert.equal(openingGeometry(opening, [parent]).depth, 0.2);
  assert.equal(openingGeometry({ ...opening, t: 0.8 }, [parent]).depth, 0.7);
});
