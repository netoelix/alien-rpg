import { legacyAssets } from '../src/blueprints/legacy-assets.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { assetCategories } from '../src/blueprints/asset-categories.js';
import { assetTypes } from '../src/blueprints/model.js';
test('each equipment type belongs to exactly one category', () => {
  const entries = assetCategories.flatMap((c) => c.items);
  assert.equal(new Set(entries).size, entries.length);
  assert.deepEqual(
    [...entries].sort(),
    assetTypes.filter((id) => !Object.hasOwn(legacyAssets, id)).sort(),
  );
});
