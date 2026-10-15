import { randomUUID, createHash } from 'node:crypto';
import { publicArchive, archiveAssets } from '../data/public-archive.js';
import { EditorError } from './admin-access.js';

export function createPublisher({ token, repository, branch, fetcher = fetch }) {
  if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !/^[\w./-]+$/.test(branch || ''))
    throw new EditorError(503, 'Publicação ainda não configurada.');
  const base = `https://api.github.com/repos/${repository}`;
  async function github(path, method = 'GET', body) {
    const response = await fetcher(base + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new EditorError(
        response.status === 409 || response.status === 422 ? 409 : 502,
        response.status === 409 || response.status === 422
          ? 'O repositório mudou. Recarregue o editor antes de publicar.'
          : 'O GitHub recusou a operação. Confira a configuração de publicação.',
      );
    return response.json();
  }
  async function source() {
    const ref = await github(`/git/ref/heads/${encodeURIComponent(branch)}`);
    const head = ref.object.sha;
    const [commit, file] = await Promise.all([
      github(`/git/commits/${head}`),
      github(`/contents/data/archive.json?ref=${head}`),
    ]);
    return { head, tree: commit.tree.sha, contentSha: file.sha };
  }
  async function publish(archive, expectedContentSha, assetContent) {
    const current = await source();
    if (!expectedContentSha || current.contentSha !== expectedContentSha)
      throw new EditorError(
        409,
        'O conteúdo publicado mudou desde que o editor foi aberto. Exporte o rascunho e recarregue para conferir.',
      );
    const snapshot = publicArchive(archive);
    const serialized = JSON.stringify(snapshot, null, 2) + '\n';
    const publicationId = randomUUID();
    const entries = [];
    // As imagens já existentes permanecem no Git. Só os novos retratos associados são copiados.
    for (const asset of archiveAssets(snapshot)) {
      if (!/^assets\/portrait-[a-f0-9]{64}\.png$/.test(asset)) continue;
      const content = await assetContent(asset);
      if (!content) continue;
      const blob = await github('/git/blobs', 'POST', { content, encoding: 'base64' });
      entries.push({ path: `public/${asset}`, mode: '100644', type: 'blob', sha: blob.sha });
    }
    entries.push({
      path: 'data/archive.json',
      mode: '100644',
      type: 'blob',
      content: serialized,
    });
    entries.push({
      path: 'public/publication.json',
      mode: '100644',
      type: 'blob',
      content: JSON.stringify({ id: publicationId }),
    });
    const tree = await github('/git/trees', 'POST', { base_tree: current.tree, tree: entries });
    const commit = await github('/git/commits', 'POST', {
      message: `content: publish archive ${publicationId}`,
      tree: tree.sha,
      parents: [current.head],
    });
    // Nunca force: um commit concorrente impede sobrescrita silenciosa.
    await github(`/git/refs/heads/${encodeURIComponent(branch)}`, 'PATCH', {
      sha: commit.sha,
      force: false,
    });
    return {
      publicationId,
      commit: commit.sha,
      contentSha: createHash('sha1')
        .update(`blob ${Buffer.byteLength(serialized)}\0`)
        .update(serialized)
        .digest('hex'),
    };
  }
  return { source, publish };
}
