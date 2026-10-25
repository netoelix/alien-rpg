import test from 'node:test';
import assert from 'node:assert/strict';
import { assetOrder, reorderAsset } from '../src/blueprints/asset-order.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
const asset = (id, type) => ({
  id,
  kind: 'asset',
  asset: type,
  x: 10,
  y: 10,
  w: 2,
  h: 2,
  rotation: 0,
});
const p = {
  ...newProject(),
  elements: [
    asset('a', 'crewBed'),
    asset('b', 'crewBed'),
    asset('p', 'raisedPlatform'),
    asset('m', 'loadingZone'),
  ],
};
const order = (p) =>
  p.elements
    .filter((e) => e.kind === 'asset')
    .sort((a, b) => assetOrder(a) - assetOrder(b))
    .map((e) => e.id);
test('stack controls override defaults and move one level through equal ranks', () => {
  assert.deepEqual(order(p), ['p', 'm', 'a', 'b']);
  const moved = reorderAsset(p, 'p', 'front');
  assert.deepEqual(order(moved), ['m', 'a', 'b', 'p']);
  assert.deepEqual(order(reorderAsset(moved, 'p', 'backward')), ['m', 'a', 'p', 'b']);
  assert.deepEqual(order(reorderAsset(p, 'a', 'forward')), ['p', 'm', 'b', 'a']);
  assert.deepEqual(order(reorderAsset(moved, 'p', 'back')), ['p', 'm', 'a', 'b']);
  assert.deepEqual(order(parseProject(JSON.stringify(moved))), order(moved));
  assert.deepEqual(order(p), ['p', 'm', 'a', 'b']);
});
test('locked assets and boundary commands leave order unchanged', () => {
  assert.equal(reorderAsset(p, 'p', 'back'), p);
  const locked = { ...p, elements: p.elements.map((e) => ({ ...e, locked: true })) };
  assert.equal(reorderAsset(locked, 'a', 'front'), locked);
  assert.throws(() =>
    parseProject(JSON.stringify({ ...p, elements: [{ ...p.elements[0], stackOrder: 'x' }] })),
  );
});
