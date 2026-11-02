import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { assetCategories } from '../src/blueprints/asset-categories.js';
import { catalogGroups } from '../src/blueprints/catalog-groups.js';
import { legacyAssets } from '../src/blueprints/legacy-assets.js';
import { furniture } from '../src/blueprints/furniture.js';
test('every selectable item has a reachable category and visible SVG, including legacy aliases', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { AssetSymbol } = await server.ssrLoadModule('/src/blueprints/Assets.jsx');
    const categories = catalogGroups.flatMap((g) => g.categories);
    for (const category of assetCategories) {
      assert.equal(categories.filter((id) => id === category.id).length, 1, category.id);
      for (const id of category.items) {
        const { w, h: height } = furniture[id];
        assert.ok(w > 0 && height > 0, id);
        const svg = render(h('svg', null, h(AssetSymbol, { type: id })));
        assert.doesNotMatch(svg, /NaN|undefined/, id);
        const shapes =
          svg.match(/<(?:path|rect|circle|ellipse|line|polygon|polyline)\b[^>]*>/g) || [];
        assert.ok(
          shapes.some((s) => !s.includes('fill="transparent"')),
          id,
        );
      }
    }
    for (const [old, current] of Object.entries(legacyAssets)) {
      assert.equal(
        render(h(AssetSymbol, { type: old })),
        render(h(AssetSymbol, { type: current })),
        old,
      );
    }
  } finally {
    await server.close();
  }
});
