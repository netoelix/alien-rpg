import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { roadSidewalks } from '../src/blueprints/circulation.js';
import { traceGeometry } from '../src/blueprints/trace-geometry.js';
import { resizeElement, assetFits } from '../src/blueprints/resize.js';
const asset = {
  id: 'building',
  kind: 'asset',
  asset: 'colonyHabitat',
  x: -10,
  y: 35,
  w: 28,
  h: 20,
  rotation: 0,
};
test('large colonies and assets crossing all edges survive save, floors and resizing', () => {
  const p = parseProject(
    JSON.stringify({
      ...newProject(),
      mode: 'colony',
      width: 10000,
      height: 6000,
      elements: [asset, { ...asset, id: 'end', x: 9990, y: 5990 }],
    }),
  );
  assert.equal(p.width, 10000);
  assert.equal(p.elements[0].x, -10);
  assert.throws(() => parseProject(JSON.stringify({ ...p, mode: 'construction' })));
  assert.throws(() => parseProject(JSON.stringify({ ...p, width: 10001 })));
  assert.equal(assetFits(asset, p), true);
  assert.equal(resizeElement(asset, 'w', -5, 0, p).x, -15);
  assert.throws(() => parseProject(JSON.stringify({ ...newProject(), elements: [asset] })));
});
test('automatic sidewalks share exact smoothed road centers and track width changes', () => {
  const e = {
    id: 'road',
    kind: 'trace',
    traceType: 'road',
    sidewalkWidth: 2,
    width: 8,
    rounded: true,
    side: 1,
    points: [
      { x: 10, y: 10 },
      { x: 30, y: 10 },
      { x: 40, y: 30 },
    ],
  };
  const p = parseProject(JSON.stringify({ ...newProject(), elements: [e] }));
  assert.equal(p.elements[0].sidewalkWidth, 2);
  const [side] = roadSidewalks(p.elements);
  assert.equal(side.width, 12);
  assert.deepEqual(side.points, traceGeometry(e).center);
  assert.equal(roadSidewalks([{ ...e, width: 10 }])[0].width, 14);
  assert.equal(roadSidewalks([{ ...e, sidewalkWidth: 0 }]).length, 0);
  assert.throws(() =>
    parseProject(JSON.stringify({ ...newProject(), elements: [{ ...e, sidewalkWidth: -1 }] })),
  );
});
test('utility traces and new exterior objects save and reopen in both modes', () => {
  for (const mode of ['construction', 'colony']) {
    for (const traceType of ['pipe', 'cable', 'cableTray']) {
      const p = parseProject(
        JSON.stringify({
          ...newProject(),
          mode,
          elements: [
            {
              id: 't',
              kind: 'trace',
              traceType,
              width: 0.5,
              points: [
                { x: 1, y: 1 },
                { x: 15, y: 1 },
              ],
            },
          ],
        }),
      );
      assert.equal(p.elements[0].traceType, traceType);
    }
    for (const name of ['streetLamp', 'distributionTransformer', 'roundManhole', 'serviceManhole'])
      assert.equal(
        parseProject(
          JSON.stringify({
            ...newProject(),
            mode,
            elements: [{ ...asset, x: 1, y: 1, asset: name }],
          }),
        ).elements[0].asset,
        name,
      );
  }
});
