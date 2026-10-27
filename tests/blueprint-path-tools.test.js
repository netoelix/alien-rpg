import test from 'node:test';
import assert from 'node:assert/strict';
import { pathChoices, pathPreset } from '../src/blueprints/path-tools.js';
import { newProject, parseProject, layerFor } from '../src/blueprints/model.js';
test('família de percursos preserva o tipo físico, largura inicial e persistência', () => {
  for (const [id] of pathChoices) {
    const p = pathPreset(id);
    const element = {
      id: 'sample',
      kind: p.tool,
      width: p.width,
      points: [
        { x: 2, y: 2 },
        { x: 12, y: 2 },
      ],
      ...(p.tool === 'trace' ? p.style : {}),
    };
    const saved = parseProject(JSON.stringify({ ...newProject(), elements: [element] }))
      .elements[0];
    assert.equal(saved.kind, p.tool);
    assert.equal(saved.width, p.width);
    if (p.tool === 'trace') assert.equal(saved.traceType, id);
    assert.equal(layerFor(saved.kind), layerFor(p.tool));
  }
  assert.throws(() => pathPreset('unknown'));
});
