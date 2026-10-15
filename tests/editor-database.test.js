import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL protege o acervo e salva histórico atomicamente com controle de revisão', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      'create role anon; create role authenticated; create role service_role bypassrls;',
    );
    await db.exec(await readFile(new URL('../supabase/editor.sql', import.meta.url), 'utf8'));
    const initial = (
      await db.query(
        'insert into editor_archive(id, archive, published_sha) values (1, \'{"title":"original"}\', \'baseline\') returning revision',
      )
    ).rows[0].revision;
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      for (const table of ['editor_archive', 'editor_history', 'editor_assets']) {
        await assert.rejects(db.query(`select * from ${table}`), /permission denied/);
      }
      await assert.rejects(
        db.query('select save_editor_archive($1, $2)', [{ title: 'attack' }, initial]),
        /permission denied/,
      );
      await db.exec('reset role');
    }
    await db.exec('set role service_role');
    const saved = (
      await db.query('select save_editor_archive($1, $2) as result', [
        { title: 'updated' },
        initial,
      ])
    ).rows[0].result;
    assert.equal(saved.backup, initial);
    assert.notEqual(saved.revision, initial);
    assert.deepEqual((await db.query('select archive from editor_history')).rows, [
      { archive: { title: 'original' } },
    ]);
    await assert.rejects(
      db.query('select save_editor_archive($1, $2)', [{ title: 'stale' }, initial]),
      /revision_conflict/,
    );
    await db.exec('reset role');
    await db.exec(
      "create function reject_backup() returns trigger language plpgsql as $$ begin raise exception 'backup_failed'; end $$; create trigger reject_backup before insert on editor_history for each row execute function reject_backup();",
    );
    await db.exec('set role service_role');
    await assert.rejects(
      db.query('select save_editor_archive($1, $2)', [{ title: 'unsaved' }, saved.revision]),
      /backup_failed/,
    );
    const current = (await db.query('select archive, revision from editor_archive')).rows[0];
    assert.deepEqual(current, { archive: { title: 'updated' }, revision: saved.revision });
    assert.equal((await db.query('select * from editor_history')).rows.length, 1);
  } finally {
    await db.close();
  }
});
