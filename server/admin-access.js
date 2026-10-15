export class EditorError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function isPublishableKey(key) {
  if (typeof key !== 'string') return false;
  if (key.startsWith('sb_publishable_')) return true;
  try {
    // Somente classifica a chave pública legada; não valida sessões ou assinaturas.
    return JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon';
  } catch {
    return false;
  }
}

export function requireOrigin(request, origin) {
  if (!origin || new URL(origin).protocol !== 'https:')
    throw new EditorError(503, 'Editor online ainda não configurado.');
  if (request.headers.origin !== origin || request.headers['sec-fetch-site'] === 'cross-site')
    throw new EditorError(403, 'Solicitação fora da origem autorizada.');
}

export async function requireAdmin(request, client, adminId) {
  if (!/^\d{15,22}$/.test(adminId || ''))
    throw new EditorError(503, 'Administrador ainda não configurado.');
  const match = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || '');
  if (!match) throw new EditorError(401, 'Entre com sua conta administrativa.');
  const { data, error } = await client.auth.getUser(match[1]);
  if (error || !data?.user) throw new EditorError(401, 'Sessão expirada. Entre novamente.');
  const identity = data.user.identities?.find((item) => item.provider === 'discord');
  // Não usar user_metadata, nome de usuário ou e-mail: podem ser alterados.
  if (!identity || String(identity.provider_id || identity.identity_data?.sub) !== adminId)
    throw new EditorError(403, 'Esta conta não tem acesso ao editor.');
  return data.user.id;
}
