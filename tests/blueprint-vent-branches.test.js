import test from 'node:test';
import assert from 'node:assert/strict';
import { ventBranch } from '../src/blueprints/vent-branches.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
const vent = {
  id: 'v',
  kind: 'vent',
  width: 1,
  points: [
    { x: 2, y: 4 },
    { x: 12, y: 4 },
  ],
};
const port = {
  id: 'p',
  segment: 0,
  t: 0.5,
  type: 'grille',
  side: 1,
  label: '',
  size: 0.8,
  connectWall: true,
};
const room = { id: 'r', kind: 'room', x: 2, y: 5, w: 10, h: 8 };
test('lateral branch reaches only the chosen side and a supported nearby wall', () => {
  const branch = ventBranch(vent, port, [room]);
  assert.equal(branch.distance, 0.5);
  assert.equal(branch.end.y, 5);
  assert.equal(ventBranch(vent, { ...port, side: -1 }, [room]), null);
  assert.equal(ventBranch(vent, port, [{ ...room, y: 10 }]), null);
  assert.equal(ventBranch(vent, port, [{ ...room, hidden: true }]), null);
  assert.equal(
    ventBranch(vent, port, [{ ...room, walls: [{ segment: 0, start: 0, end: 1, type: 'open' }] }]),
    null,
  );
  assert.equal(ventBranch(vent, { ...port, connectWall: false }, [room]), null);
});
test('port size and wall connection survive save; invalid values are rejected', () => {
  const p = { ...newProject(), elements: [{ ...vent, ports: [port] }, room] };
  assert.deepEqual(parseProject(JSON.stringify(p)).elements[0].ports[0], port);
  for (const patch of [{ size: 0 }, { size: 4 }, { connectWall: 'yes' }])
    assert.throws(() =>
      parseProject(
        JSON.stringify({ ...p, elements: [{ ...vent, ports: [{ ...port, ...patch }] }] }),
      ),
    );
});
test('ceiling uses duct width without scale reduction; references use thin continuous boundary paths', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { VentPorts } = await server.ssrLoadModule('/src/blueprints/VentPorts.jsx');
    const { Ventilation } = await server.ssrLoadModule('/src/blueprints/Ventilation.jsx');
    const html = renderToStaticMarkup(
      createElement(VentPorts, {
        element: { ...vent, width: 2, ports: [{ ...port, type: 'ceiling' }] },
        points: vent.points,
        subtle: true,
      }),
    );
    assert.match(html, /width="2" height="2"/);
    assert.doesNotMatch(html, /scale\(/);
    for (const width of [0.5, 2, 3])
      for (const subtle of [false, true]) {
        const ends = renderToStaticMarkup(
          createElement(Ventilation, {
            element: { ...vent, width, accesses: ['grille', 'cap'] },
            phase: 'access',
            subtle,
          }),
        );
        assert.doesNotMatch(ends, /scale\(/);
        assert.ok(ends.includes('width="' + width + '"'));
        assert.ok(ends.includes('d="M0 ' + -width / 2 + 'V' + width / 2 + '"'));
      }
    const edge = renderToStaticMarkup(
      createElement(Ventilation, {
        element: {
          ...vent,
          points: [
            { x: 2, y: 4 },
            { x: 12, y: 4 },
            { x: 12, y: 12 },
          ],
        },
        phase: 'reference',
      }),
    );
    assert.equal((edge.match(/<polyline/g) || []).length, 2);
    assert.match(edge, /stroke-width=".06"/);
    assert.doesNotMatch(edge, /NaN|undefined/);
  } finally {
    await server.close();
  }
});
