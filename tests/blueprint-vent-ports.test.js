import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  changeVertexCount,
  moveElement,
  moveVertex,
} from '../src/blueprints/model.js';
import {
  ventPortPosition,
  normalizeVentPorts,
  nearestVentPort,
} from '../src/blueprints/vent-ports.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
const vent = {
  id: 'v',
  kind: 'vent',
  width: 1,
  points: [
    { x: 10, y: 10 },
    { x: 20, y: 10 },
    { x: 20, y: 20 },
  ],
  ports: [
    { id: 'p', type: 'grille', segment: 0, t: 0.75, side: 1, label: 'Enfermaria' },
    { id: 'q', type: 'floor', segment: 1, t: 0.5, side: 1, label: '' },
  ],
};
const project = () => parseProject(JSON.stringify({ ...newProject(), elements: [vent] }));
test('vent ports roundtrip, follow geometry and preserve position when splitting a segment', () => {
  const p = project();
  assert.deepEqual(p.elements[0].ports, vent.ports);
  const moved = moveElement(vent, 3, 4);
  assert.equal(ventPortPosition(moved.points, moved.ports[0], 1).x, 20.5);
  const reshaped = moveVertex(vent, 1, { x: 22, y: 10 });
  assert.equal(ventPortPosition(reshaped.points, reshaped.ports[0], 1).x, 19);
  const changed = changeVertexCount(p, 'v', 0, 'insert').elements[0];
  assert.equal(changed.ports[0].segment, 1);
  assert.equal(changed.ports[0].t, 0.5);
  assert.deepEqual(
    ventPortPosition(changed.points, changed.ports[0], 1),
    ventPortPosition(vent.points, vent.ports[0], 1),
  );
  const removed = changeVertexCount({ ...p, elements: [changed] }, 'v', 1, 'remove').elements[0];
  assert.deepEqual(removed.ports, vent.ports);
  const copy = placeModule(newProject(), createModule(p, ['v'], 'Duto'), 30, 30);
  assert.deepEqual(copy.project.elements[0].ports, vent.ports);
});
test('ports validate boundaries and types; opposite sides lie on opposite duct edges', () => {
  for (const patch of [
    { segment: 4 },
    { t: NaN },
    { t: 2 },
    { type: 'bad' },
    { side: 0 },
    { label: 'x'.repeat(81) },
  ])
    assert.throws(() => normalizeVentPorts([{ ...vent.ports[0], ...patch }], vent.points));
  assert.throws(() => normalizeVentPorts([vent.ports[0], vent.ports[0]], vent.points));
  assert.equal(ventPortPosition(vent.points, vent.ports[0], 1).y, 10.5);
  assert.equal(ventPortPosition(vent.points, { ...vent.ports[0], side: -1 }, 1).y, 9.5);
  assert.equal(nearestVentPort(vent.points, { x: 20, y: 16 }).segment, 1);
});
test('intermediate ports render in contextual and full ventilation and labels are escaped', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Ventilation } = await server.ssrLoadModule('/src/blueprints/Ventilation.jsx');
    for (const subtle of [false, true]) {
      const html = renderToStaticMarkup(
        createElement(Ventilation, {
          element: { ...vent, ports: [{ ...vent.ports[0], label: '<script>destino</script>' }] },
          subtle,
        }),
      );
      assert.match(html, /data-vent-port="p"/);
      assert.doesNotMatch(html, /<script>|NaN|undefined/);
      assert.ok(html.indexOf('data-vent-port') > html.indexOf('<polyline'));
    }
  } finally {
    await server.close();
  }
});
