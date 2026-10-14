import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { validateArchive, normalizeArchive } from '../data/archive-schema.js';

export const revisionOf = (content) => createHash('sha256').update(content).digest('hex');

export function createEditorStore(root) {
  const archivePath = path.join(root, 'data', 'archive.json');
  const backupDirectory = path.join(root, '.editor-backups');
  let saving = false;

  async function load() {
    const content = await readFile(archivePath, 'utf8');
    const revision = revisionOf(content);
    const migrations = [];
    for (const filename of ['navigation-migration.json', 'mission-migration.json']) {
      try {
        migrations.push(JSON.parse(await readFile(path.join(root, 'data', filename), 'utf8')));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    const previousDraftRevisions = [];
    let cursor = revision;
    for (const migration of migrations) {
      if (migration.toRevision === cursor) {
        previousDraftRevisions.push(migration.fromRevision);
        cursor = migration.fromRevision;
      }
    }
    return {
      archive: JSON.parse(content),
      revision,
      previousDraftRevision: previousDraftRevisions[0],
      previousDraftRevisions,
    };
  }

  async function save(archive, expectedRevision) {
    if (saving)
      throw Object.assign(new Error('Outra gravação está em andamento.'), { status: 409 });
    saving = true;
    try {
      const errors = validateArchive(archive);
      if (errors.length) throw Object.assign(new Error(errors.join('\n')), { status: 422 });
      archive = normalizeArchive(archive);
      // Somente recursos locais existentes são aceitos; nenhum caminho é usado para escrita.
      const available = new Set(await readdir(path.join(root, 'public', 'assets')));
      for (const campaign of archive.campaigns) {
        const resources = [
          ...campaign.players.flatMap((player) =>
            player.characters.map((character) => character.images),
          ),
          ...archive.achievements.map((achievement) => achievement.medal),
        ];
        if (resources.some((resource) => !available.has(resource.slice('assets/'.length)))) {
          throw Object.assign(new Error('Selecione um retrato ou medalha existente no acervo.'), {
            status: 422,
          });
        }
      }
      const previous = await readFile(archivePath, 'utf8');
      if (revisionOf(previous) !== expectedRevision) {
        throw Object.assign(
          new Error(
            'O arquivo mudou desde que você abriu o editor. Exporte seu rascunho e recarregue antes de salvar.',
          ),
          { status: 409 },
        );
      }
      await mkdir(backupDirectory, { recursive: true });
      const backup = `${new Date().toISOString().replaceAll(':', '-')}-${revisionOf(previous).slice(0, 12)}.json`;
      await writeFile(path.join(backupDirectory, backup), previous, { flag: 'wx' });
      const content = JSON.stringify(archive, null, 2) + '\n';
      const temporaryPath = archivePath + '.pending';
      await writeFile(temporaryPath, content);
      await rename(temporaryPath, archivePath);
      return { revision: revisionOf(content), backup };
    } finally {
      saving = false;
    }
  }

  return { load, save };
}
