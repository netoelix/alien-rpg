import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { normalizeArchive, validateArchive } from '../data/archive-schema.js';
import { archiveAssets } from '../data/public-archive.js';
import {
  EditorError,
  requireAdmin,
  requireOrigin,
  isPublishableKey,
} from '../server/admin-access.js';
import { createPublisher } from '../server/github-publisher.js';

const root = new URL('../', import.meta.url);
const fail = (message, status = 503) => {
  throw new EditorError(status, message);
};
function database() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
    fail('Armazenamento online ainda não configurado.');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function publisher() {
  return createPublisher({
    token: process.env.EDITOR_GITHUB_TOKEN,
    repository: process.env.EDITOR_GITHUB_REPOSITORY,
    branch: process.env.EDITOR_GITHUB_BRANCH,
  });
}
async function load(db) {
  const { data, error } = await db
    .from('editor_archive')
    .select('archive,revision,published_sha')
    .eq('id', 1)
    .maybeSingle();
  if (error)
    fail(
      'Não foi possível abrir o banco. Confira o SQL de configuração e se o projeto está ativo.',
    );
  if (data) return data;
  const seedText = await readFile(new URL('data/archive.json', root), 'utf8');
  const seed = normalizeArchive(JSON.parse(seedText));
  const seedSha = createHash('sha1')
    .update(`blob ${Buffer.byteLength(seedText)}\0`)
    .update(seedText)
    .digest('hex');
  const inserted = await db
    .from('editor_archive')
    .insert({ id: 1, archive: seed, published_sha: seedSha })
    .select('archive,revision,published_sha')
    .single();
  if (inserted.error?.code === '23505') return load(db);
  if (inserted.error) fail('Não foi possível iniciar o acervo privado.');
  return inserted.data;
}
async function assets(db) {
  const { data, error } = await db.from('editor_assets').select('path');
  if (error) fail('Não foi possível abrir o catálogo de retratos.');
  const files = await readdir(new URL('public/assets/', root));
  return [...new Set([...files.map((name) => `assets/${name}`), ...data.map((item) => item.path)])];
}
async function assetContent(db, path) {
  const { data, error } = await db
    .from('editor_assets')
    .select('content')
    .eq('path', path)
    .maybeSingle();
  if (error) fail('Não foi possível ler um retrato.');
  return data?.content;
}
function jsonBody(request) {
  const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  if (!body || Buffer.byteLength(JSON.stringify(body)) > 3 * 1024 * 1024)
    fail('Envio inválido ou acima de 3 MB.', 413);
  return body;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'private, no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status, value) => response.status(status).json(value);
  const action = request.query.action;
  try {
    if (action === 'config' && request.method === 'GET') {
      const configured = Boolean(
        process.env.SUPABASE_URL &&
        isPublishableKey(process.env.SUPABASE_PUBLISHABLE_KEY) &&
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.ADMIN_DISCORD_ID &&
        process.env.EDITOR_ORIGIN,
      );
      return send(
        200,
        configured
          ? {
              configured: true,
              url: process.env.SUPABASE_URL,
              key: process.env.SUPABASE_PUBLISHABLE_KEY,
            }
          : { configured: false },
      );
    }
    if (!['GET', 'POST', 'PUT'].includes(request.method))
      return send(405, { error: 'Método não permitido.' });
    if (request.method !== 'GET') {
      requireOrigin(request, process.env.EDITOR_ORIGIN);
      if (request.headers['content-type']?.split(';')[0] !== 'application/json')
        fail('Envie JSON.', 415);
    }
    const db = database();
    await requireAdmin(request, db, process.env.ADMIN_DISCORD_ID);
    if (action === 'session' && request.method === 'GET') return send(200, { authorized: true });
    if (action === 'archive' && request.method === 'GET') {
      const state = await load(db);
      let source = null;
      try {
        source = await publisher().source();
      } catch {
        /* Edição disponível mesmo sem publicação configurada. */
      }
      return send(200, {
        ...state,
        assets: await assets(db),
        contentSha:
          source && source.contentSha === state.published_sha ? state.published_sha : null,
      });
    }
    if (action === 'archive' && request.method === 'PUT') {
      const { archive, revision } = jsonBody(request);
      const errors = validateArchive(archive);
      if (errors.length) fail(errors.join('\n'), 422);
      const normalized = normalizeArchive(archive);
      const available = new Set(await assets(db));
      if (archiveAssets(normalized).some((path) => !available.has(path)))
        fail('Retrato ou medalha não encontrado no acervo.', 422);
      const { data, error } = await db.rpc('save_editor_archive', {
        payload: normalized,
        expected_revision: revision,
      });
      if (error)
        fail(
          error.message.includes('revision_conflict')
            ? 'Outra edição foi salva. Exporte seu rascunho e recarregue antes de continuar.'
            : 'Não foi possível salvar com histórico.',
          error.message.includes('revision_conflict') ? 409 : 503,
        );
      return send(200, data);
    }
    if (action === 'portrait' && request.method === 'POST') {
      const { content } = jsonBody(request);
      if (typeof content !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(content))
        fail('Imagem inválida.', 422);
      const bytes = Buffer.from(content, 'base64');
      if (
        bytes.length > 2 * 1024 * 1024 ||
        !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        fail('Envie PNG de até 2 MB.', 422);
      const asset = `assets/portrait-${createHash('sha256').update(bytes).digest('hex')}.png`;
      const { error } = await db
        .from('editor_assets')
        .upsert({ path: asset, content }, { onConflict: 'path', ignoreDuplicates: true });
      if (error) fail('Não foi possível guardar o retrato.');
      return send(200, { asset });
    }
    if (action === 'asset' && request.method === 'GET') {
      const content = await assetContent(db, String(request.query.path || ''));
      return content ? send(200, { content }) : send(404, { error: 'Retrato não encontrado.' });
    }
    if (action === 'history' && request.method === 'GET') {
      const { data, error } = await db
        .from('editor_history')
        .select('revision,saved_at')
        .order('saved_at', { ascending: false })
        .limit(30);
      if (error) fail('Não foi possível abrir o histórico.');
      return send(200, { entries: data });
    }
    if (action === 'backup' && request.method === 'GET') {
      const { data, error } = await db
        .from('editor_history')
        .select('archive')
        .eq('revision', String(request.query.revision || ''))
        .single();
      if (error) fail('Backup não encontrado.', 404);
      return send(200, data);
    }
    if (action === 'publish' && request.method === 'POST') {
      const { revision, contentSha } = jsonBody(request);
      const current = await load(db);
      if (revision !== current.revision)
        fail('O rascunho mudou. Recarregue antes de publicar.', 409);
      if (contentSha !== current.published_sha)
        fail('A base de publicação mudou. Recarregue o editor.', 409);
      const result = await publisher().publish(current.archive, contentSha, (path) =>
        assetContent(db, path),
      );
      const saved = await db
        .from('editor_archive')
        .update({ published_sha: result.contentSha })
        .eq('id', 1)
        .eq('published_sha', contentSha);
      if (saved.error)
        return send(200, {
          ...result,
          warning:
            'Enviado ao GitHub, mas o vínculo do histórico precisa ser conferido antes de publicar novamente.',
        });
      return send(200, result);
    }
    return send(404, { error: 'Operação não encontrada.' });
  } catch (error) {
    // Mensagens de provedores podem conter detalhes internos. Nunca devolver tokens ou SQL.
    return send(error instanceof EditorError ? error.status : 500, {
      error:
        error instanceof EditorError
          ? error.message
          : 'Não foi possível concluir a operação. Tente novamente ou confira a configuração.',
    });
  }
}
