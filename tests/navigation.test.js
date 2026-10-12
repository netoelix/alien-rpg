import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  campaignSystems,
  campaignTerritories,
  campaignRoute,
  routeSegments,
  officialSystems,
  officialTerritories,
  validateNavigation,
  positionInSector,
  positionFromSector,
  lightYearsPerParsec,
} from '../data/star-map.js';
import { positionFromReference, mapReference } from '../data/official-cartography.js';
import { screenPoint, worldPoint } from '../src/lib/draw-star-map.js';
import { createEditorStore } from '../scripts/editor-store.mjs';
import { normalizeArchive, validateArchive, newCampaign } from '../data/archive-schema.js';
import { modelsForArchive } from '../data/model.js';

const fixture = JSON.parse(
  await readFile(new URL('../data/archive.json', import.meta.url), 'utf8'),
);
const circle = {
  id: 'local-area',
  name: 'Área independente',
  kind: 'political',
  shape: 'circle',
  color: '#9657c4',
  x: 0,
  y: 0,
  radiusLy: 0.5,
};
const triangle = {
  id: 'local-contour',
  name: 'Contorno local',
  kind: 'geographic',
  shape: 'polygon',
  color: '#448866',
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
};

test('origem, orientação do mapa e quadrados negativos preservam coordenadas', () => {
  assert.deepEqual(positionFromReference(mapReference.originX, mapReference.originY), {
    x: 0,
    y: 0,
  });
  assert.deepEqual(positionFromReference(mapReference.originX + 166, mapReference.originY - 166), {
    x: 1,
    y: 1,
  });
  assert.deepEqual(positionInSector(-0.5, -1.9), { sectorX: -1, sectorY: -2, column: 5, row: 1 });
  assert.deepEqual(positionFromSector(-1, -2, 5, 1), { x: -0.5, y: -1.9 });
  const original = { x: -13.5, y: 8.3 };
  const center = { x: 2, y: -1 };
  const result = worldPoint(screenPoint(original, center, 128), center, 128);
  assert.ok(Math.abs(result.x - original.x) < 1e-9 && Math.abs(result.y - original.y) < 1e-9);
  assert.ok(Math.abs(0.5 / lightYearsPerParsec - 0.1533) < 0.0001);
});

test('catálogo oficial é imutável e possui IDs, nomes e referências distintos', () => {
  assert.equal(new Set(officialSystems.map((system) => system.id)).size, officialSystems.length);
  assert.equal(new Set(officialSystems.map((system) => system.name)).size, officialSystems.length);
  const proxima = officialSystems.find((system) => system.id === 'proxima-centauri');
  assert.deepEqual(proxima.installations, ['Jon Eve Station']);
  assert.throws(() => {
    proxima.name = 'Alterado';
  }, TypeError);
  assert.throws(() => proxima.installations.push('Inventada'), TypeError);
  assert.throws(() => {
    officialTerritories[0].points[0].x = 99;
  }, TypeError);
});

test('territórios e sistemas descobertos não vazam para outra campanha', () => {
  const campaign = {
    navigation: {
      systems: [
        { id: 'discovery', name: 'Descoberta', x: 1, y: 2, installations: ['Posto local'] },
      ],
      territories: [circle, triangle],
      hiddenTerritories: ['upp'],
    },
  };
  assert.deepEqual(validateNavigation(campaign), []);
  assert.equal(
    campaignTerritories(campaign).some((area) => area.id === 'upp'),
    false,
  );
  assert.equal(
    campaignTerritories({}).some((area) => area.id === 'upp'),
    true,
  );
  assert.equal(
    campaignTerritories({}).some((area) => area.id === circle.id),
    false,
  );
  assert.equal(
    campaignSystems({}).some((system) => system.id === 'discovery'),
    false,
  );
  assert.ok(
    validateNavigation({
      navigation: {
        systems: [{ id: 'other', name: "Barnard's Star", x: 1, y: 1, installations: [] }],
      },
    }).length,
  );
});

test('rotas identificadas mantêm retornos e interrompem linhas em locais sem posição', () => {
  const campaign = {
    timelines: [
      { location: 'Sol', dateTime: '1' },
      { location: 'Desconhecido', dateTime: '2' },
      { location: 'Proxima Centauri', dateTime: '3' },
      { location: 'SOL', dateTime: '4' },
    ],
  };
  const route = campaignRoute(campaign);
  assert.equal(route.length, 4);
  assert.equal(route[1].system, undefined);
  assert.equal(routeSegments(route).length, 1);
  assert.equal(routeSegments(route)[0].from.id, 'mission-2');
  assert.equal(route[0].system.id, route[3].system.id);
  assert.deepEqual(validateArchive(fixture), []);
});

test('rota manual respeita ordem definida, datas fictícias e sistema da própria campanha', () => {
  const campaign = {
    timelines: [{}],
    navigation: {
      systems: [],
      route: [
        {
          id: 'stop-1',
          systemId: 'proxima-centauri',
          arrival: '2122',
          departure: '2123',
          missionIndex: 0,
        },
        { id: 'stop-2', systemId: 'sol', arrival: '2120' },
        { id: 'stop-3', systemId: 'proxima-centauri', arrival: '2124' },
      ],
    },
  };
  assert.deepEqual(validateNavigation(campaign), []);
  assert.deepEqual(
    campaignRoute(campaign).map((stop) => stop.arrival),
    ['2122', '2120', '2124'],
  );
  assert.equal(routeSegments(campaignRoute(campaign)).length, 2);
  const bad = structuredClone(campaign);
  bad.navigation.route[0].systemId = 'system-in-another-campaign';
  assert.ok(validateNavigation(bad).length);
  bad.navigation.route[0].systemId = 'sol';
  bad.navigation.route[0].missionIndex = 9;
  assert.ok(validateNavigation(bad).length);
});

test('cartografia inválida é recusada antes de persistir', () => {
  for (const navigation of [
    null,
    [],
    { systems: null },
    { route: null },
    { territories: null },
    { hiddenTerritories: ['unknown'] },
    { territories: [{ ...circle, radiusLy: -1 }] },
    {
      territories: [
        {
          ...triangle,
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
          ],
        },
      ],
    },
    { territories: [{ ...circle, color: 'red' }] },
    { territories: [{ ...circle, official: true }] },
  ]) {
    assert.ok(validateNavigation({ navigation }).length);
  }
  const invalid = structuredClone(fixture);
  invalid.campaigns[0].navigation = { territories: [{ ...circle, radiusLy: 0 }] };
  assert.ok(validateArchive(invalid).some((error) => error.includes('Território')));
});

test('salvar, reabrir e montar a prévia preservam cartografia e o acervo anterior', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'alien-map-test-'));
  try {
    await mkdir(path.join(root, 'data'));
    await mkdir(path.join(root, 'public', 'assets'), { recursive: true });
    const assets = await readdir(new URL('../public/assets/', import.meta.url));
    await Promise.all(
      assets.map((asset) => writeFile(path.join(root, 'public', 'assets', asset), 'fixture')),
    );
    const original = JSON.stringify(fixture);
    await writeFile(path.join(root, 'data', 'archive.json'), original);
    const store = createEditorStore(root);
    const loaded = await store.load();
    const archive = normalizeArchive(loaded.archive);
    const campaign = newCampaign('Cartografia teste');
    campaign.navigation = {
      systems: [
        { id: 'discovery', name: 'Descoberta', x: -1.5, y: 2.3, installations: ['Posto A'] },
      ],
      territories: [circle, triangle],
      hiddenTerritories: ['upp'],
      route: [
        {
          id: 'stop-1',
          systemId: 'discovery',
          arrival: '2120',
          departure: '2121',
          missionIndex: null,
        },
      ],
    };
    archive.campaigns.push(campaign);
    assert.deepEqual(validateArchive(archive), []);
    await store.save(archive, loaded.revision);
    const reopened = await store.load();
    const models = modelsForArchive(normalizeArchive(reopened.archive));
    const restored = models.find((model) => model.campaign.id === campaign.id).campaign;
    assert.deepEqual(restored.navigation, campaign.navigation);
    assert.equal(
      campaignSystems(models[0].campaign).some((system) => system.id === 'discovery'),
      false,
    );
    const backups = await readdir(path.join(root, '.editor-backups'));
    assert.equal(await readFile(path.join(root, '.editor-backups', backups[0]), 'utf8'), original);
    assert.deepEqual(restored.players, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
