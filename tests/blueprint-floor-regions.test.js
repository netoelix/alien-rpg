import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  wallSegments,
  changeVertexCount,
  moveElement,
} from '../src/blueprints/model.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
const region = {
  id: 'floor',
  kind: 'floorRegion',
  points: [
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 15, y: 15 },
    { x: 5, y: 15 },
  ],
  floorFinish: { type: 'service', size: 1, opacity: 0.3 },
};
test('floor regions preserve patterns, move and roundtrip through modules without walls', () => {
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [region] }));
  assert.deepEqual(p.elements[0], region);
  assert.deepEqual(wallSegments(region), []);
  assert.equal(moveElement(region, 2, 3).points[0].x, 7);
  const copy = placeModule(newProject(), createModule(p, ['floor'], 'Piso técnico'), 30, 30);
  assert.deepEqual(copy.project.elements[0].floorFinish, region.floorFinish);
  assert.throws(() =>
    parseProject(
      JSON.stringify({ ...p, elements: [{ ...region, points: region.points.slice(0, 2) }] }),
    ),
  );
  const changed = changeVertexCount(p, 'floor', 3, 'insert');
  assert.ok(changed);
});
test('floor regions and technical patterns render below equipment without invalid geometry', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Drawing } = await server.ssrLoadModule('/src/blueprints/Drawing.jsx');
    const p = { ...newProject(), elements: [region] };
    const svg = renderToStaticMarkup(createElement(Drawing, { project: p, interactive: true }));
    assert.match(svg, /data-floor-finish="service"/);
    assert.match(svg, /data-object="floor"/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  } finally {
    await server.close();
  }
});

test('resin finish survives saving and module placement on a concave floor region', () => {
  const resin = {
    ...region,
    points: [
      { x: 2, y: 2 },
      { x: 9, y: 2 },
      { x: 9, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 9 },
      { x: 2, y: 9 },
    ],
    floorFinish: { type: 'hive', size: 1.5, opacity: 0.45 },
  };
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [resin] }));
  assert.deepEqual(p.elements[0], resin);
  const copy = placeModule(newProject(), createModule(p, ['floor'], 'Colmeia'), 20, 20);
  assert.deepEqual(copy.project.elements[0].floorFinish, resin.floorFinish);
  assert.throws(
    () =>
      parseProject(
        JSON.stringify({
          ...p,
          elements: [
            { id: 'r', kind: 'room', x: 2, y: 2, w: 7, h: 7, floorFinish: resin.floorFinish },
          ],
        }),
      ),
    /região de piso/,
  );
});
