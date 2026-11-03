import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
test('editor renders all tools including tools without keyboard shortcuts', async () => {
  const server = await createServer({
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { default: Editor } = await server.ssrLoadModule('/src/blueprints/BlueprintEditor.jsx');
    const html = renderToString(createElement(Editor));
    assert.match(html, /Cota de distância/);
    assert.match(html, /Planta editável/);
    assert.doesNotMatch(html, /undefined/);
  } finally {
    await server.close();
  }
});
test('visual planes in the exportable SVG keep furniture below walls and openings, and wall fixtures above', async () => {
  const server = await createServer({
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { Drawing } = await server.ssrLoadModule('/src/blueprints/Drawing.jsx');
    const { newProject } = await server.ssrLoadModule('/src/blueprints/model.js');
    const room = { id: 'room', kind: 'room', x: 3, y: 3, w: 10, h: 10 };
    const door = { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1 };
    const asset = (id, type) => ({
      id,
      kind: 'asset',
      asset: type,
      x: 7,
      y: 3,
      w: 2,
      h: 2,
      rotation: 0,
    });
    const vent = {
      id: 'duct',
      kind: 'vent',
      points: [
        { x: 3, y: 8 },
        { x: 14, y: 8 },
      ],
      width: 1,
    };
    const render = (layer) =>
      renderToString(
        createElement(
          'svg',
          null,
          createElement(Drawing, {
            project: {
              ...newProject(),
              elements: [
                room,
                door,
                asset('camera', 'surveillanceCamera'),
                { ...asset('cabinet', 'crewBed'), visualLayer: layer },
                vent,
              ],
            },
          }),
        ),
      );
    const order = (html, needles) => {
      let last = -1;
      for (const n of needles) {
        const index = html.indexOf(n);
        assert.ok(index > last, n);
        last = index;
      }
    };
    order(render(), [
      'data-object="cabinet"',
      'mask="url(#blueprint-walls-walls)"',
      'data-object="door"',
      'data-object="camera"',
      'data-vent-presentation="contextual"',
    ]);
    order(render('ceiling'), [
      'data-object="door"',
      'data-object="camera"',
      'data-object="cabinet"',
      'data-vent-presentation="contextual"',
    ]);
  } finally {
    await server.close();
  }
});
