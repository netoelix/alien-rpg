import { addConnections } from '../src/blueprints/connections.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject, moveElement } from '../src/blueprints/model.js';
import { addFloor, activeFloor, switchFloor, removeFloor } from '../src/blueprints/floors.js';
import { addConnection, pruneConnections, floorElements } from '../src/blueprints/connections.js';
const save = (project) => parseProject(JSON.stringify(project));
function fixture(type = 'stairs') {
  const project = addFloor(newProject());
  return addConnection(project, project.floors[0].id, type, 4, 6);
}
test('connections survive save/reopen and navigation with independent endpoint transforms', () => {
  for (const type of ['stairs', 'elevator']) {
    const project = save(fixture(type));
    const link = project.connections[0];
    assert.equal(project.elements[0].asset, type);
    assert.notEqual(link.from.elementId, link.to.elementId);
    const moved = save({
      ...project,
      elements: project.elements.map((element) => moveElement(element, 3, 4)),
    });
    const other = save(switchFloor(moved, link.to.floorId));
    assert.equal(other.elements[0].x, 4);
    assert.equal(floorElements(other, link.from.floorId)[0].x, 7);
    assert.deepEqual(other.connections, project.connections);
  }
});
test('removing an endpoint or a floor cleans its link without deleting the other endpoint', () => {
  const project = fixture();
  const removed = save(pruneConnections({ ...project, elements: [] }));
  assert.equal(removed.connections.length, 0);
  assert.equal(removed.floors[0].elements.length, 1);
  const floorRemoved = save(pruneConnections(removeFloor(project)));
  assert.equal(floorRemoved.connections.length, 0);
  assert.equal(floorRemoved.elements.length, 1);
});
test('invalid connections, malformed imports and locked equipment are rejected', () => {
  const project = fixture();
  assert.throws(() => addConnection(project, activeFloor(project), 'stairs', 0, 0));
  assert.throws(() => addConnection(project, project.floors[0].id, 'elevator', 79, 0));
  assert.throws(() =>
    addConnection(
      { ...project, layers: project.layers.map((layer) => ({ ...layer, locked: true })) },
      project.floors[0].id,
      'stairs',
      1,
      1,
    ),
  );
  const invalid = structuredClone(project);
  invalid.connections[0].to.elementId = 'missing';
  assert.throws(() => save(invalid));
  assert.throws(() =>
    save({ ...project, connections: [...project.connections, ...project.connections] }),
  );
});
test('duplicating a floor keeps copies independent from the original vertical link', () => {
  const project = save(fixture());
  const duplicate = save(addFloor(project, true));
  assert.equal(duplicate.connections.length, 1);
  assert.notEqual(duplicate.elements[0].id, project.elements[0].id);
  assert.ok(
    duplicate.connections.every(
      (link) =>
        link.from.floorId !== activeFloor(duplicate) && link.to.floorId !== activeFloor(duplicate),
    ),
  );
});

test('multi-floor elevator creates one aligned asset per stop and retains links after a stop is deleted', () => {
  const project = addFloor(addFloor(newProject()));
  const destinations = project.floors
    .filter((floor) => floor.id !== activeFloor(project))
    .map((floor) => floor.id);
  const linked = save(addConnections(project, destinations, 'elevator', 12, 15));
  assert.equal(linked.connections.length, 3);
  for (const floor of linked.floors) {
    const items = floorElements(linked, floor.id);
    assert.equal(items.length, 1);
    assert.equal(items[0].x, 12);
    assert.equal(items[0].y, 15);
    const links = linked.connections.filter(
      (link) => link.from.floorId === floor.id || link.to.floorId === floor.id,
    );
    assert.equal(links.length, 2);
  }
  const removed = save(pruneConnections(removeFloor(linked)));
  assert.equal(removed.connections.length, 1);
  assert.equal(removed.floors.length, 2);
});
test('multiple stair destinations and stale floor selections are rejected atomically', () => {
  const project = addFloor(addFloor(newProject()));
  const ids = project.floors
    .filter((floor) => floor.id !== activeFloor(project))
    .map((floor) => floor.id);
  assert.throws(() => addConnections(project, ids, 'stairs', 4, 4));
  assert.throws(() => addConnections(project, [...ids, 'missing'], 'elevator', 4, 4));
  assert.equal(project.elements.length, 0);
  assert.ok(project.floors.every((floor) => !floor.elements?.length));
});
