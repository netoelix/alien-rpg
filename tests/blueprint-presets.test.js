import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeModule,
  moduleNames,
  newProject,
  parseProject,
  exampleProject,
  doorPosition,
} from '../src/blueprints/model.js';
import { furniture } from '../src/blueprints/furniture.js';
import { createModule, placeModule } from '../src/blueprints/modules.js';
test('ready modules use real catalog footprints, clear entrances and reusable valid objects', () => {
  for (const type of Object.keys(moduleNames)) {
    const elements = makeModule(type, 5, 5),
      room = elements[0];
    const project = parseProject(JSON.stringify({ ...newProject(), elements }));
    assert.deepEqual(project.elements, elements);
    for (const asset of elements.filter((e) => e.kind === 'asset')) {
      assert.ok(furniture[asset.asset]);
      assert.equal(asset.w, furniture[asset.asset].w);
      assert.equal(asset.h, furniture[asset.asset].h);
      assert.ok(
        asset.x >= room.x &&
          asset.y >= room.y &&
          asset.x + asset.w <= room.x + room.w &&
          asset.y + asset.h <= room.y + room.h,
        type + ': ' + asset.asset,
      );
      assert.ok(
        !(
          asset.x < room.x + 5.8 &&
          asset.x + asset.w > room.x + 4.2 &&
          asset.y + asset.h > room.y + 6
        ),
        type + ' entrance blocked',
      );
    }
    const m = createModule(
      project,
      elements.map((e) => e.id),
      moduleNames[type],
    );
    assert.equal(placeModule(newProject(), m, 30, 30).project.elements.length, elements.length);
  }
});
test('example contains eight furnished sectors with doors connected to corridors and fresh identifiers', () => {
  const p = parseProject(JSON.stringify(exampleProject()));
  assert.equal(p.elements.filter((e) => e.kind === 'room').length, 8);
  assert.equal(new Set(p.elements.map((e) => e.id)).size, p.elements.length);
  for (const door of p.elements.filter((e) => e.kind === 'door')) {
    const pos = doorPosition(door, p.elements);
    assert.ok(
      p.elements.some(
        (e) => e.kind === 'corridor' && e.points.some((q) => q.x === pos.x && q.y === pos.y),
      ),
    );
  }
  const other = exampleProject();
  assert.ok(other.elements.every((e) => !p.elements.some((o) => o.id === e.id)));
});
