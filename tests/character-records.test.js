import test from 'node:test';
import assert from 'node:assert/strict';
import source from '../data/archive.json' with { type: 'json' };
import { normalizeArchive, validateArchive, newCampaign } from '../data/archive-schema.js';
import { characterAchievements } from '../data/character-records.js';
import { profileAchievements } from '../data/player-profiles.js';
import { modelsForArchive } from '../data/model.js';

test('quatro campanhas preservam concessões e limitam a três estrelas sem herança por personagem', () => {
  const archive = normalizeArchive(source);
  const member = archive.campaigns[0].players[0];
  const definition = archive.achievements[0];
  archive.campaigns[0].achievements = [];
  for (let index = 0; index < 4; index++) {
    const campaign = newCampaign('História ' + index);
    const character = { ...structuredClone(member.characters[0]), id: 'personagem-' + index };
    campaign.players = [
      { ...structuredClone(member), id: 'membro-' + index, characters: [character] },
    ];
    archive.campaigns.push(campaign);
    assert.equal(characterAchievements(campaign, archive.achievements, character.id).length, 0);
    campaign.achievements = [
      {
        id: definition.id,
        character: [{ name: member.playerId, date: '01/01/2120', characterIds: [character.id] }],
      },
    ];
    assert.equal(characterAchievements(campaign, archive.achievements, character.id).length, 1);
  }
  assert.deepEqual(validateArchive(archive), []);
  const award = profileAchievements(archive, member.profileId).find(
    (item) => item.id === definition.id,
  );
  assert.equal(award.stars, 3);
  assert.equal(award.occurrences.length, 4);
  const campaign = archive.campaigns.at(-1);
  campaign.achievements[0].character[0].characterIds = ['personagem-0'];
  assert.ok(validateArchive(archive).some((error) => error.includes('personagens')));
});

test('diários preservam textos no modelo e recusam entradas incompletas ou duplicadas', () => {
  const archive = normalizeArchive(source);
  const character = archive.campaigns[0].players[0].characters[0];
  const entry = {
    id: 'pagina-1',
    title: 'Depois da fuga',
    dateTime: '04/04/2120',
    text: 'Primeiro parágrafo.\n\nSegundo relato /pessoal/.',
  };
  character.journal = [entry];
  assert.deepEqual(validateArchive(archive), []);
  assert.deepEqual(
    modelsForArchive(archive)[0].characters.find((item) => item.id === character.id).journal,
    [entry],
  );
  character.journal.push({ ...entry });
  assert.ok(validateArchive(archive).some((error) => error.includes('diário')));
  character.journal = [{ ...entry, text: '' }];
  assert.ok(validateArchive(archive).length);
});

test('concessões antigas conservam o jogador sem inventar personagem', () => {
  const archive = normalizeArchive(source);
  const campaign = archive.campaigns[0];
  const character = campaign.players[0].characters[0];
  assert.deepEqual(validateArchive(archive), []);
  assert.equal(characterAchievements(campaign, archive.achievements, character.id).length, 0);
  assert.ok(profileAchievements(archive, campaign.players[0].profileId).length);
});

test('dois personagens na mesma campanha recebem o feito sem duplicar estrelas', () => {
  const archive = normalizeArchive(source);
  const campaign = archive.campaigns[0];
  const player = campaign.players[0];
  const first = player.characters[0];
  const second = { ...structuredClone(first), id: 'segundo-personagem' };
  player.characters.push(second);
  const definition = archive.achievements[0];
  const grant = {
    name: player.playerId,
    date: '01/01/2120',
    characterIds: [first.id, second.id],
  };
  campaign.achievements = [{ id: definition.id, character: [grant] }];
  assert.deepEqual(validateArchive(archive), []);
  for (const character of [first, second])
    assert.equal(characterAchievements(campaign, archive.achievements, character.id).length, 1);
  assert.equal(profileAchievements(archive, player.profileId)[0].stars, 1);

  grant.characterIds = [campaign.players[1].characters[0].id];
  assert.ok(validateArchive(archive).some((error) => error.includes('personagens')));
  grant.characterIds = [];
  assert.ok(validateArchive(archive).some((error) => error.includes('personagens')));
  grant.characterIds = [first.id];
  campaign.achievements[0].character.push(structuredClone(grant));
  assert.ok(validateArchive(archive).some((error) => error.includes('duplicada')));
});
