import test from 'node:test';
import assert from 'node:assert/strict';
import { stairDestinations } from '../src/blueprints/stair-destinations.js';
import { switchFloor } from '../src/blueprints/floors.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
const stair = (id) => ({
  id,
  kind: 'asset',
  asset: 'stairs',
  x: 12,
  y: 12,
  w: 2,
  h: 2,
  rotation: 0,
});
const room = (name) => ({ id: 'r' + name, kind: 'room', x: 10, y: 10, w: 10, h: 10, name });
const a = stair('a'),
  b = stair('b');
const p = {
  ...newProject(),
  activeFloor: 'f1',
  elements: [a, room('Sala 2')],
  floors: [
    { id: 'f1', name: 'Pavimento 1' },
    { id: 'f2', name: 'Pavimento 2', elements: [b, room('Sala 20')] },
  ],
  connections: [
    { id: 'c', from: { floorId: 'f1', elementId: 'a' }, to: { floorId: 'f2', elementId: 'b' } },
  ],
};
test('stair destinations resolve both ends and update with room names and position', () => {
  assert.deepEqual(stairDestinations(p, a), ['↑ Pavimento 2 · Sala 20']);
  assert.deepEqual(stairDestinations(switchFloor(p, 'f2'), b), ['↓ Pavimento 1 · Sala 2']);
  const next = structuredClone(p);
  next.floors[1].elements[1].name = 'Laboratório';
  assert.match(stairDestinations(next, a)[0], /Laboratório/);
  next.floors[1].elements[0].x = 30;
  assert.deepEqual(stairDestinations(next, a), ['↑ Pavimento 2']);
  assert.deepEqual(stairDestinations(p, { ...a, asset: 'elevator' }), []);
  assert.deepEqual(stairDestinations({ ...p, connections: [] }, a), []);
});
test('label controls survive saving without changing legacy dimensions or links', () => {
  const next = structuredClone(p);
  next.elements[0].connectionLabel = { dx: 2, dy: -1, hidden: false, export: false };
  const saved = parseProject(JSON.stringify(next));
  assert.deepEqual(saved.elements[0].connectionLabel, next.elements[0].connectionLabel);
  assert.equal(saved.elements[0].w, 2);
  assert.deepEqual(saved.connections, p.connections);
});
