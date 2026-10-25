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
