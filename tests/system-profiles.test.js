import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeArchive, validateArchive, newCampaign } from '../data/archive-schema.js';
import { publicArchive } from '../data/public-archive.js';
import { modelsForArchive } from '../data/model.js';
import { officialSystems, campaignSystems, validateSystemProfiles } from '../data/star-map.js';
import { consultationLocations, validateLocations } from '../data/system-profiles.js';
const fixture = normalizeArchive(
  JSON.parse(await readFile(new URL('./fixtures/archive-v1.json', import.meta.url))),
);
const extraCampaign = newCampaign('Fronteira Esquecida');
extraCampaign.navigation = {
  systems: [
    { id: 'existing-system', name: 'NN39456', x: 3.1, y: -15.8, installations: ['PROSPECT'] },
  ],
};
fixture.campaigns.push(extraCampaign);
const location = {
  id: 'place-one',
  name: 'PROSPECT',
  type: 'Instalação colonial',
  population: 'Desconhecida',
  installations: 'Mineração',
  atmosphere: '',
  terrain: 'Rocha',
};

test('fichas importadas têm vínculos válidos e distinguem os dois sistemas Zeta Reticuli', () => {
  const imported = officialSystems.flatMap((s) => s.locations);
  assert.equal(imported.length, 43);
  assert.deepEqual(validateLocations(imported), []);
  assert.deepEqual(
    officialSystems.find((s) => s.id === 'zeta-1-reticuli').locations.map((p) => p.name),
    ['KG-348'],
  );
  assert.deepEqual(
    officialSystems.find((s) => s.id === 'zeta-2-reticuli').locations.map((p) => p.name),
    ['Calpamos', 'LV-223', 'LV-426'],
  );
  assert.equal(officialSystems.find((s) => s.id === 'gl408').locations.length, 0);
  assert.equal(officialSystems.find((s) => s.id === 'koi-2770').locations[0].population, '');
  assert.equal(officialSystems.find((s) => s.id === 'gj1187').locations[0].population, '');
});

test('cadastros existentes sem ficha continuam válidos e não são alterados pela consulta', () => {
  const before = JSON.stringify(fixture);
  assert.deepEqual(validateArchive(fixture), []);
  for (const model of modelsForArchive(fixture)) campaignSystems(model.campaign);
  assert.equal(JSON.stringify(fixture), before);
  const system = fixture.campaigns
    .find((c) => c.title === 'Fronteira Esquecida')
    ?.navigation.systems.find((s) => s.name === 'NN39456');
  assert.ok(system);
  assert.equal(system.locations, undefined);
  assert.equal(system.x, 3.1);
  assert.equal(system.y, -15.8);
});

test('fichas globais aparecem em todas as campanhas; fichas próprias ficam somente na campanha de origem', () => {
  const archive = structuredClone(fixture);
  archive.systemProfiles = { sol: [location] };
  archive.campaigns[0].navigation.systems[0].locations = [{ ...location, name: 'Local exclusivo' }];
  const models = modelsForArchive(archive);
  for (const model of models)
    assert.equal(
      campaignSystems(model.campaign).find((s) => s.id === 'sol').locations[0].name,
      'PROSPECT',
    );
  assert.equal(
    campaignSystems(models[1].campaign).some((s) =>
      s.locations?.some((p) => p.name === 'Local exclusivo'),
    ),
    false,
  );
  assert.deepEqual(validateArchive(archive), []);
});

test('publicação e reabertura preservam fichas globais e próprias, descartando campos não públicos', () => {
  const archive = structuredClone(fixture);
  const entry = { ...location, privateNotes: 'not-public' };
  archive.systemProfiles = { sol: [entry] };
  archive.campaigns[1].navigation.systems[0].locations = [entry];
  const published = publicArchive(archive);
  assert.equal(JSON.stringify(published).includes('not-public'), false);
  const reopened = normalizeArchive(JSON.parse(JSON.stringify(published)));
  assert.deepEqual(reopened.systemProfiles.sol, [location]);
  assert.deepEqual(reopened.campaigns[1].navigation.systems[0].locations, [location]);
  assert.deepEqual(validateArchive(reopened), []);
});

test('validação recusa fichas malformadas, IDs repetidos e sistemas oficiais inexistentes', () => {
  assert.ok(validateLocations([{ ...location, population: 120 }]).length);
  assert.ok(validateLocations([location, location]).length);
  assert.ok(validateLocations([{ ...location, name: ' ' }]).length);
  assert.ok(validateLocations(null).length);
  assert.ok(validateSystemProfiles({ unknown: [location] }).length);
  assert.ok(validateSystemProfiles({ sol: null }).length);
  assert.deepEqual(validateLocations([{ id: 'minimal', name: 'Local' }]), []);
  assert.deepEqual(validateLocations([{ ...location, population: '0' }]), []);
});

test('lista global vazia remove fichas sem restaurar defaults ou alterar a cartografia', () => {
  const archive = structuredClone(fixture);
  archive.systemProfiles = { 'zeta-2-reticuli': [] };
  const system = campaignSystems(modelsForArchive(archive)[0].campaign).find(
    (s) => s.id === 'zeta-2-reticuli',
  );
  const original = officialSystems.find((s) => s.id === system.id);
  assert.deepEqual(system.locations, []);
  assert.deepEqual(system.installations, original.installations);
  assert.equal(system.x, original.x);
  assert.equal(system.y, original.y);
});

test('consulta reúne fichas e instalações antigas sem repetir locais nem alterar o cadastro', () => {
  const zeta = officialSystems.find((system) => system.id === 'zeta-2-reticuli');
  const before = JSON.stringify(zeta);
  const cards = consultationLocations(zeta.locations, zeta.installations);
  assert.deepEqual(
    cards.map((card) => card.name),
    ['Calpamos', 'LV-223', 'LV-426', 'Kathar Station'],
  );
  assert.equal(JSON.stringify(zeta), before);
  const gl609 = officialSystems.find((system) => system.id === 'gl609');
  assert.deepEqual(
    consultationLocations(gl609.locations, gl609.installations).map((card) => card.name),
    ['LV-7324'],
  );
  assert.equal(
    consultationLocations([{ id: 'custom', name: 'LV-7324', population: '0' }], ['LV-7324']).length,
    1,
  );
  assert.equal(consultationLocations([], ['PROSPECT', 'Prospect', '']).length, 1);
  assert.equal(consultationLocations([{ id: 'one', name: 'LV-42' }], ['LV-426']).length, 2);
});
