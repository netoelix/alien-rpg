import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newProject,
  parseProject,
  wallSegments,
  doorPosition,
  openingHasWall,
  setWallArc,
  rotateRoomContents,
} from '../src/blueprints/model.js';
import { rotateGroup, freeRotationFrame } from '../src/blueprints/groups.js';
import { rotatePoint } from '../src/blueprints/orientation.js';
import { resizeElement } from '../src/blueprints/resize.js';
import { copyBlueprint, pasteBlueprint } from '../src/blueprints/clipboard.js';
import { openingGeometry } from '../src/blueprints/wall-geometry.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const fixture = (kind) => ({
  ...newProject(),
  width: 100,
  height: 100,
  elements: [
    {
      id: 'room',
      kind,
      x: 30,
      y: 30,
      w: 16,
      h: 10,
      walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }],
    },
    {
      id: 'door',
      kind: 'door',
      wallId: 'room',
      segment: 0,
      t: 0.5,
      width: 1,
      openingType: 'window',
    },
    { id: 'asset', kind: 'asset', asset: 'console', x: 36, y: 34, w: 2, h: 2, rotation: 0 },
  ],
});
for (const kind of ['room', 'ellipse']) {
  test(`${kind}: giro livre conserva tipo, medidas, paredes e abertura no arquivo`, () => {
    const p = fixture(kind),
      old = doorPosition(p.elements[1], p.elements);
    const turned = rotateGroup(p, ['room', 'asset'], 1, 37);
    const room = turned.elements[0];
    assert.equal(room.kind, kind);
    assert.equal(room.rotation, 37);
    assert.equal(room.w, 16);
    assert.equal(room.h, 10);
    assert.deepEqual(room.walls, p.elements[0].walls);
    const expected = rotatePoint({ ...p.elements[0], rotation: 37 }, old.x, old.y);
    const anchor = doorPosition(turned.elements[1], turned.elements);
    near(anchor.x, expected.x);
    near(anchor.y, expected.y);
    assert.ok(openingHasWall(turned.elements[1], turned.elements));
    assert.equal(openingGeometry(turned.elements[1], turned.elements).depth, 0.7);
    const reopened = parseProject(JSON.stringify(turned));
    assert.deepEqual(wallSegments(reopened.elements[0]), wallSegments(room));
    assert.equal(reopened.elements[1].openingType, 'window');
    assert.ok(freeRotationFrame(reopened, ['room', 'asset']));
    const restored = rotateGroup(turned, ['room', 'asset'], 1, -37);
    near(restored.elements[0].x, p.elements[0].x);
    near(restored.elements[0].y, p.elements[0].y);
    assert.equal(restored.elements[0].rotation, 0);
  });
  test(`${kind}: alça acompanha orientação e conserva a borda oposta`, () => {
    const e = { ...fixture(kind).elements[0], rotation: 37 };
    const a = (37 * Math.PI) / 180;
    const next = resizeElement(
      e,
      'se',
      4 * Math.cos(a) - 2 * Math.sin(a),
      4 * Math.sin(a) + 2 * Math.cos(a),
      { width: 100, height: 100 },
    );
    near(next.w, 20);
    near(next.h, 12);
    const before = rotatePoint(e, e.x, e.y),
      after = rotatePoint(next, next.x, next.y);
    near(before.x, after.x);
    near(before.y, after.y);
    const proportional = resizeElement(e, 'se', 4, 2, { width: 100, height: 100 }, true);
    near(proportional.w / proportional.h, e.w / e.h);
  });
}
test('sala girada copia equipamentos internos e conserva orientação nas duplicatas', () => {
  const turned = rotateGroup(fixture('room'), ['room', 'asset'], 1, 45);
  const copied = copyBlueprint(turned, 'room');
  assert.equal(copied.elements.length, 3);
  const pasted = pasteBlueprint(turned, copied, 25, 0);
  const room = pasted.project.elements.find((e) => e.id === pasted.selectedId);
  assert.equal(room.rotation, 45);
  assert.equal(pasted.project.elements.filter((e) => e.kind === 'door').length, 2);
  assert.doesNotThrow(() => rotateRoomContents(turned, 'room'));
});
test('oval girada aceita edição de arco e limites rejeitam importação inválida', () => {
  const p = rotateGroup(fixture('ellipse'), ['room'], 1, 25);
  const changed = setWallArc(p, 'room', 90, 180, 'glass');
  assert.equal(changed.elements[0].rotation, 25);
  const invalid = fixture('room');
  invalid.elements[0] = { ...invalid.elements[0], x: 0, y: 0, rotation: 45 };
  assert.throws(() => parseProject(JSON.stringify(invalid)), /ultrapassa/);
});
