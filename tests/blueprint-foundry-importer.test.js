import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { addFloor } from '../src/blueprints/floors.js';
import { floorList } from '../src/blueprints/floor-store.js';
import { addConnections } from '../src/blueprints/connections.js';
import { buildFoundryPackage } from '../src/blueprints/foundry/package.js';
import { prepareFoundryImport, importFoundryPackage } from '../src/blueprints/foundry/importer.js';

function fixture() {
  let p = addFloor(newProject());
  p = addConnections(p, [floorList(p)[0].id], 'elevator', 4, 5);
  const bundle = buildFoundryPackage(p);
  return { bundle, images: new Map(bundle.scenes.map((s) => [s.key, `maps/${s.key}.png`])) };
}
function fakeRuntime(failType) {
  const events = [],
    scenes = [];
  const runtime = {
    isGM: true,
    generation: 14,
    accessEnabled: true,
    async createScene(data) {
      const id = `scene${scenes.length}`,
        embedded = [];
      const scene = {
        id,
        data,
        embedded,
        // Match Foundry's automatic level when no levels are supplied.
        levels: {
          contents: (data.levels?.length ? data.levels : [{ name: 'Andar' }]).map((level, i) => ({
            ...level,
            id: `Level${i}`,
          })),
        },
        async update(data) {
          events.push(['scene-update', id, data]);
        },
        async delete() {
          events.push(['delete', id]);
        },
        async createEmbeddedDocuments(type, records) {
          events.push(['create', id, type]);
          if (type === failType) throw Error('Simulated failure');
          embedded.push({ type, records });
          return records.map((data, i) => ({
            id: `${type}${i}`,
            uuid: `Scene.${id}.Region.region${i}`,
            data,
            async update(value) {
              events.push(['activate', id, value]);
            },
          }));
        },
      };
      scenes.push(scene);
      return scene;
    },
  };
  return { runtime, events, scenes };
}
test('Foundry 14 import creates levels and resolves only actual returned region UUIDs', async () => {
  const { bundle, images } = fixture(),
    before = JSON.stringify(bundle);
  const { runtime, events, scenes } = fakeRuntime();
  await importFoundryPackage(bundle, images, runtime);
  assert.equal(scenes.length, 2);
  for (const scene of scenes) {
    assert.equal(scene.data.padding, 0);
    assert.equal(scene.data.navigation, false);
    assert.equal(scene.levels.contents.length, 1);
    assert.equal(scene.levels.contents[0].name, scene.data.name);
    assert.ok(scene.levels.contents[0].background.src);
    assert.ok(!scene.embedded.some((e) => e.type === 'Level'));
    const region = scene.embedded.find((e) => e.type === 'Region').records[0];
    assert.equal(region.flags['alien-suite-mae'].access.enabled, false);
    assert.deepEqual(region.levels, ['Level0']);
  }
  const firstActivation = events.findIndex((e) => e[0] === 'activate');
  assert.ok(events.slice(firstActivation).every((e) => e[0] === 'activate'));
  for (const event of events.filter((e) => e[0] === 'activate')) {
    const destination = event[1] === 'scene0' ? 'scene1' : 'scene0';
    assert.deepEqual(event[2].flags['alien-suite-mae'].access.targets, [
      `Scene.${destination}.Region.region0`,
    ]);
  }
  assert.equal(JSON.stringify(bundle), before);
});
test('preflight rejects incomplete images, geometry and destinations without creating scenes', async () => {
  for (const damage of [
    (b, i) => i.delete(b.scenes[1].key),
    (b) => {
      b.scenes[1].geometry.ready = false;
    },
    (b) => {
      b.accesses[0].targets = ['missing'];
    },
    (b) => {
      b.scenes[0].grid.size = 10;
    },
    (b) => {
      b.accesses[0].kind = 'vent';
    },
  ]) {
    const { bundle, images } = fixture(),
      { runtime, scenes } = fakeRuntime();
    damage(bundle, images);
    await assert.rejects(importFoundryPackage(bundle, images, runtime));
    assert.equal(scenes.length, 0);
  }
});
test('creation failure rolls back only new scenes and preserves the failure cause', async () => {
  const { bundle, images } = fixture(),
    { runtime, events } = fakeRuntime('Region');
  await assert.rejects(importFoundryPackage(bundle, images, runtime), (e) => {
    assert.match(e.cause.message, /Simulated/);
    return true;
  });
  assert.deepEqual(
    events.filter((e) => e[0] === 'delete'),
    [['delete', 'scene0']],
  );
  assert.ok(!events.some((e) => e[0] === 'activate'));
});
test('native walls use integer pixels and window movement blocking without vision blocking', () => {
  const { bundle, images } = fixture();
  bundle.scenes[0].geometry.barriers = [
    {
      kind: 'window',
      coordinates: [0.2, 0, 100.3, 0],
      blocks: { movement: true, sight: false, light: false, sound: true },
    },
  ];
  const wall = prepareFoundryImport(bundle, images)[0].walls[0];
  assert.deepEqual(wall.c, [0, 0, 100, 0]);
  assert.equal(wall.move, 20);
  assert.equal(wall.sight, 0);
  assert.equal(wall.door, 0);
});

test('subpixel wall fragments contract to a shared vertex without opening the contour', () => {
  const { bundle, images } = fixture();
  const points = [
    [0, 0],
    [1996.898, 995.25],
    [1996.655, 995.25],
    [0, 1000],
  ];
  bundle.scenes[0].geometry.barriers = points.map((p, i) => ({
    kind: 'wall',
    coordinates: [...p, ...points[(i + 1) % points.length]],
    blocks: { movement: true, sight: true, light: true, sound: true },
  }));
  const walls = prepareFoundryImport(bundle, images)[0].walls;
  assert.equal(walls.length, 3);
  walls.forEach((w, i) =>
    assert.deepEqual(w.c.slice(2), walls[(i + 1) % walls.length].c.slice(0, 2)),
  );
});

test('collapsed interactive openings still require a larger scale and identify the scene', () => {
  for (const kind of ['door', 'window']) {
    const { bundle, images } = fixture();
    bundle.scenes[0].geometry.barriers = [
      {
        kind,
        coordinates: [10.1, 10.1, 10.2, 10.2],
        blocks: { movement: true, sight: true, light: true, sound: true },
      },
    ];
    assert.throws(
      () => prepareFoundryImport(bundle, images),
      (error) =>
        error.message.includes(bundle.scenes[0].name) &&
        error.message.includes('Aumente a resolução'),
    );
  }
});
