import test from 'node:test';
import assert from 'node:assert/strict';
import { vehicleAssets } from '../src/blueprints/vehicle-assets.js';
import { vehicleShape } from '../src/blueprints/vehicle-geometry.js';
test('vehicle plans project geometry into metres without changing source data', () => {
  const shape = { tag: 'path', d: 'M10 20H90V80L50 50Z' };
  assert.equal(vehicleShape(shape, 4, 20).d, 'M0.4 4H3.6V16L2 10Z');
  assert.equal(shape.d, 'M10 20H90V80L50 50Z');
  assert.deepEqual(vehicleShape({ tag: 'ellipse', cx: 50, cy: 50, rx: 10, ry: 5 }, 4, 20), {
    tag: 'ellipse',
    cx: 2,
    cy: 10,
    rx: 0.4,
    ry: 1,
  });
  for (const asset of Object.values(vehicleAssets))
    for (const s of asset.shapes) {
      if (s.d) assert.doesNotMatch(s.d.replace(/[MLHVZ]/g, ''), /[a-z]/i);
      const projected = vehicleShape(s, asset.w, asset.h);
      assert.ok(Object.values(projected).every((v) => typeof v !== 'number' || Number.isFinite(v)));
    }
});
