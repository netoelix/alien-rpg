import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { arrangeEquipment, objectView } from '../src/blueprints/arrange.js';
import { selectionBounds } from '../src/blueprints/selection.js';
const fixture = () => ({
  ...newProject(),
  elements: [
    { id: 'a', kind: 'asset', asset: 'console', x: 5, y: 5, w: 2, h: 2, rotation: 0 },
    { id: 'b', kind: 'asset', asset: 'console', x: 15, y: 10, w: 4, h: 2, rotation: 45 },
    { id: 'c', kind: 'asset', asset: 'console', x: 30, y: 15, w: 2, h: 2, rotation: 0 },
  ],
});
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8);
test('alignment uses rotated bounds and preserves dimensions, names and other objects', () => {
  const p = fixture();
  p.elements[0].name = 'Reator principal';
  const result = arrangeEquipment(p, ['a', 'b'], 'left');
  near(selectionBounds(result.elements[0]).x, selectionBounds(result.elements[1]).x);
  assert.equal(result.elements[1].rotation, 45);
  assert.equal(result.elements[1].w, 4);
  assert.equal(result.elements[0].name, 'Reator principal');
  assert.deepEqual(result.elements[2], p.elements[2]);
  assert.equal(p.elements[1].x, 15);
});
test('distribution preserves extremes and produces equal gaps between different widths', () => {
  const p = fixture(),
    r = arrangeEquipment(p, ['c', 'a', 'b'], 'distributeX');
  const [a, b, c] = r.elements.map(selectionBounds);
  near(b.x - a.x - a.w, c.x - b.x - b.w);
  near(r.elements[0].x, p.elements[0].x);
  near(r.elements[2].x, p.elements[2].x);
});
test('arrangement refuses locked objects, partial groups and insufficient selections', () => {
  const p = fixture();
  p.elements[0].locked = true;
  assert.throws(() => arrangeEquipment(p, ['a', 'b'], 'left'));
  delete p.elements[0].locked;
  p.elements[0].groupId = 'g';
  p.elements[2].groupId = 'g';
  assert.throws(() => arrangeEquipment(p, ['a', 'b'], 'left'));
  assert.throws(() => arrangeEquipment(p, ['a', 'b'], 'distributeX'));
});
test('locate centers rotated equipment and persisted names remain intact', () => {
  const p = fixture();
  p.elements[1].name = 'Console de navegação';
  const r = parseProject(JSON.stringify(p)),
    view = objectView(r, 'b'),
    box = selectionBounds(r.elements[1]);
  near(view.x + p.width / view.zoom / 2, box.x + box.w / 2);
  near(view.y + p.height / view.zoom / 2, box.y + box.h / 2);
  assert.equal(r.elements[1].name, 'Console de navegação');
});
