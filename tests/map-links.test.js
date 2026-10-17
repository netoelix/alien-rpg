import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { missionMapLink, resolveMapLink } from '../data/map-links.js';
import { normalizeArchive } from '../data/archive-schema.js';
import { moveToTrash } from '../data/trash.js';
const campaign = JSON.parse(await readFile(new URL('./fixtures/archive-v1.json', import.meta.url)))
  .campaigns[0];

test('link de missão distingue retornos ao mesmo sistema e escalas da mesma missão', () => {
  assert.equal(missionMapLink(campaign, 1), 'map/stop/mission-1');
  assert.equal(missionMapLink(campaign, 3), 'map/stop/mission-3');
  assert.equal(missionMapLink(campaign, 12), 'map/stop/mission-12');
  const target = resolveMapLink(campaign, 'stop', 'mission-7');
  assert.equal(target.index, 7);
  assert.equal(target.system.id, 'hr2429');
});

test('link inferido permanece estável após excluir uma missão anterior', () => {
  const archive = normalizeArchive(
    JSON.parse(JSON.stringify({ version: 1, campaigns: [campaign] })),
  );
  delete archive.campaigns[0].navigation.route;
  const before = missionMapLink(archive.campaigns[0], 7);
  const after = moveToTrash(archive, {
    kind: 'timelines',
    campaignId: campaign.id,
    missionIndex: 0,
  });
  assert.equal(missionMapLink(after.campaigns[0], 6), before);
});

test('local sem parada abre sistema sem inventar viagem; link antigo falha com segurança', () => {
  assert.equal(missionMapLink(campaign, 16), 'map/system/zkh-341');
  assert.equal(resolveMapLink(campaign, 'system', 'zkh-341').index, -1);
  assert.equal(resolveMapLink(campaign, 'stop', 'removida').invalid, true);
  assert.equal(missionMapLink({ timelines: [{ location: 'Desconhecido' }] }, 0), null);
});
