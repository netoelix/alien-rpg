import test from 'node:test';
import assert from 'node:assert/strict';
import { wallMaskBounds } from '../src/blueprints/wall-mask-bounds.js';
import { wallSegments } from '../src/blueprints/model.js';

test('wall masks contain rotated room and corridor boundaries with corner clearance', () => {
  for (const element of [
    { kind: 'room', x: 20, y: 20, w: 10, h: 5, rotation: 37 },
    {
      kind: 'corridor',
      width: 3,
      points: [
        { x: 10, y: 10 },
        { x: 30, y: 10 },
        { x: 30, y: 40 },
      ],
    },
  ]) {
    const b = wallMaskBounds(element, 100, 100);
    assert.ok(b.width * b.height < 10000 / 2);
    for (const [x, y] of wallSegments(element).flat()) {
      assert.ok(x >= b.x + 1.99 && x <= b.x + b.width - 1.99);
      assert.ok(y >= b.y + 1.99 && y <= b.y + b.height - 1.99);
    }
  }
});
test('wall mask respects map clipping for structures crossing its border', () => {
  const b = wallMaskBounds({ kind: 'room', x: -4, y: 95, w: 10, h: 10 }, 100, 100);
  assert.equal(b.x, 0);
  assert.equal(b.y + b.height, 100);
  assert.equal(b.width, 8);
});
