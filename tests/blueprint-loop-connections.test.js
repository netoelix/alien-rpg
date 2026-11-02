import test from 'node:test';
import assert from 'node:assert/strict';
import { ventNetworks } from '../src/blueprints/ventilation.js';
import { newProject, parseProject, changeVertexCount } from '../src/blueprints/model.js';
import { activeFloor, addFloor, switchFloor } from '../src/blueprints/floors.js';
import { connectVentFloor, ventLinkEndpoint } from '../src/blueprints/vent-links.js';
import { startHistory, applyEdit, undoEdit, redoEdit } from '../src/blueprints/edit-history.js';
const points = (coords) => coords.map(([x, y]) => ({ x, y }));
const loop = {
  kind: 'vent',
  id: 'loop',
  width: 1,
  points: points([
    [8, 8],
    [16, 8],
    [16, 16],
    [8, 16],
    [8, 8],
  ]),
};
test('a loop crossing another run at its seam stays independent; a branch ending there joins', () => {
  const cross = {
    kind: 'vent',
    id: 'cross',
    width: 1,
    points: points([
      [4, 4],
      [12, 12],
    ]),
  };
  assert.equal(ventNetworks([loop, cross]).length, 2);
  const branch = {
    ...cross,
    points: points([
      [4, 4],
      [8, 8],
    ]),
  };
  assert.equal(ventNetworks([{ ...loop, accesses: ['cap', 'cap'] }, branch]).length, 1);
});
test('editing the closing vertex preserves a vertical hatch, its peer and history through save/reopen', () => {
  const vent = {
    ...loop,
    ports: [{ id: 'h', label: '', side: 1, segment: 3, t: 0.5, type: 'ceiling' }],
  };
  let p = { ...newProject(), elements: [vent] };
  const from = { floorId: activeFloor(p), elementId: 'loop', portId: 'h' };
  p = addFloor(p);
  const targetFloor = activeFloor(p);
  p = switchFloor(p, from.floorId);
  p = connectVentFloor(p, from, targetFloor);
  const link = p.ventLinks[0];
  const oldPeer = ventLinkEndpoint(p, link.to);
  let h = applyEdit(startHistory(p), changeVertexCount(p, 'loop', 4, 'remove'));
  const restored = parseProject(JSON.stringify(h.project));
  assert.deepEqual(restored.ventLinks, [link]);
  assert.equal(ventLinkEndpoint(restored, from).port.segment, 2);
  assert.equal(ventLinkEndpoint(restored, from).port.t, 0.25);
  assert.deepEqual(
    ventLinkEndpoint(switchFloor(restored, targetFloor), link.to).vent.points,
    oldPeer.vent.points,
  );
  const before = undoEdit(h);
  assert.equal(ventLinkEndpoint(before.project, from).port.segment, 3);
  assert.deepEqual(redoEdit(before).project, h.project);
});
