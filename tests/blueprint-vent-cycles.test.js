import test from 'node:test';
import assert from 'node:assert/strict';
import {
  closeVentPoints,
  isClosedVent,
  ventAccess,
  ventNetworks,
} from '../src/blueprints/ventilation.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
const points = [
  { x: 3, y: 3 },
  { x: 10, y: 3 },
  { x: 10, y: 10 },
  { x: 3, y: 10 },
];
test('closed ducts survive saving without endpoint access symbols', () => {
  const e = { id: 'loop', kind: 'vent', width: 1, points: closeVentPoints(points) };
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [e] }));
  assert.ok(isClosedVent(p.elements[0]));
  assert.equal(points.length, 4);
  assert.equal(closeVentPoints(e.points).length, 5);
  for (const i of [0, 1]) assert.equal(ventAccess(e, i, [e]).type, 'junction');
});
test('separate ducts join at endpoints but not at simple crossings; explicit caps remain', () => {
  const a = {
    id: 'a',
    kind: 'vent',
    width: 1,
    points: [
      { x: 3, y: 3 },
      { x: 10, y: 3 },
    ],
  };
  const b = {
    id: 'b',
    kind: 'vent',
    width: 1,
    points: [
      { x: 10, y: 3 },
      { x: 10, y: 9 },
    ],
  };
  assert.equal(ventNetworks([a, b]).length, 1);
  assert.equal(ventAccess(a, 1, [a, b]).type, 'junction');
  assert.equal(ventNetworks([{ ...a, accesses: ['auto', 'cap'] }, b]).length, 2);
  const c = {
    ...b,
    points: [
      { x: 6, y: 1 },
      { x: 6, y: 9 },
    ],
  };
  assert.equal(ventNetworks([a, c]).length, 2);
});
test('closed duct rendering uses a joined stroke and compiles editor', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Ventilation } = await server.ssrLoadModule('/src/blueprints/Ventilation.jsx');
    const e = { id: 'loop', kind: 'vent', width: 1, points: closeVentPoints(points) };
    const html = renderToStaticMarkup(createElement(Ventilation, { element: e, elements: [e] }));
    assert.match(html, /<polygon/);
    assert.doesNotMatch(html, /NaN|undefined/);
    await server.ssrLoadModule('/src/blueprints/BlueprintEditor.jsx');
  } finally {
    await server.close();
  }
});

test('moving or removing the seam preserves a closed editable loop', async () => {
  const { moveVertex, changeVertexCount } = await import('../src/blueprints/model.js');
  const e = { id: 'loop', kind: 'vent', width: 1, points: closeVentPoints(points) };
  for (const index of [0, e.points.length - 1]) {
    const moved = moveVertex(e, index, { x: 2, y: 2 });
    assert.ok(isClosedVent(moved));
    assert.deepEqual(moved.points[0], { x: 2, y: 2 });
    const changed = changeVertexCount({ ...newProject(), elements: [e] }, e.id, index, 'remove');
    assert.ok(isClosedVent(changed.elements[0]));
    assert.equal(changed.elements[0].points.length, 4);
    assert.throws(() => changeVertexCount(changed, e.id, 0, 'remove'));
  }
});
