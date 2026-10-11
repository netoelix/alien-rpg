import { normalizeArchive, validateArchive } from '../../data/archive-schema.js';
const prefix = 'alien-draft-preview:';
export function createDraftPreview(archive, campaignId, storage, origin) {
  const errors = validateArchive(archive);
  if (errors.length) throw new Error(errors.join('\n'));
  // Retém somente as prévias recentes para não acumular cópias do acervo.
  const snapshots = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix)) {
      try {
        snapshots.push({ key, createdAt: JSON.parse(storage.getItem(key)).createdAt || 0 });
      } catch {
        snapshots.push({ key, createdAt: 0 });
      }
    }
  }
  snapshots.sort((a, b) => b.createdAt - a.createdAt);
  for (const snapshot of snapshots.slice(4)) storage.removeItem(snapshot.key);
  const token = crypto.randomUUID();
  storage.setItem(
    prefix + token,
    JSON.stringify({ archive: normalizeArchive(archive), createdAt: Date.now() }),
  );
  return origin + '/?draft=' + token + '#/c/' + campaignId + '/campaign';
}
export function readDraftPreview(search, storage) {
  const token = new URLSearchParams(search).get('draft');
  if (!token) return null;
  const snapshot = JSON.parse(storage.getItem(prefix + token));
  if (!snapshot || validateArchive(snapshot.archive).length)
    throw new Error('Prévia indisponível. Abra novamente pelo editor.');
  return normalizeArchive(snapshot.archive);
}
