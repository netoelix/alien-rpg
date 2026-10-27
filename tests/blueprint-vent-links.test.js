import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { addFloor, activeFloor, switchFloor, removeFloor } from '../src/blueprints/floors.js';
import { pruneConnections, floorElements } from '../src/blueprints/connections.js';
import { addVentLink, portDestinations } from '../src/blueprints/vent-links.js';
const save = (p) => parseProject(JSON.stringify(p));
const duct = (id, type) => ({
  id,
  kind: 'vent',
  width: 1,
  points: [
    { x: 3, y: 3 },
    { x: 12, y: 3 },
  ],
  ports: [{ id: 'port', type, side: 1, segment: 0, t: 0.5, label: id }],
});
function fixture() {
  let p = { ...newProject(), elements: [duct('lower', 'ceiling')] };
  const lower = activeFloor(p);
  p = addFloor(p);
  p = { ...p, elements: [duct('upper', 'floor')] };
  return addVentLink(
    p,
    { floorId: activeFloor(p), elementId: 'upper', portId: 'port' },
    { floorId: lower, elementId: 'lower', portId: 'port' },
  );
}
test('ventilation connections survive floor switching and saving; destinations work both ways', () => {
  const p = save(fixture()),
    link = p.ventLinks[0];
  assert.equal(portDestinations(p, 'upper', 'port')[0].endpoint.floorId, link.to.floorId);
  const other = save(switchFloor(p, link.to.floorId));
  assert.equal(portDestinations(other, 'lower', 'port')[0].endpoint.floorId, link.from.floorId);
  assert.deepEqual(other.ventLinks, p.ventLinks);
});
test('removing ports, changing hatch type or removing floors prunes links without removing the peer', () => {
  const p = fixture();
  for (const elements of [
    [],
    [{ ...p.elements[0], ports: [] }],
    [{ ...p.elements[0], ports: [{ ...p.elements[0].ports[0], type: 'grille' }] }],
  ]) {
    const next = save(pruneConnections({ ...p, elements }));
    assert.equal(next.ventLinks.length, 0);
    assert.equal(floorElements(next, p.ventLinks[0].to.floorId).length, 1);
  }
  assert.equal(save(pruneConnections(removeFloor(p))).ventLinks.length, 0);
  const duplicate = save(addFloor(p, true));
  assert.equal(duplicate.ventLinks.length, 1);
  assert.equal(portDestinations(duplicate, duplicate.elements[0].id, 'port').length, 0);
});
test('ventilation rejects duplicate endpoints, broken references and same-floor connections', () => {
  const p = fixture(),
    l = p.ventLinks[0];
  assert.throws(() => addVentLink(p, l.from, l.to));
  assert.throws(() => save({ ...p, ventLinks: [{ ...l, to: { ...l.to, portId: 'missing' } }] }));
  assert.throws(() => save({ ...p, ventLinks: [{ ...l, to: l.from }] }));
  assert.throws(() => save({ ...p, ventLinks: [l, { ...l, id: 'another' }] }));
});
test('linked ventilation UI and destination labels render without invalid data', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { VentDeckLinkControls } = await server.ssrLoadModule(
      '/src/blueprints/VentDeckLinkControls.jsx',
    );
    const { VentDestinationLabels } = await server.ssrLoadModule(
      '/src/blueprints/VentDestinationLabels.jsx',
    );
    const project = fixture();
    const controls = renderToStaticMarkup(
      createElement(VentDeckLinkControls, {
        project,
        element: project.elements[0],
        port: project.elements[0].ports[0],
      }),
    );
    assert.match(controls, /Ir ao destino/);
    assert.match(controls, /Desvincular/);
    const labels = renderToStaticMarkup(
      createElement(VentDestinationLabels, { project, elements: project.elements, ink: '#fff' }),
    );
    assert.match(labels, /lower/);
    assert.doesNotMatch(labels, /NaN|undefined/);
  } finally {
    await server.close();
  }
});
