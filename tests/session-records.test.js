import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { missionRecords, createCampaignModel, validateCampaign } from '../data/schema.js';
const legacy = JSON.parse(
  await readFile(new URL('./fixtures/archive-v1.json', import.meta.url), 'utf8'),
).campaigns[0];
test('missões antigas mantêm exatamente o relato, data, equipe e índices anteriores', () => {
  const before = JSON.stringify(legacy);
  for (const mission of legacy.timelines) {
    const records = missionRecords(mission);
    assert.equal(records.length, 1);
    for (const field of ['mission', 'location', 'dateTime', 'esquad', 'descrition'])
      assert.equal(
        records[0][field],
        ['mission', 'location'].includes(field) ? mission[field] : mission.logs[0][field],
      );
    assert.equal(records[0].title, 'Relato oficial');
  }
  assert.equal(JSON.stringify(legacy), before);
});
test('registros de sessão têm títulos e datas próprios e associam personagens sem duplicar missões', () => {
  const campaign = structuredClone(legacy);
  const mission = campaign.timelines[0];
  const name = campaign.players[0].characters[0].characterName;
  mission.descrition = mission.logs[0].descrition;
  mission.logs = [
    {
      id: 'sessao-2',
      title: 'Fofoca',
      session: 'Sessão 2',
      dateTime: '2123',
      esquad: name,
      descrition: 'Outro relato.',
    },
  ];
  mission.logDateTime = '2122';
  const records = missionRecords(mission);
  assert.equal(records.length, 2);
  assert.equal(records[1].title, 'Fofoca');
  assert.equal(records[1].dateTime, '2123');
  assert.equal(records[0].dateTime, '2122');
  assert.equal(mission.dateTime, legacy.timelines[0].dateTime);
  assert.equal(campaign.timelines.length, 17);
  const model = createCampaignModel(campaign);
  assert(model.logMembers(mission).some((character) => character.characterName === name));
  assert(model.relatedTo(mission, model.characters[0]));
  assert.deepEqual(validateCampaign(campaign), []);
  mission.logs.push(structuredClone(mission.logs[0]));
  assert(validateCampaign(campaign).length > 0);
  mission.logs = [{ id: 'incompleto', title: '' }];
  assert(validateCampaign(campaign).length > 0);
});
