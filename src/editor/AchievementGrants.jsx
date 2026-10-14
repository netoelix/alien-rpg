import { profileAchievements } from '../../data/player-profiles.js';

export function AchievementGrants({ archive, campaign, value, onChange }) {
  const update = (name, patch) =>
    onChange(
      value.character.map((grant) => (grant.name === name ? { ...grant, ...patch } : grant)),
    );
  return (
    <fieldset>
      <legend>Concessões nesta campanha</legend>
      <p className="muted small-text">
        Escolha o jogador e os personagens que realizaram o feito. Cada campanha distinta soma uma
        estrela ao jogador, até três. Personagens não herdam conquistas de outras campanhas.
      </p>
      {campaign.players
        .filter((player) => !player.mascot)
        .map((player) => {
          const grant = value.character.find((item) => item.name === player.playerId);
          const history = profileAchievements(archive, player.profileId).find(
            (item) => item.id === value.id,
          );
          return (
            <div className="grant" key={player.id}>
              <label className="editor-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(grant)}
                  disabled={!grant && !player.characters.length}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [
                            ...value.character,
                            { name: player.playerId, date: '', characterIds: [] },
                          ]
                        : value.character.filter((item) => item.name !== player.playerId),
                    )
                  }
                />
                {player.playerId}
              </label>
              <p className="muted small-text">
                {history
                  ? `${history.stars} estrela(s) em ${history.occurrences.length} campanha(s).`
                  : 'Ainda não conquistada.'}{' '}
                {!player.characters.length && 'Cadastre um personagem para conceder.'}
              </p>
              {grant && (
                <>
                  <label>
                    Data da concessão (DD/MM/AAAA)
                    <input
                      required
                      value={grant.date}
                      onChange={(event) => update(player.playerId, { date: event.target.value })}
                    />
                  </label>
                  {grant.characterIds === undefined && (
                    <p className="muted small-text">
                      Concessão antiga: personagem não informado. O histórico do jogador foi
                      preservado; selecione os participantes se souber quem recebeu.
                    </p>
                  )}
                  {player.characters.map((character) => (
                    <label className="editor-checkbox" key={character.id}>
                      <input
                        type="checkbox"
                        checked={Boolean(grant.characterIds?.includes(character.id))}
                        onChange={(event) =>
                          update(player.playerId, {
                            characterIds: event.target.checked
                              ? [...(grant.characterIds || []), character.id]
                              : grant.characterIds.filter((id) => id !== character.id),
                          })
                        }
                      />
                      {character.characterName}
                    </label>
                  ))}
                </>
              )}
            </div>
          );
        })}
    </fieldset>
  );
}
