import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  wallSegments,
  moveElement,
  changeVertexCount,
} from '../src/blueprints/model.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
import { waterRegionPath } from '../src/blueprints/water.js';
import { traceGeometry } from '../src/blueprints/trace-geometry.js';
const points = [
  { x: 3, y: 3 },
  { x: 10, y: 3 },
  { x: 12, y: 8 },
  { x: 5, y: 10 },
];
const water = (type) => ({
  id: type,
  kind: 'floorRegion',
  points,
  floorFinish: { type, size: 1, opacity: 0.3 },
});
const river = {
  id: 'river',
  kind: 'trace',
  traceType: 'river',
  points: [
    { x: 15, y: 2 },
    { x: 18, y: 8 },
    { x: 25, y: 9 },
  ],
  width: 3,
  rounded: true,
  side: 1,
};
test('water regions and rivers save, remain wall-free and survive module reuse', () => {
  const p = parseProject(
    JSON.stringify({ ...newProject(), elements: [water('pool'), water('lake'), river] }),
  );
  for (const e of p.elements) {
    assert.deepEqual(wallSegments(e), []);
    assert.equal(moveElement(e, 2, 0).points[0].x, e.points[0].x + 2);
  }
  const m = createModule(
    p,
    p.elements.map((e) => e.id),
    'Água',
  );
  const copy = placeModule(newProject(), m, 30, 30).project;
  assert.equal(copy.elements.length, 3);
  assert.deepEqual(
    copy.elements.map((e) => e.floorFinish?.type || e.traceType),
    ['pool', 'lake', 'river'],
  );
  assert.ok(changeVertexCount(p, 'lake', 1, 'insert'));
  assert.throws(() =>
    parseProject(
      JSON.stringify({
        ...newProject(),
        elements: [
          { id: 'r', kind: 'room', x: 1, y: 1, w: 3, h: 3, floorFinish: water('pool').floorFinish },
        ],
      }),
    ),
  );
});
test('lake curves close without extending control bounds; river rounds bends', () => {
  const path = waterRegionPath(points, true);
  assert.ok(path.endsWith('Z'));
  assert.equal((path.match(/Q/g) || []).length, 4);
  assert.doesNotMatch(path, /NaN|undefined/);
  assert.equal(waterRegionPath([], true), '');
  assert.ok(traceGeometry(river).center.length > river.points.length);
});
test('water rendering includes opaque surfaces, marginal contours and no invalid SVG', async () => {
  const { createServer } = await import('vite');
  const { createElement: h } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Drawing } = await server.ssrLoadModule('/src/blueprints/Drawing.jsx');
    const svg = renderToStaticMarkup(
      h(Drawing, { project: { ...newProject(), elements: [water('pool'), water('lake'), river] } }),
    );
    assert.match(svg, /data-water-region="pool"/);
    assert.match(svg, /data-water-region="lake"/);
    assert.match(svg, /data-water-river="true"/);
    assert.match(svg, /data-water-margins="true"/);
    assert.doesNotMatch(svg, /<pattern[^>]+id="(?:water|river)-/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  } finally {
    await server.close();
  }
});
