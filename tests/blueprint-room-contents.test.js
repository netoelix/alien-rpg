import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, moveRoomContents, doorPosition } from '../src/blueprints/model.js';
test('movimento conjunto inclui equipamentos internos e vínculos, preservando externos', () => {
  const p = {
    ...newProject(),
    elements: [
      { id: 'r', kind: 'room', x: 5, y: 5, w: 10, h: 10 },
      { id: 'a', kind: 'asset', asset: 'bed', x: 7, y: 7, w: 2, h: 2, rotation: 90 },
      { id: 'b', kind: 'asset', asset: 'bed', x: 14, y: 14, w: 2, h: 2, rotation: 0 },
      { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 1 },
    ],
  };
  const moved = moveRoomContents(p, 'r', 2, 3);
  assert.equal(moved.elements[0].x, 7);
  assert.equal(moved.elements[1].y, 10);
  assert.equal(moved.elements[2].x, 14);
  assert.equal(doorPosition(moved.elements[3], moved.elements).y, 8);
  assert.equal(p.elements[0].x, 5);
  assert.throws(() => moveRoomContents(p, 'r', -10, 0));
  p.layers.find((l) => l.id === 'equipment').locked = true;
  assert.throws(() => moveRoomContents(p, 'r', 2, 3), /desbloqueie/);
});

import { duplicateRoomContents, removeElement } from '../src/blueprints/model.js';
test('cópia do conjunto possui IDs e vínculos independentes', () => {
  const room = { id: 'r', kind: 'room', x: 5, y: 5, w: 10, h: 10 };
  const asset = { id: 'a', kind: 'asset', asset: 'bed', x: 7, y: 7, w: 2, h: 2, rotation: 0 };
  const door = {
    id: 'd',
    kind: 'door',
    openingType: 'window',
    wallId: 'r',
    segment: 0,
    t: 0.5,
    width: 1,
  };
  const original = { ...newProject(), elements: [room, asset, door] };
  const result = duplicateRoomContents(original, 'r', 15, 0);
  assert.equal(result.project.elements.length, 6);
  assert.equal(new Set(result.project.elements.map((e) => e.id)).size, 6);
  const copiedWindow = result.project.elements.find((e) => e.wallId === result.selectedId);
  assert.equal(copiedWindow.openingType, 'window');
  assert.equal(result.project.elements.find((e) => e.id === result.selectedId).x, 20);
  assert.equal(result.project.elements.filter((e) => e.kind === 'asset')[1].x, 22);
  assert.equal(
    removeElement(result.project, result.selectedId).elements.filter((e) => e.wallId === 'r')
      .length,
    1,
  );
  assert.equal(original.elements.length, 3);
  assert.throws(() => duplicateRoomContents(original, 'r', 0, 0));
  assert.throws(() => duplicateRoomContents(original, 'r', 2000, 0));
});

import { rotateRoomContents } from '../src/blueprints/model.js';
test('rotação de conjunto remapeia paredes, portas e equipamentos; quatro giros restauram o mapa', () => {
  const room = {
    id: 'r',
    kind: 'room',
    x: 10,
    y: 10,
    w: 12,
    h: 8,
    walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }],
  };
  const asset = { id: 'a', kind: 'asset', asset: 'bed', x: 12, y: 12, w: 2, h: 1, rotation: 0 };
  const door = { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 1 };
  const p = { ...newProject(), elements: [room, asset, door] };
  const rotated = rotateRoomContents(p, 'r');
  assert.equal(rotated.elements[0].w, 8);
  assert.equal(rotated.elements[0].walls[0].segment, 1);
  assert.equal(rotated.elements[2].segment, 1);
  assert.equal(rotated.elements[1].rotation, 90);
  assert.deepEqual(rotateRoomContents(rotated, 'r', -1), p);
  let four = p;
  for (let i = 0; i < 4; i++) four = rotateRoomContents(four, 'r');
  assert.deepEqual(four, p);
  assert.throws(() => rotateRoomContents(p, 'r', 2));
  p.layers.find((l) => l.id === 'doors').locked = true;
  assert.throws(() => rotateRoomContents(p, 'r'));
});

import { parseProject, setWallSection } from '../src/blueprints/model.js';
test('união de paredes persiste no arquivo e edição explícita restaura divisória', () => {
  const p = {
    ...newProject(),
    elements: [
      {
        id: 'r',
        kind: 'room',
        x: 5,
        y: 5,
        w: 10,
        h: 10,
        joinWalls: true,
        walls: [{ segment: 0, start: 0, end: 1, type: 'hull' }],
      },
    ],
  };
  assert.equal(parseProject(JSON.stringify(p)).elements[0].joinWalls, true);
  assert.equal(
    setWallSection(p, 'r', { segment: 0, start: 0, end: 1, type: 'internal' }).elements[0]
      .joinWalls,
    undefined,
  );
  assert.equal(p.elements[0].joinWalls, true);
});
