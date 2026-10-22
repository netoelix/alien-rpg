import test from 'node:test';
import assert from 'node:assert/strict';
import { resizeElement } from '../src/blueprints/resize.js';
import { fitOpenings, newProject, parseProject } from '../src/blueprints/model.js';

const room = { id: 'room', kind: 'room', x: 10, y: 10, w: 10, h: 8 };
const bounds = { width: 40, height: 40 };

test('alças laterais preservam eixo perpendicular e borda oposta', () => {
  assert.deepEqual(resizeElement(room, 'w', -3, 7, bounds), { ...room, x: 7, w: 13 });
  assert.deepEqual(resizeElement(room, 'e', 3, 7, bounds), { ...room, w: 13 });
  assert.deepEqual(resizeElement(room, 'n', 7, -3, bounds), { ...room, y: 7, h: 11 });
  assert.deepEqual(resizeElement(room, 's', 7, 3, bounds), { ...room, h: 11 });
});

test('quatro cantos redimensionam sem deslocar o canto oposto', () => {
  for (const handle of ['nw', 'ne', 'sw', 'se']) {
    const next = resizeElement(room, handle, 2, 3, bounds);
    assert.equal(handle.includes('w') ? next.x + next.w : next.x, handle.includes('w') ? 20 : 10);
    assert.equal(handle.includes('n') ? next.y + next.h : next.y, handle.includes('n') ? 18 : 10);
    assert.equal(next.w, handle.includes('w') ? 8 : 12);
    assert.equal(next.h, handle.includes('n') ? 5 : 11);
  }
});

test('arraste limita tamanho mínimo e bordas do projeto sem inverter a peça', () => {
  const small = resizeElement(room, 'nw', 100, 100, bounds);
  assert.equal(small.w, 0.25);
  assert.equal(small.h, 0.25);
  assert.equal(small.x + small.w, 20);
  assert.equal(resizeElement(room, 'nw', -100, -100, bounds).x, 0);
  const large = resizeElement(room, 'se', 100, 100, bounds);
  assert.equal(large.x + large.w, 40);
  assert.equal(large.y + large.h, 40);
});

test('redimensionar sala preserva equipamento e vínculos de abertura ao salvar', () => {
  const asset = {
    id: 'asset',
    kind: 'asset',
    asset: 'console',
    x: 12,
    y: 12,
    w: 2,
    h: 1,
    rotation: 0,
  };
  const door = { id: 'door', kind: 'door', wallId: 'room', segment: 0, t: 0.5, width: 1 };
  const project = { ...newProject(), elements: [room, asset, door] };
  const resized = {
    ...project,
    elements: project.elements.map((e) =>
      e.id === room.id ? resizeElement(e, 'nw', -2, -2, project) : e,
    ),
  };
  const saved = parseProject(JSON.stringify(fitOpenings(resized)));
  const equipment = saved.elements.find((e) => e.id === 'asset');
  for (const key of ['x', 'y', 'w', 'h', 'rotation']) assert.equal(equipment[key], asset[key]);
  assert.equal(saved.elements.find((e) => e.id === 'door').wallId, 'room');
  assert.equal(room.x, 10);
});

test('equipamento girado redimensiona no eixo local mantendo a borda oposta fixa', () => {
  const asset = { ...room, kind: 'asset', rotation: 90 };
  const next = resizeElement(asset, 'e', 0, 4, bounds);
  assert.equal(next.w, 14);
  assert.equal(next.h, 8);
  assert.equal(next.y + next.h / 2 - next.w / 2, asset.y + asset.h / 2 - asset.w / 2);
  assert.equal(next.x + next.w / 2, asset.x + asset.w / 2);
});

test('rotação livre mantém centro, medidas e recusa ultrapassar limites', async () => {
  const { rotateAsset } = await import('../src/blueprints/resize.js');
  const asset = { ...room, kind: 'asset', rotation: 0 };
  const next = rotateAsset(asset, { x: 15, y: 4 }, { x: 25, y: 14 }, bounds);
  assert.equal(next.rotation, 90);
  for (const key of ['x', 'y', 'w', 'h']) assert.equal(next[key], asset[key]);
  const edge = { ...asset, x: 0, y: 0, w: 10, h: 2 };
  assert.deepEqual(rotateAsset(edge, { x: 5, y: -2 }, { x: 8, y: 1 }, bounds), edge);
});

test('rotação com Shift encaixa em 15 graus e normaliza passagem pelo zero', async () => {
  const { rotateAsset } = await import('../src/blueprints/resize.js');
  const asset = { ...room, kind: 'asset', rotation: 350 };
  const point = (angle) => ({
    x: 15 + 5 * Math.cos((angle * Math.PI) / 180),
    y: 14 + 5 * Math.sin((angle * Math.PI) / 180),
  });
  assert.equal(rotateAsset(asset, point(0), point(20), bounds, 15).rotation, 15);
  assert.equal(rotateAsset(asset, point(0), point(20), bounds).rotation, 10);
  assert.equal(rotateAsset(asset, point(0), point(-20), bounds, 15).rotation, 330);
});

test('Shift preserva proporção e canto oposto nos quatro cantos, inclusive girados', () => {
  const corner = (e, sx, sy) => {
    const a = ((e.rotation || 0) * Math.PI) / 180;
    return [
      e.x + e.w / 2 + ((sx * e.w) / 2) * Math.cos(a) - ((sy * e.h) / 2) * Math.sin(a),
      e.y + e.h / 2 + ((sx * e.w) / 2) * Math.sin(a) + ((sy * e.h) / 2) * Math.cos(a),
    ];
  };
  for (const rotation of [0, 35, 90, 270]) {
    for (const handle of ['nw', 'ne', 'sw', 'se']) {
      const asset = { ...room, kind: 'asset', rotation };
      const next = resizeElement(asset, handle, 2, 3, bounds, true);
      assert.ok(Math.abs(next.w / next.h - asset.w / asset.h) < 1e-10);
      const sx = handle.includes('w') ? 1 : -1,
        sy = handle.includes('n') ? 1 : -1;
      const before = corner(asset, sx, sy),
        after = corner(next, sx, sy);
      before.forEach((v, i) => assert.ok(Math.abs(v - after[i]) < 1e-10));
    }
  }
});

test('escala proporcional respeita mínimo e limite sem deformar; lateral ignora Shift', () => {
  const large = resizeElement(room, 'se', 1000, 1000, bounds, true);
  assert.ok(large.x + large.w <= bounds.width);
  assert.ok(large.y + large.h <= bounds.height);
  assert.ok(Math.abs(large.w / large.h - room.w / room.h) < 1e-10);
  assert.ok(large.w > room.w);
  const small = resizeElement(room, 'se', -1000, -1000, bounds, true);
  assert.ok(small.w >= 0.25 && small.h >= 0.25);
  assert.equal(small.w / small.h, room.w / room.h);
  assert.deepEqual(
    resizeElement(room, 'e', 2, 3, bounds, true),
    resizeElement(room, 'e', 2, 3, bounds),
  );
});
