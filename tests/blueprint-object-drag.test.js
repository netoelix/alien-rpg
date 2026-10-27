import test from 'node:test';
import assert from 'node:assert/strict';
import { beginObjectDrag, objectDragStarted } from '../src/blueprints/object-drag.js';

test('selection and pointer jitter do not start a move for off-grid rooms, assets or doors', () => {
  for (const kind of ['room', 'ellipse', 'polygon', 'asset', 'door']) {
    const element = { id: 'item', kind, x: 2.37, y: 4.19 };
    const g = beginObjectDrag(element, { x: 3, y: 4 }, { clientX: 100, clientY: 200 });
    assert.equal(objectDragStarted(g, { clientX: 100, clientY: 200 }), false);
    assert.equal(objectDragStarted(g, { clientX: 102, clientY: 202 }), false);
    assert.equal(g.element, element);
    assert.deepEqual(g.end, g.start);
  }
});
test('intentional drag starts at four screen pixels and stays active when returning to origin', () => {
  const g = beginObjectDrag({ id: 'group' }, { x: 1, y: 2 }, { clientX: 100, clientY: 200 });
  assert.equal(objectDragStarted(g, { clientX: 104, clientY: 200 }), true);
  assert.equal(objectDragStarted({ ...g, dragging: true }, { clientX: 100, clientY: 200 }), true);
});
