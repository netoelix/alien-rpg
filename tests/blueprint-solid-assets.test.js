import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
test('solid silhouettes retain fill, open details stay open, and rails share construction', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Furniture } = await server.ssrLoadModule('/src/blueprints/Furniture.jsx');
    const { Trace } = await server.ssrLoadModule('/src/blueprints/Trace.jsx');
    const render = (type) =>
      renderToStaticMarkup(
        createElement(
          'svg',
          { fill: '#123456', stroke: '#fff' },
          createElement(Furniture, { type, floor: '#123456' }),
        ),
      );
    for (const type of [
      'gardenTree',
      'gardenRocks',
      'retroLocomotive',
      'curvedLoungeSeat',
      'barCounterCorner',
    ]) {
      const svg = render(type);
      assert.match(svg, /fill="inherit"/);
      assert.doesNotMatch(svg, /NaN|undefined/);
    }
    assert.match(render('curvedLoungeSeat'), /d="M5[^\"]*Z"[^>]*fill="inherit"/);
    for (const type of [
      'sanitaryToilet',
      'showerTray',
      'toiletCubicle',
      'showerCubicle',
      'securityBooth',
      'marketStall',
    ])
      assert.doesNotMatch(render(type), /NaN|undefined/);
    const trace = renderToStaticMarkup(
      createElement(Trace, {
        floor: '#123456',
        element: {
          kind: 'trace',
          traceType: 'rail',
          width: 0.9,
          rounded: true,
          points: [
            { x: 1, y: 1 },
            { x: 7, y: 1 },
            { x: 7, y: 6 },
          ],
        },
      }),
    );
    for (const svg of [trace, render('railSegment')]) {
      assert.match(svg, /data-rail-sleeper="true"/);
      assert.match(svg, /data-rail-beam="true"/);
      assert.match(svg, /fill="#123456"/);
      assert.doesNotMatch(svg, /NaN|undefined/);
    }
  } finally {
    await server.close();
  }
});
