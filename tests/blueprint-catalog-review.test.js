import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { revisedAssets, expandedAssets } from '../src/blueprints/revised-assets.js';
import { legacyAssets } from '../src/blueprints/legacy-assets.js';
import { furniture } from '../src/blueprints/furniture.js';
import { assetCategories } from '../src/blueprints/asset-categories.js';
import { catalogGroups } from '../src/blueprints/catalog-groups.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
test('reviewed catalog preserves old-map dimensions and every new piece saves and reuses', () => {
  for (const [asset, v] of Object.entries({ ...revisedAssets, ...expandedAssets })) {
    const e = { id: asset, kind: 'asset', asset, x: 3, y: 3, w: v.w, h: v.h, rotation: 0 };
    const p = parseProject(JSON.stringify({ ...newProject(), elements: [e] }));
    assert.deepEqual(p.elements[0], e);
    const m = createModule(p, [asset], v.name);
    assert.equal(placeModule(newProject(), m, 20, 20).project.elements[0].asset, asset);
  }
  for (const [asset, replacement] of Object.entries(legacyAssets)) {
    assert.ok(furniture[replacement]);
    assert.ok(!assetCategories.some((c) => c.items.includes(asset)));
    const e = { id: asset, kind: 'asset', asset, x: 5, y: 8, w: 7.3, h: 2.2, rotation: 45 };
    assert.deepEqual(
      parseProject(JSON.stringify({ ...newProject(), elements: [e] })).elements[0],
      e,
    );
  }
  const grouped = catalogGroups.flatMap((g) => g.categories);
  assert.equal(grouped.length, new Set(grouped).size);
  assert.ok(assetCategories.every((c) => grouped.includes(c.id)));
});
test('drawn floor stripes save and copy without becoming solid surfaces', async () => {
  const e = {
    id: 'line',
    kind: 'trace',
    traceType: 'hazardLine',
    width: 0.3,
    rounded: true,
    side: 1,
    points: [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
    ],
  };
  for (const traceType of ['hazardLine', 'walkwayLine']) {
    const p = parseProject(JSON.stringify({ ...newProject(), elements: [{ ...e, traceType }] }));
    assert.equal(p.elements[0].traceType, traceType);
    for (const signageColor of ['green', 'amber']) {
      const colored = parseProject(
        JSON.stringify({ ...newProject(), elements: [{ ...e, traceType, signageColor }] }),
      );
      assert.equal(colored.elements[0].signageColor, signageColor);
      const savedModule = createModule(colored, ['line'], 'Cor');
      assert.equal(
        placeModule(newProject(), savedModule, 20, 20).project.elements[0].signageColor,
        signageColor,
      );
    }
    const m = createModule(p, ['line'], 'Pintura');
    assert.equal(placeModule(newProject(), m, 20, 20).project.elements[0].traceType, traceType);
  }
  const { createServer } = await import('vite');
  const { createElement: h } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { PlacementPreview } = await server.ssrLoadModule('/src/blueprints/PlacementPreview.jsx');
    const rotated = renderToStaticMarkup(
      h(
        'svg',
        {},
        h(PlacementPreview, {
          project: newProject(),
          point: { x: 5, y: 5 },
          tool: 'asset',
          asset: 'commandBench',
          rotation: 90,
        }),
      ),
    );
    assert.match(rotated, /rotate\(90 /);
    await server.ssrLoadModule('/src/blueprints/BlueprintEditor.jsx');
    const { AssetSymbol } = await server.ssrLoadModule('/src/blueprints/Assets.jsx');
    const { Trace } = await server.ssrLoadModule('/src/blueprints/Trace.jsx');
    for (const type of [
      ...Object.keys(revisedAssets),
      ...Object.keys(expandedAssets),
      ...Object.keys(legacyAssets),
    ]) {
      const svg = renderToStaticMarkup(h('svg', { fill: '#102c24' }, h(AssetSymbol, { type })));
      assert.doesNotMatch(svg, /NaN|undefined/);
      assert.ok(svg.length > 200, type);
    }
    for (const traceType of ['hazardLine', 'walkwayLine']) {
      const svg = renderToStaticMarkup(h('svg', {}, h(Trace, { element: { ...e, traceType } })));
      assert.match(svg, /data-signage-trace/);
      assert.doesNotMatch(svg, /NaN|undefined/);
    }
  } finally {
    await server.close();
  }
});
