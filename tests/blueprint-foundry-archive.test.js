import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { addFloor } from '../src/blueprints/floors.js';
import { createFoundryArchive } from '../src/blueprints/foundry/archive.js';

const png = 'data:image/png;base64,iVBORw0KGgo=';
test('archive renders each floor snapshot sequentially with matching image and geometry scale', async () => {
  let p = newProject();
  p.elements = [{ id: 'a', kind: 'room', x: 1, y: 1, w: 3, h: 3 }];
  p = addFloor(p);
  p.elements = [{ id: 'b', kind: 'room', x: 2, y: 2, w: 3, h: 3 }];
  p.layers[0].visible = false;
  const before = JSON.stringify(p),
    snapshots = [],
    progress = [];
  const result = await createFoundryArchive(p, {
    pixelsPerMeter: 30,
    onProgress: (e) => progress.push(e),
    renderFloor: async (snapshot, width, height) => {
      snapshots.push(snapshot);
      assert.equal(width, p.width * 30);
      assert.equal(height, p.height * 30);
      assert.ok(snapshot.layers.every((l) => l.visible && l.opacity === 1));
      return png;
    },
  });
  assert.deepEqual(
    snapshots.map((s) => s.elements[0].id),
    ['a', 'b'],
  );
  assert.equal(result.images.length, 2);
  assert.equal(result.stage, 'image-package');
  assert.equal(result.scenes[0].elements, undefined);
  assert.equal(progress.at(-1).completed, 2);
  assert.equal(JSON.stringify(p), before);
});
test('oversized or incomplete projects fail before any image rendering', async () => {
  for (const mode of ['size', 'geometry']) {
    const p = newProject();
    let calls = 0;
    if (mode === 'size') p.width = 1000;
    else p.grid = 0.1;
    await assert.rejects(
      createFoundryArchive(p, {
        renderFloor: async () => {
          calls++;
          return png;
        },
      }),
    );
    assert.equal(calls, 0);
  }
});
test('renderer failure never returns a partial package', async () => {
  const p = addFloor(newProject());
  let calls = 0;
  await assert.rejects(
    createFoundryArchive(p, {
      pixelsPerMeter: 30,
      renderFloor: async () => (++calls === 1 ? png : 'data:,'),
    }),
    /PNG/,
  );
  assert.equal(calls, 2);
});
