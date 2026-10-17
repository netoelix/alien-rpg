import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeArchive, newCampaign, validateArchive } from '../data/archive-schema.js';
import { applyPlayerProfile, profileAchievements } from '../data/player-profiles.js';
const legacy = JSON.parse(
  await readFile(new URL('./fixtures/archive-v1.json', import.meta.url), 'utf8'),
);
test('cadastro único mantém personagens por campanha e não une homônimos', () => {
  const archive = normalizeArchive(legacy);
  const campaign = newCampaign('Outra campanha');
  archive.campaigns.push(campaign);
  const original = archive.campaigns[0].players[0];
  applyPlayerProfile(
    archive,
    campaign.id,
    { id: 'participante-2', profileId: original.profileId, playerId: original.playerId },
    'new',
  );
  assert.equal(campaign.players[0].profileId, original.profileId);
  assert.deepEqual(campaign.players[0].characters, []);
  assert.equal(archive.playerProfiles.length, 4);
  assert.throws(
    () =>
      applyPlayerProfile(
        archive,
        campaign.id,
        { id: 'participante-3', profileId: original.profileId },
        'new',
      ),
    /já participa/,
  );
  const separate = newCampaign('Homônimo');
  archive.campaigns.push(separate);
  applyPlayerProfile(
    archive,
    separate.id,
    { id: 'outra-pessoa', playerId: original.playerId },
    'new',
  );
  assert.notEqual(separate.players[0].profileId, original.profileId);
  assert.deepEqual(validateArchive(archive), []);
});
test('renomear pessoa atualiza campanhas e concessões sem perder personagens ou datas; acervo não duplica conquistas', () => {
  const archive = normalizeArchive(legacy);
  const original = archive.campaigns[0].players[0];
  const before = structuredClone(original.characters);
  const oldAwards = profileAchievements(archive, original.profileId);
  const campaign = newCampaign('Nova história');
  archive.campaigns.push(campaign);
  applyPlayerProfile(
    archive,
    campaign.id,
    { id: 'novo-vinculo', profileId: original.profileId, playerId: original.playerId },
    'new',
  );
  applyPlayerProfile(
    archive,
    campaign.id,
    { ...campaign.players[0], playerId: 'Novo nome', biography: 'Biografia pessoal' },
    '0',
  );
  assert.equal(original.playerId, 'Novo nome');
  assert.deepEqual(original.characters, before);
  assert.deepEqual(profileAchievements(archive, original.profileId), oldAwards);
  assert.deepEqual(validateArchive(archive), []);
  const award = oldAwards[0];
  campaign.achievements.push({
    id: award.id,
    character: [{ name: 'Novo nome', date: '01/01/2026' }],
  });
  assert.deepEqual(validateArchive(archive), []);
  assert.equal(
    profileAchievements(archive, original.profileId).find((item) => item.id === award.id).stars,
    2,
  );
});

test('referências a cadastros desconhecidos e cadastros repetidos são recusadas', () => {
  const archive = normalizeArchive(legacy);
  archive.campaigns[0].players[0].profileId = 'desconhecido';
  assert(validateArchive(archive).some((error) => error.includes('Vínculo')));
  archive.playerProfiles.push(structuredClone(archive.playerProfiles[0]));
  assert(validateArchive(archive).some((error) => error.includes('Cadastro')));
});
