import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createCampaignModel, validateCampaign } from '../data/schema.js';

const data = JSON.parse(await readFile(new URL('../data/fragmentos-da-guerra.json', import.meta.url), 'utf8'));
const model = createCampaignModel(data);
test('o catálogo migrado conserva jogadores, personagens e registros', () => {
  assert.equal(data.players.length, 5);
  assert.equal(model.characters.length, 7);
  assert.equal(data.timelines.length, 17);
  assert.equal(data.achievements.length, 113);
  assert.deepEqual(validateCampaign(data), []);
});
test('a data pertence ao jogador mesmo quando as concessões mudam de ordem', () => {
  const award = data.achievements.find(item => item.id === 'stress_01');
  const shuffled = { ...award, character: [...award.character].reverse() };
  assert.equal(model.awardDate(shuffled, 3), '17/08/2024');
  assert.equal(model.awardDate(shuffled, 0), '16/06/2024');
  const bruno = data.achievements.find(item => item.id === 'stress_03');
  assert.equal(model.awardDate(bruno, 2), '06/10/2024');
  const fernando = data.achievements.find(item => item.id === 'other_group_08');
  assert.equal(model.awardDate(fernando, 1), '24/08/2025');
});
test('validação rejeita IDs repetidos, datas inválidas e jogadores desconhecidos', () => {
  const invalid = structuredClone(data);
  invalid.achievements.push(structuredClone(invalid.achievements[0]));
  invalid.achievements[0].character[0] = { name: 'Desconhecido', date: '31/02/2025' };
  const errors = validateCampaign(invalid);
  assert(errors.some(error => error.includes('repetido')));
  assert(errors.some(error => error.includes('desconhecido')));
  assert(errors.some(error => error.includes('inexistente')));
});
test('todos os retratos e medalhas referenciados existem', async () => {
  const assets = [...data.players.flatMap(player => player.characters.map(character => character.images)), ...data.achievements.map(item => item.medal)];
  await Promise.all(assets.map(asset => access(new URL('../' + asset, import.meta.url))));
});
test('logs distinguem menção de participação registrada no esquadrão', () => {
  const minsk = model.characters[6];
  const log = data.timelines.find(item => item.descrition.includes('Minsk'));
  assert(model.relatedTo(log, minsk));
  assert(!model.logMembers(log).some(character => character.id === minsk.id));
});
