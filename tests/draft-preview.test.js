import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  normalizeArchive,
  newCampaign,
  campaignAchievements,
  validateArchive,
} from '../data/archive-schema.js';
import { createDraftPreview, readDraftPreview } from '../src/lib/draft-preview.js';
const legacy = JSON.parse(
  await readFile(new URL('./fixtures/archive-v1.json', import.meta.url), 'utf8'),
);
test('catálogo universal preserva definições e concessões antigas, sem concedê-las a uma campanha nova', () => {
  const archive = normalizeArchive(legacy);
  assert.equal(archive.achievements.length, 113);
  assert.deepEqual(
    campaignAchievements(archive, archive.campaigns[0]),
    legacy.campaigns[0].achievements,
  );
  const campaign = newCampaign('Nova campanha');
  archive.campaigns.push(campaign);
  assert.equal(campaignAchievements(archive, campaign).length, 113);
  assert(campaignAchievements(archive, campaign).every((item) => item.character.length === 0));
  archive.achievements[0].description = 'Regra universal atualizada';
  assert.equal(
    campaignAchievements(archive, campaign)[0].description,
    'Regra universal atualizada',
  );
  assert.deepEqual(validateArchive(archive), []);
});
test('prévia contém campanha, jogador e missão aplicados sem alterar o acervo original', () => {
  const archive = normalizeArchive(legacy);
  const campaign = newCampaign('Teste de prévia');
  campaign.players.push({ id: 'novo', playerId: 'Novo jogador', characters: [] });
  campaign.timelines.push({
    mission: 'Nova missão',
    location: 'Sistema teste',
    dateTime: '2200',
    esquad: 'Equipe',
    descrition: 'Relato',
  });
  archive.campaigns.push(campaign);
  const items = new Map();
  const storage = {
    get length() {
      return items.size;
    },
    key: (index) => [...items.keys()][index],
    getItem: (key) => items.get(key) || null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key),
  };
  const url = new URL(createDraftPreview(archive, campaign.id, storage, 'http://127.0.0.1:3841'));
  const preview = readDraftPreview(url.search, storage);
  assert.equal(preview.campaigns.at(-1).players[0].playerId, 'Novo jogador');
  assert.equal(preview.campaigns.at(-1).timelines[0].mission, 'Nova missão');
  archive.campaigns.at(-1).title = 'Outra edição';
  assert.equal(preview.campaigns.at(-1).title, 'Teste de prévia');
  assert.equal(legacy.campaigns.length, 1);
  assert.equal(readDraftPreview('', storage), null);
  assert.throws(() => readDraftPreview('?draft=ausente', storage), /indisponível/);
  for (let i = 0; i < 8; i++) createDraftPreview(archive, campaign.id, storage, url.origin);
  assert.equal(storage.length, 5);
});
