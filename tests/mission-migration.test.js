import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { normalizeArchive, validateArchive } from '../data/archive-schema.js';
import { missionRecords } from '../data/schema.js';
import { validateEditorRecord } from '../data/editor-rules.js';
const source = JSON.parse(await readFile(new URL('../data/archive.json', import.meta.url), 'utf8'));
const migration = JSON.parse(
  await readFile(new URL('../data/mission-migration.json', import.meta.url), 'utf8'),
);
const editorialReview = JSON.parse(
  await readFile(new URL('../data/mission-editorial-review.json', import.meta.url), 'utf8'),
);
test('os 17 relatos conservam originais auditáveis e apenas as revisões editoriais registradas', () => {
  assert.equal(migration.fingerprints.length, 17);
  for (const fingerprint of migration.fingerprints) {
    const mission = source.campaigns.find((item) => item.id === fingerprint.campaignId).timelines[
      fingerprint.index
    ];
    assert.equal(Object.hasOwn(mission, 'descrition'), false);
    assert.equal(mission.logs.length, 1);
    const record = missionRecords(mission)[0];
    const actual = createHash('sha256')
      .update(
        JSON.stringify([
          mission.mission,
          mission.location,
          record.dateTime,
          record.esquad,
          record.descrition,
        ]),
      )
      .digest('hex');
    const revision = editorialReview.revisions.find(
      (item) => item.campaignId === fingerprint.campaignId && item.index === fingerprint.index,
    );
    assert.equal(actual, revision?.revisedSha256 || fingerprint.sha256);
    if (revision) {
      assert.equal(record.id, revision.recordId);
      const original = createHash('sha256')
        .update(
          JSON.stringify([
            mission.mission,
            mission.location,
            record.dateTime,
            record.esquad,
            revision.originalText,
          ]),
        )
        .digest('hex');
      assert.equal(original, fingerprint.sha256, 'O original migrado permanece recuperável');
    }
  }
  assert.deepEqual(validateArchive(source), []);
});
test('missão vazia não cria relato artificial; normalização antiga é idempotente e preserva registros adicionais', () => {
  const archive = structuredClone(source);
  const mission = archive.campaigns[0].timelines[0];
  const original = structuredClone(mission.logs[0]);
  mission.descrition = original.descrition;
  mission.logs = [{ ...original, id: 'registro-adicional', title: 'Segundo registro' }];
  const migrated = normalizeArchive(archive);
  assert.equal(migrated.campaigns[0].timelines[0].logs.length, 2);
  assert.deepEqual(normalizeArchive(migrated), migrated);
  const empty = {
    mission: 'Operação',
    location: 'Sistema',
    dateTime: '2180',
    esquad: 'Equipe',
    logs: [],
  };
  assert.deepEqual(validateEditorRecord('timelines', empty), []);
  assert.deepEqual(missionRecords(empty), []);
  archive.campaigns[0].timelines.push(empty);
  assert.deepEqual(validateArchive(archive), []);
});
