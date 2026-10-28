import test from 'node:test';
import assert from 'node:assert/strict';
import { reliefGeometry } from '../src/blueprints/relief.js';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { pathInMode } from '../src/blueprints/project-mode.js';
for (const traceType of ['talus', 'cliff']) {
  test(traceType + ' preserves geometry through save/reopen and reverses the low side', () => {
    const e = {
      id: 'r',
      kind: 'trace',
      traceType,
      width: 4,
      rounded: true,
      side: 1,
      points: [
        { x: 5, y: 5 },
        { x: 30, y: 5 },
        { x: 30, y: 25 },
      ],
    };
    const restored = parseProject(
      JSON.stringify({ ...newProject(), mode: 'colony', elements: [e] }),
    ).elements[0];
    assert.deepEqual(restored, e);
    const a = reliefGeometry(e),
      b = reliefGeometry({ ...e, side: -1 });
    assert.deepEqual(a.center, b.center);
    assert.ok(a.fractures.length > 0 && a.fractures.length <= 600);
    for (let i = 0; i < a.fractures.length; i++) {
      const p = a.fractures[i][0],
        x = a.fractures[i].at(-1),
        y = b.fractures[i].at(-1);
      assert.ok(Math.abs(x.x + y.x - 2 * p.x) < 1e-8);
      assert.ok(Math.abs(x.y + y.y - 2 * p.y) < 1e-8);
      assert.ok(a.fractures[i].every((v) => Number.isFinite(v.x) && Number.isFinite(v.y)));
    }
    assert.equal(pathInMode({ mode: 'colony' }, traceType), true);
    assert.equal(pathInMode(newProject(), traceType), false);
  });
}
test('talus alternates hatch length and cliff uses articulated fractures', () => {
  const base = {
    width: 4,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  };
  const t = reliefGeometry({ ...base, traceType: 'talus' }).fractures;
  assert.equal(t[0].length, 2);
  assert.ok(t[0][1].y > t[1][1].y);
  assert.equal(reliefGeometry({ ...base, traceType: 'cliff' }).fractures[0].length, 4);
  assert.ok(
    reliefGeometry({
      ...base,
      width: 0.25,
      points: [
        { x: 0, y: 0 },
        { x: 2000, y: 2000 },
      ],
      traceType: 'cliff',
    }).fractures.length <= 600,
  );
});
