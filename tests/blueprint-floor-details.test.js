import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject, changeVertexCount } from '../src/blueprints/model.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
import { traceGeometry } from '../src/blueprints/trace-geometry.js';
import { assetOrder } from '../src/blueprints/asset-order.js';
test('floor channels roundtrip, edit and copy with centered bounded crossbars', () => {
  for (const traceType of ['channel', 'gratedChannel']) {
    const element = {
      id: 'channel',
      kind: 'trace',
      traceType,
      width: 0.4,
      rounded: true,
      side: 1,
      points: [
        { x: 10, y: 10 },
        { x: 15, y: 10 },
        { x: 15, y: 15 },
      ],
    };
    const p = parseProject(JSON.stringify({ ...newProject(), elements: [element] }));
    assert.equal(p.elements[0].traceType, traceType);
    assert.equal(changeVertexCount(p, 'channel', 0, 'insert').elements[0].points.length, 4);
    assert.equal(
      placeModule(newProject(), createModule(p, ['channel'], 'Canaleta'), 30, 30).project
        .elements[0].traceType,
      traceType,
    );
    const g = traceGeometry(element);
    assert.ok(g.marks[0].a.y < 10 && g.marks[0].b.y > 10);
    assert.ok(g.marks.length <= 600);
    assert.ok(
      traceGeometry({
        ...element,
        points: [
          { x: 0, y: 0 },
          { x: 2000, y: 0 },
        ],
      }).marks.length <= 600,
    );
  }
  assert.ok(assetOrder({ asset: 'inspectionHatch' }) < assetOrder({ asset: 'crewBed' }));
});
test('floor channels render in both styles without invalid geometry', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Trace } = await server.ssrLoadModule('/src/blueprints/Trace.jsx');
    for (const traceType of ['channel', 'gratedChannel']) {
      const html = renderToStaticMarkup(
        createElement(Trace, {
          floor: '#abcdef',
          element: {
            traceType,
            width: 0.4,
            points: [
              { x: 1, y: 1 },
              { x: 4, y: 1 },
            ],
          },
        }),
      );
      assert.match(html, /data-floor-channel/);
      assert.match(html, /#abcdef/);
      assert.doesNotMatch(html, /NaN|undefined/);
    }
  } finally {
    await server.close();
  }
});
