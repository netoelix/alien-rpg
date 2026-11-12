import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { addFloor, switchFloor } from '../src/blueprints/floors.js';
import { floorList, activeFloor } from '../src/blueprints/floor-store.js';
import { addConnections } from '../src/blueprints/connections.js';
import { connectVentFloor } from '../src/blueprints/vent-links.js';
import { buildFoundryPackage, resolveAccessFlags } from '../src/blueprints/foundry/package.js';

test('portable elevator export keeps all three destinations and active floor snapshots', () => {
  let p = addFloor(addFloor(newProject()));
  const ids = floorList(p).map((f) => f.id);
  p = addConnections(
    p,
    ids.filter((id) => id !== activeFloor(p)),
    'elevator',
    4,
    5,
  );
  const before = JSON.stringify(p),
    bundle = buildFoundryPackage(p, { pixelsPerMeter: 50 });
  assert.equal(JSON.stringify(p), before);
  assert.equal(bundle.scenes.length, 3);
  assert.equal(bundle.accesses.length, 3);
  for (const access of bundle.accesses) {
    assert.equal(access.targets.length, 2);
    assert.deepEqual(access.center, { x: 250, y: 300 });
  }
  const switched = buildFoundryPackage(switchFloor(p, ids[0]), { pixelsPerMeter: 50 });
  assert.deepEqual(switched, bundle);
  const map = new Map(bundle.accesses.map((a, i) => [a.key, `Scene.scene${i}.Region.region${i}`]));
  const flags = resolveAccessFlags(bundle, map);
  for (const f of flags) {
    const cfg = f.flags['alien-suite-mae'].access;
    assert.equal(cfg.auto, true);
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.targets.length, 2);
    assert.ok(!cfg.targets.includes(f.uuid));
  }
  map.delete(bundle.accesses[0].key);
  assert.throws(() => resolveAccessFlags(bundle, map), /ausente/);
});
test('ventilation endpoints resolve to the exact port rather than the duct midpoint', () => {
  let p = addFloor(newProject());
  p.elements = [
    {
      id: 'vent',
      kind: 'vent',
      width: 1,
      points: [
        { x: 2, y: 5 },
        { x: 10, y: 5 },
      ],
      ports: [{ id: 'port', segment: 0, t: 0.25, type: 'floor', side: 1, label: 'Manutenção' }],
    },
  ];
  p = connectVentFloor(
    p,
    { floorId: activeFloor(p), elementId: 'vent', portId: 'port' },
    floorList(p)[0].id,
  );
  const b = buildFoundryPackage(p);
  const ports = b.accesses.filter((a) =>
    p.ventLinks.some((link) =>
      [link.from, link.to].some(
        (e) =>
          e.floorId === a.source.floorId &&
          e.elementId === a.source.elementId &&
          e.portId === a.source.portId,
      ),
    ),
  );
  assert.equal(ports.length, 2);
  for (const a of ports) {
    assert.deepEqual(a.center, { x: 400, y: 500 });
    assert.equal(b.scenes.find((s) => s.key === a.sceneKey).kind, 'ventilation');
  }
  assert.ok(b.warnings.some((w) => w.includes('dutos')));
});
test('legacy one-floor projects export without invented links and invalid scale is rejected', () => {
  const p = newProject();
  const b = buildFoundryPackage(p);
  assert.equal(b.scenes.length, 1);
  assert.deepEqual(b.accesses, []);
  assert.throws(() => buildFoundryPackage(p, { pixelsPerMeter: NaN }), /Escala/);
});

test('scene names include the project and floor, including ventilation networks', () => {
  const p = newProject();
  p.name = 'Cassino';
  p.floors = floorList(p).map((f) => ({ ...f, name: 'Térreo' }));
  p.elements = [
    {
      id: 'v',
      kind: 'vent',
      width: 1,
      points: [
        { x: 2, y: 2 },
        { x: 8, y: 2 },
      ],
    },
  ];
  const b = buildFoundryPackage(p);
  assert.deepEqual(
    b.scenes.map((s) => s.name),
    ['Cassino - Térreo', 'Cassino - Térreo - Ventilação 1'],
  );
  assert.equal(p.floors[0].name, 'Térreo');
});
