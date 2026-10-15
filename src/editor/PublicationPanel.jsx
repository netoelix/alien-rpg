import { useState } from 'react';
import { onlineJson } from './online-client.js';

export function PublicationPanel({ revision, contentSha, dirty }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [publication, setPublication] = useState(null);
  const [history, setHistory] = useState([]);
  async function publish() {
    if (
      !window.confirm(
        'Publicar o acervo salvo? Campanhas, textos, diários e imagens ativos serão públicos. Lixeira e histórico permanecem privados.',
      )
    )
      return;
    setBusy(true);
    try {
      const result = await onlineJson('publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision, contentSha }),
      });
      setPublication(result);
      setMessage(
        result.warning ||
          'Enviado ao GitHub. A Vercel está preparando a publicação; a versão anterior continua disponível.',
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function checkPublication() {
    try {
      const response = await fetch(`/publication.json?check=${Date.now()}`, { cache: 'no-store' });
      const current = response.ok ? await response.json() : null;
      setMessage(
        current?.id === publication.publicationId
          ? 'Publicação confirmada no site. Recarregue o editor antes da próxima publicação.'
          : 'A nova versão ainda não foi confirmada. Confira a implantação no painel da Vercel antes de tentar novamente.',
      );
    } catch {
      setMessage('Não foi possível confirmar a publicação. Confira o painel da Vercel.');
    }
  }
  async function loadHistory() {
    try {
      setHistory((await onlineJson('history')).entries);
      setMessage(
        'Histórico carregado. Baixe uma versão e use Importar backup para revisá-la antes de salvar.',
      );
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function download(revision) {
    try {
      const { archive } = await onlineJson(`backup&revision=${encodeURIComponent(revision)}`);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `alien-backup-${revision}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <section className="panel">
      <h2>Publicação e recuperação</h2>
      <p>
        Salvar guarda o rascunho privado. Publicar envia os registros ativos para o site. Exporte
        backups também para fora deste serviço.
      </p>
      <div className="actions">
        <button disabled={busy || dirty || !contentSha || Boolean(publication)} onClick={publish}>
          PUBLICAR ACERVO SALVO
        </button>
        {publication && <button onClick={checkPublication}>CONFERIR PUBLICAÇÃO</button>}
        <button onClick={loadHistory}>VER HISTÓRICO</button>
      </div>
      {!contentSha && <p>A conexão de publicação ainda não está disponível.</p>}
      {dirty && <p>Salve as alterações antes de publicar.</p>}
      {message && <p role="status">{message}</p>}
      {history.length > 0 && (
        <ul>
          {history.map((entry) => (
            <li key={entry.revision}>
              <button onClick={() => download(entry.revision)}>
                BAIXAR BACKUP · {new Date(entry.saved_at).toLocaleString('pt-BR')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
