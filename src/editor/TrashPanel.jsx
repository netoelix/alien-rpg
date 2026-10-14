export function TrashPanel({ archive, onRestore, onDelete }) {
  return (
    <section>
      <h2>Lixeira</h2>
      <p>
        Itens removidos deixam de aparecer no rascunho. Salve os arquivos para guardar a lixeira
        junto do backup. A publicação só muda quando o projeto é publicado.
      </p>
      <p className="muted">
        A restauração preserva outras edições. Se o mesmo registro ou vínculo tiver mudado, será
        bloqueada para evitar sobrescrita. Não há exclusão definitiva nesta versão.
      </p>
      {!archive.trash?.length && <p className="empty">A lixeira está vazia.</p>}
      {(archive.trash || []).map((entry) => (
        <article className="card trash-item" key={entry.id}>
          <div>
            <h3>{entry.label}</h3>
            <p className="muted">Removido em {new Date(entry.deletedAt).toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={() => onRestore(entry.id)}>RESTAURAR</button>
        </article>
      ))}
      <h2 className="spaced">Cadastros globais de jogadores</h2>
      <p>
        Remover uma participação não exclui o cadastro global. Cadastros sem participação ativa
        podem ser enviados à lixeira abaixo.
      </p>
      {archive.playerProfiles.map((profile) => {
        const memberships = archive.campaigns.filter((campaign) =>
          campaign.players.some((player) => player.profileId === profile.id),
        );
        return (
          <article className="card trash-item" key={profile.id}>
            <div>
              <h3>{profile.name}</h3>
              <p className="muted">
                {memberships.length
                  ? `Participa de: ${memberships.map((campaign) => campaign.title).join(', ')}`
                  : 'Sem participação ativa'}
              </p>
            </div>
            <button
              disabled={memberships.length > 0}
              onClick={() =>
                onDelete(
                  { kind: 'profile', id: profile.id },
                  `Excluir o cadastro global de ${profile.name}? Ele será guardado na lixeira.`,
                )
              }
            >
              EXCLUIR CADASTRO GLOBAL
            </button>
          </article>
        );
      })}
    </section>
  );
}
