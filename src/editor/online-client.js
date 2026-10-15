import { createClient } from '@supabase/supabase-js';
let clientPromise;
export async function authClient() {
  clientPromise ??= (async () => {
    const response = await fetch('/api/editor?action=config', { cache: 'no-store' });
    if (!response.ok) throw new Error('Não foi possível consultar a configuração.');
    const config = await response.json();
    if (!config.configured)
      throw new Error(
        'O editor online está em preparação. As configurações de acesso ainda não foram ativadas.',
      );
    return createClient(config.url, config.key, {
      auth: {
        flowType: 'pkce',
        storage: window.sessionStorage,
        storageKey: 'alien-admin-auth',
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  })();
  return clientPromise;
}
export async function onlineRequest(action, options = {}) {
  const client = await authClient();
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) throw new Error('Entre com sua conta administrativa.');
  return fetch(`/api/editor?action=${action}`, {
    ...options,
    cache: 'no-store',
    headers: { ...options.headers, Authorization: `Bearer ${data.session.access_token}` },
  });
}
export async function onlineJson(action, options) {
  const response = await onlineRequest(action, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Operação indisponível.');
  return result;
}
export function clearPrivateDrafts() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    for (const key of Object.keys(storage)) {
      if (/^alien-(editor|journal|draft-preview|map)/.test(key)) storage.removeItem(key);
    }
  }
}
