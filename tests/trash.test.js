import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeArchive, newCampaign, validateArchive } from '../data/archive-schema.js';
import { moveToTrash, restoreFromTrash } from '../data/trash.js';
import { publicArchivePlugin } from '../scripts/public-archive-plugin.mjs';
const fixture = normalizeArchive(
  JSON.parse(await readFile(new URL('../data/archive.json', import.meta.url))),
);
const campaignId = fixture.campaigns[0].id;
const restore = (archive) => restoreFromTrash(archive, archive.trash.at(-1).id);
const active = ({ trash, ...archive }) => archive;

test('campanha volta da lixeira sem apagar edição em outra campanha ou cadastros globais', () => {
  const source = structuredClone(fixture);
  source.campaigns.push(newCampaign('Outra campanha'));
  const removed = moveToTrash(source, { kind: 'campaign', campaignId });
  removed.campaigns[0].summary = 'Edição posterior';
  const recovered = restore(removed);
  assert.deepEqual(recovered.campaigns[0], source.campaigns[0]);
  assert.equal(recovered.campaigns[1].summary, 'Edição posterior');
  assert.deepEqual(recovered.playerProfiles, source.playerProfiles);
  assert.throws(() => moveToTrash(fixture, { kind: 'campaign', campaignId }), /ao menos uma/);
});

test('participação e personagem restauram diários e vínculos sem eliminar cadastro global', () => {
  const player = fixture.campaigns[0].players[0];
  for (const request of [
    { kind: 'players', id: player.id },
    { kind: 'characters', id: player.characters[0].id },
  ]) {
    const removed = moveToTrash(fixture, { campaignId, ...request });
    assert.deepEqual(validateArchive(removed), []);
    assert.deepEqual(removed.playerProfiles, fixture.playerProfiles);
    assert.deepEqual(active(restore(removed)), active(fixture));
  }
  assert.throws(
    () => moveToTrash(fixture, { kind: 'profile', id: player.profileId }),
    /participações/,
  );
  const removed = moveToTrash(fixture, { kind: 'players', campaignId, id: player.id });
  const deletedProfile = moveToTrash(removed, { kind: 'profile', id: player.profileId });
  assert.deepEqual(restore(deletedProfile), removed);
});

test('missão remove só paradas vinculadas e restaura índices e relatos', () => {
  const removed = moveToTrash(fixture, { kind: 'timelines', campaignId, missionIndex: 7 });
  const campaign = removed.campaigns[0];
  assert.equal(campaign.timelines[7].mission, fixture.campaigns[0].timelines[8].mission);
  assert.equal(
    campaign.navigation.route.some((stop) => stop.id === 'mission-7'),
    false,
  );
  assert.equal(campaign.navigation.route.find((stop) => stop.id === 'mission-8').missionIndex, 7);
  assert.deepEqual(active(restore(removed)), active(fixture));
});

test('registro, diário e conquista universal podem ser restaurados', () => {
  const source = structuredClone(fixture);
  const character = source.campaigns[0].players[0].characters[0];
  character.journal = [
    { id: 'entry', title: 'Pensamentos', dateTime: '2120', text: 'Texto preservado.' },
  ];
  for (const request of [
    { kind: 'logs', missionIndex: 0, id: source.campaigns[0].timelines[0].logs[0].id },
    { kind: 'journal', id: character.id, entryId: 'entry' },
    { kind: 'achievements', id: source.achievements[0].id },
  ]) {
    const removed = moveToTrash(source, { campaignId, ...request });
    assert.deepEqual(validateArchive(removed), []);
    assert.deepEqual(active(restore(removed)), active(source));
  }
});

test('restauração recusa colisão de ID e não altera o acervo recebido', () => {
  const source = structuredClone(fixture);
  const removed = moveToTrash(source, { kind: 'characters', campaignId, id: '0' });
  removed.campaigns[0].players[0].characters.push({
    ...source.campaigns[0].players[0].characters[0],
    about: 'Outro conteúdo',
  });
  const copy = structuredClone(removed);
  assert.throws(() => restore(removed), /mudaram após/);
  assert.deepEqual(removed, copy);
});

test('lixeira sobrevive ao JSON e não entra no módulo do site público', () => {
  const removed = moveToTrash(fixture, {
    kind: 'logs',
    campaignId,
    missionIndex: 0,
    id: fixture.campaigns[0].timelines[0].logs[0].id,
  });
  const reopened = JSON.parse(JSON.stringify(removed));
  assert.deepEqual(active(restore(reopened)), active(fixture));
  const module = publicArchivePlugin().transform(
    JSON.stringify(reopened),
    '/project/data/archive.json',
  );
  assert.equal(Object.hasOwn(JSON.parse(module.code), 'trash'), false);
  assert.deepEqual(JSON.parse(module.code).campaigns, removed.campaigns);
});
