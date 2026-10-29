import test from 'node:test';
import assert from 'node:assert/strict';
import { hospitalityAssets } from '../src/blueprints/hospitality-assets.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
import { assetCategories } from '../src/blueprints/asset-categories.js';
import { assetInMode } from '../src/blueprints/project-mode.js';
test('hospitality assets retain physical dimensions, category, save and module compatibility', () => {
  for (const [asset, v] of Object.entries(hospitalityAssets)) {
    const e = { id: asset, kind: 'asset', asset, x: 3, y: 3, w: v.w, h: v.h, rotation: 0 };
    const p = parseProject(JSON.stringify({ ...newProject(), elements: [e] }));
    assert.deepEqual(p.elements[0], e);
    assert.equal(assetInMode(p, asset), true);
    assert.equal(assetInMode({ ...p, mode: 'colony' }, asset), false);
    assert.ok(assetCategories.find((c) => c.id === v.category)?.items.includes(asset));
    assert.equal(
      placeModule(newProject(), createModule(p, [asset], v.name), 10, 10).project.elements[0].asset,
      asset,
    );
  }
});
