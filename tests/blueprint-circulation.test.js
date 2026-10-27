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
import { normalizeCirculation, overlappingTraces } from '../src/blueprints/circulation.js';
const road = {
  id: 'road',
  kind: 'trace',
  traceType: 'road',
  points: [
    { x: 3, y: 10 },
    { x: 25, y: 10 },
  ],
  width: 6,
  rounded: true,
  side: 1,
  edge: 'curb',
  surface: 'smooth',
  markings: true,
};
const side = {
  ...road,
  id: 'side',
  traceType: 'sidewalk',
  points: [
    { x: 14, y: 3 },
    { x: 14, y: 10 },
  ],
  width: 2,
  surface: 'slabs',
  markings: false,
};
test('circulation persists styles, edits and modules without physical walls', () => {
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [road, side] }));
  assert.deepEqual(p.elements, [road, side]);
  assert.deepEqual(wallSegments(road), []);
  assert.equal(moveElement(road, 2, 3).points[0].x, 5);
  assert.ok(changeVertexCount(p, 'road', 0, 'insert'));
  const m = createModule(p, ['road', 'side'], 'Rua e calçada');
  const copy = placeModule(newProject(), m, 30, 30).project;
  assert.equal(copy.elements[0].edge, 'curb');
  assert.equal(copy.elements[1].surface, 'slabs');
  assert.throws(() => parseProject(JSON.stringify({ ...p, elements: [{ ...road, edge: 'bad' }] })));
  assert.throws(() => normalizeCirculation({ ...road, markings: 'yes' }));
  assert.deepEqual(normalizeCirculation({ traceType: 'path' }), {
    edge: 'line',
    surface: 'smooth',
    markings: false,
  });
});
test('junction candidates include touching ends, crossings and unequal widths but exclude distant paths', () => {
  assert.ok(overlappingTraces(road, side));
  assert.ok(
    overlappingTraces(road, {
      ...road,
      points: [
        { x: 25, y: 10 },
        { x: 35, y: 10 },
      ],
    }),
  );
  assert.equal(
    overlappingTraces(road, {
      ...side,
      points: [
        { x: 50, y: 3 },
        { x: 50, y: 15 },
      ],
    }),
    false,
  );
});
test('circulation renders network borders before interiors, masks junction details and preserves hit targets', async () => {
  const { createServer } = await import('vite');
  const { createElement: h } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { CirculationNetwork } = await server.ssrLoadModule(
      '/src/blueprints/CirculationNetwork.jsx',
    );
    const svg = renderToStaticMarkup(
      h(
        'svg',
        {},
        h(CirculationNetwork, { elements: [road, side], floor: '#123456', ink: '#abcdef' }),
      ),
    );
    assert.ok(svg.indexOf('stroke-width="2.08"') < svg.indexOf('stroke="#123456"'));
    assert.match(svg, /data-object="road"/);
    assert.match(svg, /data-object="side"/);
    assert.match(svg, /stroke-dasharray="1.5 1"/);
    assert.match(svg, /mask="url/);
    assert.doesNotMatch(svg, /NaN|undefined/);
    await server.ssrLoadModule('/src/blueprints/BlueprintEditor.jsx');
  } finally {
    await server.close();
  }
});

test('slab joints follow local direction, curves and remain bounded', async () => {
  const { pavementJoints, circulationStyle } = await import('../src/blueprints/circulation.js');
  const joints = pavementJoints(
    [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
    2,
  );
  assert.ok(joints.length > 0);
  for (const j of joints) assert.ok(Math.abs(j.b.x - j.a.x + (j.b.y - j.a.y)) < 1e-8);
  const bent = pavementJoints(
    [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ],
    2,
  );
  assert.ok(bent.some((j) => j.a.x === j.b.x));
  assert.ok(bent.some((j) => j.a.y === j.b.y));
  assert.ok(
    pavementJoints(
      [
        { x: 0, y: 0 },
        { x: 2000, y: 2000 },
      ],
      0.25,
    ).length <= 600,
  );
  assert.deepEqual(
    pavementJoints(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      2,
    ),
    [],
  );
  assert.equal(circulationStyle({ traceType: 'road', surface: 'slabs' }).finish, 'smooth');
});
