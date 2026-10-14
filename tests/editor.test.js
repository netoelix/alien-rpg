import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateArchive, newCampaign, normalizeArchive } from '../data/archive-schema.js';
import { profileAchievements } from '../data/player-profiles.js';
import { characterAchievements } from '../data/character-records.js';
import { createCampaignModel } from '../data/schema.js';
import { createEditorStore } from '../scripts/editor-store.mjs';
import { isLocalEditorRequest } from '../scripts/editor-plugin.mjs';

const fixture = JSON.parse(
  await readFile(new URL('../data/archive.json', import.meta.url), 'utf8'),
);

test('campanhas novas não herdam conquistas, personagens ou aliases da anterior', () => {
  const campaign = newCampaign('Nova história');
  campaign.players.push({
    id: 'novo',
    playerId: 'André',
    characters: [
      {
        id: 'novo',
        characterName: 'Alex',
        profession: 'Piloto',
        codname: '',
        images: 'assets/default-portrait.svg',
        about: 'Biografia de teste.',
        aliases: ['Alex'],
      },
    ],
  });
  const model = createCampaignModel(campaign);
  assert.deepEqual(model.playerAwards(0), []);
  assert.equal(
    model.relatedTo({ esquad: 'Trisha', descrition: 'Harper' }, model.characters[0]),
    false,
  );
  assert.deepEqual(
    validateArchive({ version: 1, campaigns: [...fixture.campaigns, campaign] }),
    [],
  );
});

test('arquivos malformados são recusados sem causar exceção', () => {
  for (const value of [
    null,
    {},
    { version: 1, campaigns: [null] },
    { version: 1, campaigns: [{ id: 'teste', title: 3 }] },
  ]) {
    assert(validateArchive(value).length > 0);
  }
  const duplicate = structuredClone(fixture);
  duplicate.campaigns.push(structuredClone(duplicate.campaigns[0]));
  assert(validateArchive(duplicate).some((error) => error.includes('repetida')));
});

test('editor aceita somente loopback, host esperado e origem local', () => {
  const request = {
    socket: { remoteAddress: '127.0.0.1' },
    headers: {
      host: '127.0.0.1:3841',
      origin: 'http://127.0.0.1:3841',
      'sec-fetch-site': 'same-origin',
    },
  };
  assert.equal(isLocalEditorRequest(request), true);
  assert.equal(
    isLocalEditorRequest({ ...request, socket: { remoteAddress: '192.168.0.2' } }),
    false,
  );
  assert.equal(
    isLocalEditorRequest({ ...request, headers: { ...request.headers, host: 'evil.example' } }),
    false,
  );
  assert.equal(
    isLocalEditorRequest({
      ...request,
      headers: { ...request.headers, origin: 'https://evil.example' },
    }),
    false,
  );
  assert.equal(
    isLocalEditorRequest({
      ...request,
      headers: { ...request.headers, 'sec-fetch-site': 'cross-site' },
    }),
    false,
  );
});

test('salvar gera backup exato e conflitos ou dados inválidos preservam o arquivo', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'alien-editor-test-'));
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
    const initial = await store.load();
    await writeFile(
      path.join(root, 'data', 'mission-migration.json'),
      JSON.stringify({ fromRevision: 'revisao-anterior', toRevision: initial.revision }),
    );
    const loaded = await store.load();
    assert.equal(loaded.previousDraftRevision, 'revisao-anterior');
    await writeFile(
      path.join(root, 'data', 'navigation-migration.json'),
      JSON.stringify({ fromRevision: 'revisao-intermediaria', toRevision: initial.revision }),
    );
    await writeFile(
      path.join(root, 'data', 'mission-migration.json'),
      JSON.stringify({ fromRevision: 'revisao-anterior', toRevision: 'revisao-intermediaria' }),
    );
    assert.deepEqual((await store.load()).previousDraftRevisions, [
      'revisao-intermediaria',
      'revisao-anterior',
    ]);
    const changed = normalizeArchive(fixture);
    const member = changed.campaigns[0].players[0];
    const awardId = changed.campaigns[0].achievements.find((award) =>
      award.character.some((grant) => grant.name === member.playerId),
    ).id;
    const extraCampaign = newCampaign('Campanha de verificação');
    const extraCharacter = { ...structuredClone(member.characters[0]), id: 'novo-personagem' };
    extraCampaign.players = [{ ...structuredClone(member), characters: [extraCharacter] }];
    extraCampaign.achievements = [
      {
        id: awardId,
        character: [
          { name: member.playerId, date: '01/01/2120', characterIds: [extraCharacter.id] },
        ],
      },
    ];
    changed.campaigns.push(extraCampaign);
    changed.campaigns[0].title = 'Título editado';
    const journal = [
      {
        id: 'pagina-persistida',
        title: 'Após a missão',
        dateTime: '2120 — dia seguinte',
        text: 'Pensamentos pessoais.\n\nSegundo parágrafo.',
      },
    ];
    changed.campaigns[0].players[0].characters[0].journal = journal;
    changed.campaigns[0].timelines[0].logs = [
      {
        id: 'sessao-2',
        title: 'Relatório secundário',
        session: 'Sessão 2',
        dateTime: '2123',
        esquad: 'Equipe',
        descrition: 'Outro texto',
      },
    ];
    const saved = await store.save(changed, loaded.revision);
    assert.equal(
      await readFile(path.join(root, '.editor-backups', saved.backup), 'utf8'),
      original,
    );
    assert.equal((await store.load()).archive.campaigns[0].title, 'Título editado');
    assert.deepEqual(
      (await store.load()).archive.campaigns[0].players[0].characters[0].journal,
      journal,
    );
    assert.equal((await store.load()).previousDraftRevision, undefined);
    assert.equal(
      (await store.load()).archive.campaigns[0].timelines[0].logs[0].title,
      'Relatório secundário',
    );
    assert.equal((await store.load()).archive.playerProfiles.length, 4);
    const reopened = normalizeArchive((await store.load()).archive);
    const earned = profileAchievements(reopened, member.profileId).find(
      (award) => award.id === awardId,
    );
    assert.equal(earned.stars, 2);
    assert.equal(earned.occurrences.length, 2);
    assert.equal(
      characterAchievements(reopened.campaigns.at(-1), reopened.achievements, extraCharacter.id)[0]
        .id,
      awardId,
    );
    assert.equal(
      characterAchievements(reopened.campaigns[0], reopened.achievements, member.characters[0].id)
        .length,
      0,
    );
    await assert.rejects(store.save(fixture, loaded.revision), (error) => error.status === 409);
    await assert.rejects(
      store.save({ version: 99 }, saved.revision),
      (error) => error.status === 422,
    );
    assert.equal((await store.load()).revision, saved.revision);
    changed.campaigns[0].title = '';
    const renamed = await store.save(changed, saved.revision);
    assert.equal((await store.load()).archive.campaigns[0].title, 'Campanha 1');
    assert.equal((await store.load()).revision, renamed.revision);
  } finally {
    const resolved = path.resolve(root);
    if (
      path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
      !path.basename(resolved).startsWith('alien-editor-test-')
    )
      throw new Error('Diretório temporário inesperado.');
    await rm(resolved, { recursive: true, force: true });
  }
});
