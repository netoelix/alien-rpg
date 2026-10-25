import test from 'node:test';
import assert from 'node:assert/strict';
import { assetFootprint, furniture } from '../src/blueprints/furniture.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
test('physical furniture retains footprints through project and module round trips', () => {
  const elements = Object.keys(furniture).map((asset, i) => ({
    id: 'f' + i,
    kind: 'asset',
    asset,
    x: 10 + (i % 8) * 4,
    y: 10 + Math.floor(i / 8) * 4,
    rotation: 0,
    ...assetFootprint(asset),
  }));
  const testProject = {
    ...newProject(),
    width: 120,
    height: Math.max(100, 50 + Math.ceil(elements.length / 8) * 4),
  };
  const p = parseProject(JSON.stringify({ ...testProject, elements }));
  assert.deepEqual(p.elements, elements);
  const module = createModule(
    p,
    elements.map((e) => e.id),
    'Posto de comando',
  );
  const copy = placeModule(testProject, module, 20, 20);
  assert.deepEqual(
    copy.project.elements.map((e) => [e.asset, e.w, e.h]),
    elements.map((e) => [e.asset, e.w, e.h]),
  );
  assert.deepEqual(assetFootprint('console'), { w: 2, h: 2 });
  assert.deepEqual(assetFootprint('commandBench'), { w: 2, h: 1 });
});
