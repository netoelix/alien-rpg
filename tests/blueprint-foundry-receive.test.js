import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFoundryArchive, receiveFoundryArchive } from '../src/blueprints/foundry/receive.js';
import { createFoundryRuntime } from '../src/blueprints/foundry/runtime.js';

// Real 1x1 PNG; scene uses a 20px grid but may be smaller than one grid square.
const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
function bundle() {
  return {
    format: 'alien-blueprint-foundry',
    version: 1,
    stage: 'image-package',
    accesses: [],
    scenes: [
      {
        key: 'one',
        name: 'Floor',
        width: 1,
        height: 1,
        grid: { size: 20, distance: 1 },
        geometry: { ready: true, barriers: [] },
      },
    ],
    images: [{ sceneKey: 'one', path: '../../overwrite.png', width: 1, height: 1, data: png }],
  };
}
function fake() {
  const events = [];
  const runtime = {
    isGM: true,
    generation: 14,
    accessEnabled: true,
    async decodeImage() {
      events.push('decode');
      return { width: 1, height: 1 };
    },
    async createImportDirectory() {
      events.push('directory');
      return 'worlds/test/blueprint-unique';
    },
    async uploadImage(directory, name) {
      events.push(name);
      return `${directory}/${name}`;
    },
    async createScene() {
      events.push('scene');
      return {
        levels: { contents: [{ id: 'level' }] },
        async createEmbeddedDocuments(type) {
          events.push(type);
          return [{ id: 'level' }];
        },
        async update() {},
        async delete() {
          events.push('delete');
        },
      };
    },
  };
  return { runtime, events };
}
test('receiver decodes before uploading and ignores embedded file paths', async () => {
  const { runtime, events } = fake();
  const result = await receiveFoundryArchive(JSON.stringify(bundle()), runtime);
  assert.deepEqual(events, ['decode', 'directory', 'floor-1.png', 'scene', 'Wall']);
  assert.equal(result.scenes.length, 1);
});
test('receiver rejects mismatched or duplicate images, external URLs and bad PNG headers', () => {
  for (const damage of [
    (b) => {
      b.images[0].width = 2;
    },
    (b) => {
      b.images.push(b.images[0]);
    },
    (b) => {
      b.images[0].data = 'https://example.com/map.png';
    },
    (b) => {
      b.images[0].data = 'data:image/png;base64,YWJj';
    },
    (b) => {
      b.scenes[0].width = b.images[0].width = 2;
    },
  ]) {
    const b = bundle();
    damage(b);
    assert.throws(() => parseFoundryArchive(JSON.stringify(b)));
  }
});
test('failed PNG decode does not create a folder, upload or create scenes', async () => {
  const { runtime, events } = fake();
  runtime.decodeImage = async () => {
    throw Error('corrupt image');
  };
  await assert.rejects(receiveFoundryArchive(JSON.stringify(bundle()), runtime), /corrupt/);
  assert.deepEqual(events, []);
});
test('failed upload never creates scenes and reports the isolated directory', async () => {
  const { runtime, events } = fake();
  runtime.uploadImage = async () => false;
  await assert.rejects(
    receiveFoundryArchive(JSON.stringify(bundle()), runtime),
    /worlds\/test\/blueprint-unique/,
  );
  assert.deepEqual(events, ['decode', 'directory']);
});
test('non-GM receiver has no side effects', async () => {
  const { runtime, events } = fake();
  runtime.isGM = false;
  await assert.rejects(receiveFoundryArchive(JSON.stringify(bundle()), runtime), /mestre/);
  assert.deepEqual(events, []);
});
test('Foundry adapter closes decoded bitmaps and uses the installed FilePicker upload signature', async () => {
  const calls = [];
  const runtime = createFoundryRuntime(
    {
      game: {
        user: { isGM: true },
        release: { generation: 14 },
        world: { id: 'test' },
        modules: new Map(),
        settings: {
          get() {
            throw Error('must not query missing module');
          },
        },
      },
      CONFIG: {
        ux: {
          FilePicker: {
            async createDirectory(...args) {
              calls.push(args);
            },
            async upload(...args) {
              calls.push(args);
              return { path: 'stored.png' };
            },
          },
        },
      },
      foundry: { utils: { randomID: () => 'unique' } },
      Scene: { create: async () => {} },
    },
    {
      File,
      async createImageBitmap() {
        return {
          width: 1,
          height: 1,
          close() {
            calls.push('close');
          },
        };
      },
    },
  );
  assert.equal(runtime.accessEnabled, false);
  assert.deepEqual(await runtime.decodeImage(new Blob()), { width: 1, height: 1 });
  const directory = await runtime.createImportDirectory();
  assert.equal(await runtime.uploadImage(directory, 'floor-1.png', new Blob()), 'stored.png');
  assert.equal(calls[0], 'close');
  assert.deepEqual(calls[1], ['data', 'worlds/test/blueprint-unique']);
  assert.equal(calls[2][2].name, 'floor-1.png');
  assert.deepEqual(calls[2][4], { notify: false });
});
