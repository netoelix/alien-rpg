import test from 'node:test';
import assert from 'node:assert/strict';
import { settlementAssets } from '../src/blueprints/settlement-assets.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { assetInMode } from '../src/blueprints/project-mode.js';
import { assetCategories } from '../src/blueprints/asset-categories.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
test('external buildings are catalogued only in colony mode and survive project/module roundtrips', () => {
  for (const [asset, v] of Object.entries(settlementAssets)) {
    const e = { id: asset, kind: 'asset', asset, x: 2, y: 2, w: v.w, h: v.h, rotation: 0 };
    const p = parseProject(JSON.stringify({ ...newProject(), mode: 'colony', elements: [e] }));
    assert.deepEqual(p.elements[0], e);
    assert.equal(assetInMode(p, asset), true);
    assert.equal(assetInMode(newProject(), asset), false);
    assert.ok(assetCategories.find((c) => c.id === v.category).items.includes(asset));
    const m = createModule(p, [asset], v.name);
    assert.equal(
      placeModule({ ...newProject(), width: 200, height: 200 }, m, 60, 60).project.elements[0]
        .asset,
      asset,
    );
  }
});
