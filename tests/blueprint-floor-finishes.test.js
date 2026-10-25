import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject, moveElement } from '../src/blueprints/model.js';
import { normalizeFloorFinish } from '../src/blueprints/floor-finishes.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
const room = {
  id: 'room',
  kind: 'room',
  x: 10,
  y: 10,
  w: 10,
  h: 10,
  floorFinish: { type: 'plates', size: 1, opacity: 0.2 },
};
test('floor finish survives saving, moving and module placement without rescaling', () => {
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [room] }));
  assert.deepEqual(p.elements[0].floorFinish, room.floorFinish);
  assert.deepEqual(moveElement(room, 5, 5).floorFinish, room.floorFinish);
  const module = createModule(p, ['room'], 'Chapas');
  const copy = placeModule(newProject(), module, 30, 30);
  assert.deepEqual(copy.project.elements[0].floorFinish, room.floorFinish);
  assert.equal(
    parseProject(
      JSON.stringify({ ...newProject(), elements: [{ ...room, floorFinish: undefined }] }),
    ).elements[0].floorFinish,
    undefined,
  );
});
test('floor finish rejects invalid kinds, density and opacity', () => {
  for (const value of [
    { type: 'bad' },
    { type: 'tiles', size: 0 },
    { type: 'plates', opacity: 2 },
    { type: 'grating', size: Infinity },
    { type: 'tiles', opacity: '0.2' },
  ])
    assert.throws(() => normalizeFloorFinish(value));
  assert.deepEqual(normalizeFloorFinish({ type: 'tiles' }), {
    type: 'tiles',
    size: 1,
    opacity: 0.2,
  });
  assert.throws(() =>
    parseProject(
      JSON.stringify({
        ...newProject(),
        elements: [
          {
            id: 'p',
            kind: 'partition',
            points: [
              { x: 10, y: 10 },
              { x: 20, y: 10 },
            ],
            floorFinish: room.floorFinish,
          },
        ],
      }),
    ),
  );
  for (const element of [
    { ...room, kind: 'ellipse' },
    {
      id: 'p',
      kind: 'polygon',
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 10 },
        { x: 20, y: 20 },
      ],
      floorFinish: room.floorFinish,
    },
    {
      id: 'c',
      kind: 'corridor',
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 10 },
      ],
      width: 2,
      floorFinish: room.floorFinish,
    },
  ])
    assert.deepEqual(
      parseProject(JSON.stringify({ ...newProject(), elements: [element] })).elements[0]
        .floorFinish,
      room.floorFinish,
    );
});

test('SVG patterns have bounded geometry and distinct IDs for separate areas', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { FloorFinish } = await server.ssrLoadModule('/src/blueprints/FloorFinish.jsx');
    const render = (element) =>
      renderToStaticMarkup(createElement(FloorFinish, { element, ink: '#ffffff' }));
    const small = render(room),
      large = render({
        ...room,
        w: 1000,
        h: 1000,
        floorFinish: { ...room.floorFinish, size: 0.25 },
      });
    assert.equal((small.match(/<path/g) || []).length, (large.match(/<path/g) || []).length);
    assert.match(small, /patternUnits="userSpaceOnUse"/);
    assert.match(large, /width="0.25"/);
    const pair = renderToStaticMarkup(
      createElement(
        'g',
        null,
        createElement(FloorFinish, { element: room }),
        createElement(FloorFinish, { element: room }),
      ),
    );
    const ids = [...pair.matchAll(/<pattern id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, 2);
    assert.equal(render({ ...room, floorFinish: { ...room.floorFinish, type: 'plain' } }), '');
  } finally {
    await server.close();
  }
});
