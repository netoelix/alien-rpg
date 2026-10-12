import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignSystems, validateNavigation, officialSystems } from '../data/star-map.js';

test('sistemas descobertos ficam restritos à campanha', () => {
  const system = {
    id: 'discovery',
    name: 'Descoberta',
    x: -1.5,
    y: 2.3,
    installations: ['Posto A'],
  };
  const campaign = { navigation: { systems: [system] } };
  assert.deepEqual(validateNavigation(campaign), []);
  assert.equal(campaignSystems(campaign).length, officialSystems.length + 1);
  assert.equal(campaignSystems({}).length, officialSystems.length);
  assert.equal(campaignSystems({})[0].name, 'Sol');
});

test('cadastros não podem sobrescrever sistemas oficiais ou usar coordenadas inválidas', () => {
  for (const system of [
    { id: 'sol', name: 'Outro', x: 0, y: 0, installations: [] },
    { id: 'other', name: 'Sol', x: 0, y: 0, installations: [] },
    { id: 'other', name: 'Outro', x: Infinity, y: 0, installations: [] },
  ])
    assert.ok(validateNavigation({ navigation: { systems: [system] } }).length);
});
