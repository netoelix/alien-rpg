import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeArchive, validateArchive } from '../data/archive-schema.js';
import { publicArchive } from '../data/public-archive.js';
import { requireAdmin, requireOrigin, isPublishableKey } from '../server/admin-access.js';
import { createPublisher } from '../server/github-publisher.js';
const fixture = normalizeArchive(
  JSON.parse(await readFile(new URL('../data/archive.json', import.meta.url))),
);
const admin = '123456789012345678';

test('configuração nunca expõe uma chave secreta no campo público', () => {
  assert.equal(isPublishableKey('sb_secret_private'), false);
  assert.equal(isPublishableKey('sb_publishable_example'), true);
  const legacy = (role) =>
    'header.' + Buffer.from(JSON.stringify({ role })).toString('base64url') + '.signature';
  assert.equal(isPublishableKey(legacy('service_role')), false);
  assert.equal(isPublishableKey(legacy('anon')), true);
});

test('somente identidade Discord verificada autoriza; nome, e-mail e metadados não concedem acesso', async () => {
  const request = { headers: { authorization: 'Bearer test-token' } };
  const client = (user, error = null) => ({
    auth: {
      getUser: async (token) => {
        assert.equal(token, 'test-token');
        return { data: { user }, error };
      },
    },
  });
  await assert.rejects(requireAdmin({ headers: {} }, client({}), admin), { status: 401 });
  await assert.rejects(requireAdmin(request, client({}), ''), { status: 503 });
  await assert.rejects(requireAdmin(request, client(null, new Error('invalid')), admin), {
    status: 401,
  });
  await assert.rejects(
    requireAdmin(
      request,
      client({
        user_metadata: { sub: admin },
        identities: [{ provider: 'discord', provider_id: 'other' }],
      }),
      admin,
    ),
    { status: 403 },
  );
  await assert.rejects(
    requireAdmin(
      request,
      client({ identities: [{ provider: 'google', provider_id: admin }] }),
      admin,
    ),
    { status: 403 },
  );
  assert.equal(
    await requireAdmin(
      request,
      client({ id: 'internal', identities: [{ provider: 'discord', provider_id: admin }] }),
      admin,
    ),
    'internal',
  );
});

test('gravações recusam origem ausente, diferente ou cross-site', () => {
  const origin = 'https://example.com';
  for (const headers of [
    {},
    { origin: 'https://evil.example' },
    { origin, 'sec-fetch-site': 'cross-site' },
  ])
    assert.throws(() => requireOrigin({ headers }, origin), { status: 403 });
  assert.doesNotThrow(() => requireOrigin({ headers: { origin } }, origin));
});

test('snapshot público mantém o acervo e exclui lixeira, autenticação e campos privados aninhados', () => {
  const input = structuredClone(fixture);
  input.trash = [{ id: 'deleted', label: 'Segredo', patches: [] }];
  input.auth = { token: 'private-token' };
  input.campaigns[0].privateNotes = 'private-note';
  input.playerProfiles[0].email = 'private-email';
  input.campaigns[0].players[0].characters[0].journal = [
    {
      id: 'journal',
      title: 'Diário',
      dateTime: '2120',
      text: 'Público',
      moderation: 'private-moderation',
    },
  ];
  const snapshot = publicArchive(input);
  assert.deepEqual(validateArchive(snapshot), []);
  assert.equal(JSON.stringify(snapshot).includes('private-'), false);
  assert.equal('trash' in snapshot, false);
  assert.equal(
    snapshot.campaigns[0].timelines[0].logs[0].descrition,
    fixture.campaigns[0].timelines[0].logs[0].descrition,
  );
  assert.deepEqual(publicArchive(fixture), fixture);
});

function fakeGit({ conflict = false } = {}) {
  const writes = [];
  const fetcher = async (url, options) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    if (options.method !== 'GET') writes.push({ path, body });
    if (path.includes('/git/ref/')) return Response.json({ object: { sha: 'head' } });
    if (path.endsWith('/git/commits/head')) return Response.json({ tree: { sha: 'tree' } });
    if (path.endsWith('/contents/data/archive.json'))
      return Response.json({ sha: 'content-before' });
    if (path.endsWith('/git/trees')) return Response.json({ sha: 'tree-after' });
    if (path.endsWith('/git/commits')) return Response.json({ sha: 'commit-after' });
    if (path.includes('/git/refs/')) return Response.json({}, { status: conflict ? 422 : 200 });
    throw new Error('Unexpected ' + path);
  };
  return {
    writes,
    publisher: createPublisher({
      token: 'test',
      repository: 'owner/repo',
      branch: 'main',
      fetcher,
    }),
  };
}

test('publicação detecta acervo concorrente antes de escrever no GitHub', async () => {
  const { publisher, writes } = fakeGit();
  await assert.rejects(
    publisher.publish(fixture, 'old', async () => null),
    { status: 409 },
  );
  assert.equal(writes.length, 0);
});

test('publicação altera só conteúdo e marcador; atualização da branch nunca usa force', async () => {
  const { publisher, writes } = fakeGit();
  const result = await publisher.publish(fixture, 'content-before', async () => null);
  assert.equal(result.commit, 'commit-after');
  const tree = writes.find((call) => call.path.endsWith('/git/trees')).body;
  assert.deepEqual(
    tree.tree.map((entry) => entry.path),
    ['data/archive.json', 'public/publication.json'],
  );
  assert.equal(writes.at(-1).body.force, false);
  assert.equal(JSON.parse(tree.tree[1].content).id, result.publicationId);
  const competing = fakeGit({ conflict: true });
  await assert.rejects(
    competing.publisher.publish(fixture, 'content-before', async () => null),
    { status: 409 },
  );
});
