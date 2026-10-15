import { useEffect, useState } from 'react';
import { authClient, onlineJson, clearPrivateDrafts } from './online-client.js';

export default function AdminGate({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Conferindo acesso…');
  useEffect(() => {
    let active = true;
    let subscription;
    async function check(session) {
      if (!session) {
        if (active) {
          setAuthorized(false);
          setReady(true);
          setMessage('Entre com a conta do Discord autorizada pelo administrador.');
        }
        return;
      }
      try {
        await onlineJson('session');
        if (active) {
          setAuthorized(true);
          setReady(true);
          setMessage('');
        }
      } catch (error) {
        if (active) {
          setAuthorized(false);
          setReady(true);
          setMessage(error.message);
        }
      }
    }
    authClient()
      .then(async (client) => {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        await check(data.session);
        if (!active) return;
        // Callback não aguarda chamadas de autenticação (evita bloqueio interno do SDK).
        subscription = client.auth.onAuthStateChange((_event, session) => {
          setTimeout(() => check(session), 0);
        }).data.subscription;
        const url = new URL(window.location.href);
        if (url.searchParams.has('code') || url.searchParams.has('admin')) {
          url.searchParams.delete('code');
          url.searchParams.delete('admin');
          url.hash = '#/editor';
          window.history.replaceState(null, '', url);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(error.message);
          setReady(false);
        }
      });
    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);
  async function signIn() {
    try {
      const client = await authClient();
      const { error } = await client.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: window.location.origin + '/?admin=1' },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function signOut() {
    if (!window.confirm('Sair do editor? Rascunhos não salvos neste navegador serão removidos.'))
      return;
    await (await authClient()).auth.signOut({ scope: 'local' });
    clearPrivateDrafts();
    window.location.assign('/');
  }
  return authorized ? (
    <>
      <div className="admin-session">
        <span>ACESSO ADMINISTRATIVO</span>
        <button onClick={signOut}>SAIR</button>
      </div>
      {children}
    </>
  ) : (
    <section className="panel admin-login">
      <h1>Editor online</h1>
      <p role="status">{message}</p>
      {ready && <button onClick={signIn}>ENTRAR COM DISCORD</button>}
      <p>
        Somente a conta autorizada pode editar. Jogadores enviam diários pelo formulário, sem
        cadastro.
      </p>
      <a href="/">VOLTAR AO SITE</a>
    </section>
  );
}
