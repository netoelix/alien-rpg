import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newCampaign, normalizeArchive, validateArchive } from '../data/archive-schema.js';
import { validateEditorRecord } from '../data/editor-rules.js';

const archive = JSON.parse(
  await readFile(new URL('./fixtures/archive-v1.json', import.meta.url), 'utf8'),
);

test('campanha sem nome ganha número editável, sem exigir textos de apresentação', () => {
  const second = newCampaign('', archive.campaigns);
  assert.equal(second.title, 'Campanha 2');
  const third = newCampaign(undefined, [...archive.campaigns, second]);
  assert.equal(third.title, 'Campanha 3');
  second.title = '   ';
  const raw = { version: 1, campaigns: [...archive.campaigns, second] };
  assert.deepEqual(validateArchive(raw), []);
  assert.deepEqual(validateEditorRecord('campaign', second), []);
  assert.equal(normalizeArchive(raw).campaigns[1].title, 'Campanha 2');
  assert.equal(raw.campaigns[1].title, '   ');
  second.title = 'Outra história';
  assert.equal(normalizeArchive(raw).campaigns[1].title, 'Outra história');
});

test('nome automático evita colisões com os nomes existentes', () => {
  const campaigns = [...archive.campaigns, newCampaign('Campanha 3')];
  assert.equal(newCampaign('', campaigns).title, 'Campanha 4');
});

test('personagem exige nome, profissão, biografia, jogador e retrato; codinome e situação são opcionais', () => {
  const character = {
    characterName: 'Alex',
    profession: 'Piloto',
    about: 'História de Alex.',
    owner: '0',
    images: 'assets/default-portrait.svg',
    codname: '',
    lifeStatus: '',
  };
  assert.deepEqual(validateEditorRecord('characters', character), []);
  for (const field of ['characterName', 'profession', 'about', 'owner', 'images']) {
    assert.equal(validateEditorRecord('characters', { ...character, [field]: ' ' }).length, 1);
  }
  assert.deepEqual(validateEditorRecord('players', { playerId: '' }), [
    'Nome do jogador: preencha este campo obrigatório.',
  ]);
  assert(validateEditorRecord('timelines', { mission: '', esquad: '' }).length > 0);
  assert(validateEditorRecord('achievements', { name: '', description: '' }).length > 0);
});

test('estado é opcional no acervo existente; valores válidos podem ser adicionados depois', () => {
  const copy = structuredClone(archive);
  const character = copy.campaigns[0].players[0].characters[0];
  delete character.codname;
  delete character.lifeStatus;
  assert.deepEqual(validateArchive(copy), []);
  for (const state of ['vivo', 'morto', 'desaparecido', '']) {
    character.lifeStatus = state;
    assert.deepEqual(validateArchive(copy), []);
  }
  character.lifeStatus = 'inválido';
  assert(validateArchive(copy).some((error) => error.includes('Situação')));
  character.lifeStatus = '';
  character.about = ' ';
  assert(validateArchive(copy).some((error) => error.includes('biografia')));
});
