import { moduleGrid, placeModuleGrid } from '../src/blueprints/modules.js';
import { rotateModule } from '../src/blueprints/modules.js';
import {
  parseModuleLibrary,
  mergeModuleLibrary,
  serializeModuleLibrary,
} from '../src/blueprints/modules.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { createModule, parseModule, placeModule, moduleBounds } from '../src/blueprints/modules.js';
const fixture = () => ({
  ...newProject(),
  elements: [
    { id: 'room', kind: 'room', x: 2, y: 2, w: 8, h: 8 },
    { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1 },
    { id: 'asset', kind: 'asset', asset: 'console', x: 4, y: 4, w: 1, h: 1, rotation: 0 },
  ],
});
test('module roundtrip includes room contents and remaps openings for independent copies', () => {
  const module = parseModule(JSON.stringify(createModule(fixture(), ['room'], 'Enfermaria')));
  assert.equal(module.elements.length, 3);
  assert.equal(module.name, 'Enfermaria');
  const first = placeModule(newProject(), module, 15, 16);
  const second = placeModule(first.project, module, 30, 16);
  assert.equal(second.project.elements.length, 6);
  assert.equal(first.project.elements[0].x, 15);
  assert.equal(first.project.elements[1].wallId, first.project.elements[0].id);
  assert.notEqual(first.selectedId, second.selectedId);
  assert.equal(moduleBounds(module).x, 2);
});
test('invalid imports and out-of-bounds placement are rejected without changing the project', () => {
  const module = createModule(fixture(), ['room'], 'Teste');
  assert.throws(() => parseModule(JSON.stringify({ ...module, type: 'other' })));
  assert.throws(() =>
    parseModule(
      JSON.stringify({
        ...module,
        elements: module.elements.map((e) => (e.kind === 'door' ? { ...e, wallId: 'missing' } : e)),
      }),
    ),
  );
  const project = newProject();
  assert.throws(() => placeModule(project, module, 79, 59));
  assert.equal(project.elements.length, 0);
});

test('library roundtrip accepts individual modules and skips exact duplicates', () => {
  const module = createModule(fixture(), ['room'], 'Ponte');
  const incoming = parseModuleLibrary(serializeModuleLibrary([module]));
  assert.equal(incoming[0].name, 'Ponte');
  assert.equal(parseModuleLibrary(JSON.stringify(module)).length, 1);
  assert.equal(mergeModuleLibrary(incoming, incoming).length, 1);
  assert.equal(mergeModuleLibrary(incoming, [{ ...module, name: 'Enfermaria' }]).length, 2);
});
test('invalid library rejects entire import and enforces size and count limits', () => {
  const module = createModule(fixture(), ['room'], 'Ponte');
  assert.throws(() =>
    parseModuleLibrary(
      JSON.stringify({ type: 'alien-blueprint-library', version: 1, modules: [module, {}] }),
    ),
  );
  assert.throws(() =>
    parseModuleLibrary(
      JSON.stringify({
        type: 'alien-blueprint-library',
        version: 1,
        modules: Array(101).fill(module),
      }),
    ),
  );
  assert.throws(() =>
    mergeModuleLibrary(
      Array.from({ length: 100 }, (_, i) => ({ ...module, name: String(i) })),
      [module],
    ),
  );
});

test('rotating a pending module preserves opening bindings without changing the library original', () => {
  const source = createModule(fixture(), ['room'], 'Enfermaria');
  const original = JSON.stringify(source);
  const rotated = rotateModule(source, 1);
  const door = rotated.elements.find((element) => element.kind === 'door');
  assert.ok(rotated.elements.some((element) => element.id === door.wallId));
  assert.equal(JSON.stringify(source), original);
  const placed = placeModule(newProject(), rotated, 20, 20);
  assert.equal(placed.project.elements.length, 3);
  let result = source;
  for (let i = 0; i < 4; i++) result = rotateModule(result, 1);
  const before = moduleBounds(source),
    after = moduleBounds(result);
  assert.ok(Math.abs(before.w - after.w) < 1e-8);
  assert.ok(Math.abs(before.h - after.h) < 1e-8);
});

test('repeated placement produces independent rooms, openings and equipment each time', () => {
  const module = createModule(fixture(), ['room'], 'Alojamento');
  let project = newProject();
  const inserted = [];
  for (let i = 0; i < 3; i++) {
    const result = placeModule(project, module, 2 + i * 12, 2);
    project = result.project;
    inserted.push(result.ids);
  }
  assert.equal(project.elements.length, 9);
  assert.equal(new Set(inserted.flat()).size, 9);
  for (const ids of inserted) {
    const door = project.elements.find(
      (element) => ids.includes(element.id) && element.kind === 'door',
    );
    assert.ok(ids.includes(door.wallId));
  }
  assert.equal(module.elements.length, 3);
});

test('module grid uses edge spacing and preserves independent opening bindings', () => {
  const module = createModule(fixture(), ['room'], 'Alojamento');
  const options = { rows: 2, columns: 3, gap: 2 };
  const grid = moduleGrid(module, options);
  assert.equal(grid.w, 28);
  assert.equal(grid.h, 18);
  const result = placeModuleGrid(newProject(), module, 2, 3, options);
  assert.equal(result.project.elements.length, 18);
  assert.equal(new Set(result.ids).size, 18);
  const rooms = result.project.elements.filter((e) => e.kind === 'room');
  assert.deepEqual(
    rooms.map((e) => [e.x, e.y]),
    [
      [2, 3],
      [12, 3],
      [22, 3],
      [2, 13],
      [12, 13],
      [22, 13],
    ],
  );
  for (const door of result.project.elements.filter((e) => e.kind === 'door'))
    assert.ok(rooms.some((room) => room.id === door.wallId));
});
test('invalid grids reject all placement without touching the source', () => {
  const module = createModule(fixture(), ['room'], 'Alojamento'),
    project = newProject();
  assert.throws(() => placeModuleGrid(project, module, 70, 50, { rows: 2, columns: 3, gap: 2 }));
  assert.throws(() => moduleGrid(module, { rows: 1.5, columns: 2, gap: 0 }));
  assert.throws(() => moduleGrid(module, { rows: 1, columns: 2, gap: -1 }));
  assert.equal(project.elements.length, 0);
});
