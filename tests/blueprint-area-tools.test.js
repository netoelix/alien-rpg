import test from 'node:test';
import assert from 'node:assert/strict';
import { areaElement } from '../src/blueprints/area-tools.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
test('áreas reutilizam formas sem criar paredes em piso ou água e sobrevivem ao arquivo', () => {
  for (const kind of ['room', 'ellipse', 'polygon'])
    for (const purpose of ['room', 'floor', 'pool', 'lake']) {
      const source =
        kind === 'polygon'
          ? {
              id: 'area',
              kind,
              points: [
                { x: 2, y: 2 },
                { x: 8, y: 2 },
                { x: 8, y: 8 },
                { x: 2, y: 8 },
              ],
            }
          : { id: 'area', kind, x: 2, y: 2, w: 6, h: 6 };
      const result = areaElement(source, purpose, { type: 'plates', size: 1, opacity: 0.3 });
      if (purpose === 'room') assert.strictEqual(result, source);
      else {
        assert.equal(result.kind, 'floorRegion');
        assert.equal(result.walls, undefined);
        assert.equal(result.floorFinish.type, purpose === 'floor' ? 'plates' : purpose);
      }
      const saved = parseProject(JSON.stringify({ ...newProject(), elements: [result] }));
      assert.equal(saved.elements[0].kind, result.kind);
    }
  const asset = { id: 'a', kind: 'asset' };
  assert.strictEqual(areaElement(asset, 'pool', {}), asset);
});
