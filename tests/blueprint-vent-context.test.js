import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareVentilationExport } from '../src/blueprints/export.js';
test('ventilation-only export selects complete geometry and preserves opaque background', () => {
  for (const only of [true, false]) {
    const nodes = ['full', 'contextual'].map((mode) => ({
      dataset: { ventPresentation: mode },
      removed: false,
      display: mode === 'full' ? 'none' : null,
      remove() {
        this.removed = true;
      },
      removeAttribute() {
        this.display = null;
      },
    }));
    let removedBackground = false;
    const copy = {
      querySelectorAll: () => nodes,
      querySelector: () => ({
        remove() {
          removedBackground = true;
        },
      }),
    };
    prepareVentilationExport(copy, only ? ['vents'] : ['structure', 'vents'], true);
    assert.equal(nodes[0].removed, !only);
    assert.equal(nodes[1].removed, only);
    assert.equal(removedBackground, !only);
    if (only) assert.equal(nodes[0].display, null);
  }
});
test('contextual network uses room geometry masks and retains complete export presentation', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { VentilationNetwork } = await server.ssrLoadModule('/src/blueprints/Ventilation.jsx');
    const elements = [
      { id: 'r', kind: 'ellipse', x: 3, y: 3, w: 8, h: 8 },
      {
        id: 'v',
        kind: 'vent',
        width: 1,
        points: [
          { x: 1, y: 6 },
          { x: 15, y: 6 },
        ],
      },
    ];
    const html = renderToStaticMarkup(
      createElement(VentilationNetwork, { elements, contextual: true, width: 20, height: 20 }),
    );
    assert.match(html, /<ellipse/);
    assert.match(html, /stroke-dasharray=".25 .2"/);
    assert.match(html, /data-vent-presentation="full" display="none"/);
    assert.match(html, /data-vent-presentation="contextual"/);
    assert.doesNotMatch(html, /NaN|undefined/);
    const full = renderToStaticMarkup(createElement(VentilationNetwork, { elements }));
    assert.doesNotMatch(full, /stroke-dasharray|data-vent-presentation/);
  } finally {
    await server.close();
  }
});
