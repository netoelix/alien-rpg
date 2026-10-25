import test from 'node:test';
import assert from 'node:assert/strict';
import { stepPositions } from '../src/blueprints/level-assets.js';
import { assetOrder } from '../src/blueprints/asset-order.js';
test('level detailing stays bounded at supported sizes', () => {
  for (const size of [0.25, 0.9, 3, 2000]) {
    const points = stepPositions(size);
    assert.ok(points.length >= 2 && points.length <= 40);
    assert.ok(points.every((x, i) => x > 0 && x < size && (!i || x > points[i - 1])));
  }
});
test('platforms stay beneath markings and furniture regardless of insertion order', () => {
  const items = ['crewBed', 'loadingZone', 'gratedPlatform', 'raisedPlatform'].map((asset) => ({
    asset,
  }));
  assert.deepEqual(
    items.sort((a, b) => assetOrder(a) - assetOrder(b)).map((e) => e.asset),
    ['gratedPlatform', 'raisedPlatform', 'loadingZone', 'crewBed'],
  );
});
