import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import {
  floorList,
  activeFloor,
  addFloor,
  reorderFloor,
  switchFloor,
} from '../src/blueprints/floors.js';
import { addConnections, floorElements } from '../src/blueprints/connections.js';
import { editPathVertex } from '../src/blueprints/gesture-transform.js';
import { reopenVent, isClosedVent } from '../src/blueprints/vent-cycle.js';
import { alignVentDestination, connectVentFloor } from '../src/blueprints/vent-links.js';
const save = (p) => parseProject(JSON.stringify(p));
const point = (x, y) => ({ x, y });
const vent = (id, points) => ({ id, kind: 'vent', width: 1, points });
test('legacy floor content and multi-stop freight lift survive basement insertion and persistence', () => {
  const old = newProject();
  const ground = activeFloor(old);
  old.elements.push(vent('existing', [point(2, 3), point(6, 3)]));
  const basement = save(addFloor(old, false, true));
  assert.equal(basement.groundFloor, ground);
  assert.deepEqual(
    floorList(basement).map((f) => f.id),
    [activeFloor(basement), ground],
  );
  assert.equal(floorElements(basement, ground)[0].id, 'existing');
  const top = addFloor(basement);
  const swapped = save(reorderFloor(top, -1));
  assert.equal(swapped.groundFloor, activeFloor(top));
  const linked = save(addConnections(top, [activeFloor(basement), ground], 'freightLift', 3, 4));
  assert.equal(linked.connections.length, 3);
  for (const f of linked.floors)
    assert.equal(floorElements(linked, f.id).find((e) => e.asset === 'freightLift').h, 3.2);
  assert.throws(() => reorderFloor(switchFloor(linked, ground), 1), /Desvincule/);
});
test('automatic T follows a changed run while explicit ends stay independent', () => {
  const main = vent('main', [point(0, 0), point(10, 0)]);
  const branch = vent('branch', [point(5, 0), point(5, 6)]);
  const cap = { ...branch, id: 'cap', accesses: ['cap', 'auto'] };
  const p = editPathVertex({ elements: [main, branch, cap] }, main, 1, point(10, 4));
  assert.deepEqual(p.elements[1].points[0], point(5, 2));
  assert.equal(p.elements[2], cap);
});
test('opening a cycle preserves port position and rejects a cut through an access', () => {
  const loop = vent('loop', [point(2, 2), point(6, 2), point(2, 6), point(2, 2)]);
  loop.ports = [{ segment: 2, t: 0.5 }];
  const open = reopenVent(loop);
  assert.equal(isClosedVent(open), false);
  assert.equal(open.ports[0].t, 2 / 3);
  assert.throws(() => reopenVent({ ...loop, ports: [{ segment: 2, t: 1 }] }), /acesso/);
});
test('vertical alignment moves only the paired hatch on its existing duct', () => {
  let p = addFloor(newProject());
  const v = vent('source', [point(3, 5), point(7, 5)]);
  v.ports = [{ id: 'p', type: 'ceiling', segment: 0, t: 0.5, side: 1, label: '' }];
  p.elements = [v];
  const a = { floorId: activeFloor(p), elementId: v.id, portId: 'p' };
  p = connectVentFloor(p, a, p.floors[0].id);
  const b = p.ventLinks[0].to;
  p = { ...p, elements: [{ ...v, ports: [{ ...v.ports[0], t: 0.55 }] }] };
  const aligned = save(alignVentDestination(p, a, b));
  assert.ok(Math.abs(floorElements(aligned, b.floorId)[0].ports[0].t - 0.7) < 1e-8);
  assert.throws(() => reorderFloor(aligned, -1), /Desvincule/);
});
