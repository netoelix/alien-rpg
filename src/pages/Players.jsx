import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext.jsx';
import {
  Breadcrumbs,
  Eyebrow,
  RouteLink,
  CharacterCards,
  AwardCards,
  MissionFolders,
  CollapsibleSection,
} from '../components/Common.jsx';

export function PlayersPage() {
  const { players, playerAwards, campaign } = useCampaign();
  return (
    <>
      <Breadcrumbs>Jogadores</Breadcrumbs>
      <Eyebrow>Participantes / {campaign.title}</Eyebrow>
      <h1>Jogadores</h1>
      <p className="lead list-intro">
        Personagens, histórias e conquistas de quem construiu esta campanha.
      </p>
      <div className="grid">
        {players.map((player, id) =>
          player.mascot ? null : (
            <RouteLink key={player.playerId} to={`player/${id}`} className="card">
              <Eyebrow>Participante {String(id + 1).padStart(2, '0')}</Eyebrow>
              <h3>{player.playerId}</h3>
              <p className="muted">
                {player.characters.length} personagem(ns) · {playerAwards(id).length} conquistas
              </p>
            </RouteLink>
          ),
        )}
      </div>
    </>
  );
}

const categories = [
  ['Combat', 'Combate'],
  ['Stress', 'Estresse'],
  ['Exploration', 'Exploração'],
  ['Survival', 'Sobrevivência'],
  ['Unique', 'Únicas'],
];

export function PlayerPage({ id }) {
  const { players, characters, timelines, playerAwards, awardDate, relatedTo, campaign } =
    useCampaign();
  const { playerProfile, profileAwards, playerCampaigns } = useCampaign();
  const player = players[id];
  const profile = playerProfile(id);
  const globalAwards = profileAwards(id);
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('new');
  const playerCharacters = characters.filter((character) => character.playerId === id);
  const relatedLogs = timelines
    .map((log, logId) => ({ log, id: logId }))
    .filter(({ log }) => playerCharacters.some((character) => relatedTo(log, character)));
  const dateKey = (award) => awardDate(award, id).split('/').reverse().join('');
  const awards = playerAwards(id)
    .filter((award) => !category || award.category === category)
    .sort((first, second) => dateKey(first).localeCompare(dateKey(second)));
  if (order === 'new') awards.reverse();

  return (
    <>
      <Breadcrumbs>{player.playerId}</Breadcrumbs>
      <Eyebrow>Registro de jogador</Eyebrow>
      <h1>{player.playerId}</h1>
      <p className="lead">
        {profile?.biography ||
          'Participante de ' + campaign.title + '. Perfil pessoal ainda não preenchido.'}
      </p>
      <div className="stats">
        <div>
          <b>{player.characters.length}</b>
          <small>PERSONAGENS NESTA CAMPANHA</small>
        </div>
        <div>
          <b>{playerAwards(id).length}</b>
          <small>CONQUISTAS REGISTRADAS</small>
        </div>
      </div>
      <div className="section-head">
        <h2>Campanhas deste jogador</h2>
      </div>
      <div className="grid">
        {playerCampaigns(id).map((entry) => (
          <RouteLink
            className="card"
            key={entry.campaign.id}
            to={`c/${entry.campaign.id}/player-characters/${entry.playerIndex}`}
          >
            <h3>{entry.campaign.title}</h3>
            <p className="muted">
              {entry.campaign.players[entry.playerIndex].characters.length} personagem(ns) →
            </p>
          </RouteLink>
        ))}
      </div>
      <div className="section-head">
        <h2>Personagens nesta campanha</h2>
      </div>
      <div className="grid">
        <CharacterCards characters={playerCharacters} />
      </div>
      <CollapsibleSection title="Conquistas do jogador" count={awards.length}>
        <p className="muted small-text">
          As conquistas abaixo pertencem ao jogador. O arquivo anterior não identifica o personagem
          envolvido em cada concessão.
        </p>
        <div className="toolbar">
          <label>
            CATEGORIA
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Todas</option>
              {categories.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            ORDEM
            <select value={order} onChange={(event) => setOrder(event.target.value)}>
              <option value="new">Mais recentes primeiro</option>
              <option value="old">Mais antigas primeiro</option>
            </select>
          </label>
        </div>
        <div className="awards">
          <AwardCards awards={awards} playerId={id} />
        </div>
      </CollapsibleSection>
      {playerCampaigns(id).length > 1 ? (
        <>
          <CollapsibleSection
            title="Acervo de conquistas entre campanhas"
            count={globalAwards.length}
          >
            <p className="muted small-text">
              Cada conquista aparece uma vez no cadastro pessoal, com a origem dos registros.
            </p>
            <div className="awards">
              {globalAwards.length ? (
                globalAwards.map((award) => (
                  <article className="award" key={award.id}>
                    <img src={award.medal} alt={`Medalha ${award.rank}`} loading="lazy" />
                    <div>
                      <h3>{award.name || 'Conquista sem título'}</h3>
                      <p>{award.description}</p>
                      {award.occurrences.map((occurrence) => (
                        <p className="muted small-text" key={occurrence.campaignId}>
                          {occurrence.date} · {occurrence.campaignTitle}
                        </p>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty">Nenhuma conquista registrada.</div>
              )}
            </div>
          </CollapsibleSection>
        </>
      ) : null}
      <CollapsibleSection title="Missões relacionadas" count={relatedLogs.length}>
        <div className="folders">
          <MissionFolders entries={relatedLogs} />
        </div>
      </CollapsibleSection>
    </>
  );
}

export function PlayerCharactersPage({ id }) {
  const { players, characters, campaign } = useCampaign();
  const player = players[id];
  const entries = characters.filter((character) => character.playerId === id);
  return (
    <>
      <Breadcrumbs>Personagens de {player.playerId}</Breadcrumbs>
      <Eyebrow>{campaign.title} / Arquivo de pessoal</Eyebrow>
      <h1>Personagens de {player.playerId}</h1>
      <p className="lead list-intro">Os personagens deste jogador em {campaign.title}.</p>
      <div className="actions">
        <RouteLink to={`player/${id}`} className="button">
          ← PERFIL DO JOGADOR
        </RouteLink>
      </div>
      <div className="grid">
        {entries.length ? (
          <CharacterCards characters={entries} />
        ) : (
          <div className="empty">
            Nenhum personagem registrado para este jogador nesta campanha.
          </div>
        )}
      </div>
    </>
  );
}
