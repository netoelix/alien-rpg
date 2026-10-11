import { useState } from 'react';
import {
  players,
  characters,
  timelines,
  playerAwards,
  awardDate,
  relatedTo,
} from '../../data/model.js';
import {
  Breadcrumbs,
  Eyebrow,
  RouteLink,
  CharacterCards,
  AwardCards,
  MissionFolders,
} from '../components/Common.jsx';

export function PlayersPage() {
  return (
    <>
      <Breadcrumbs>Jogadores</Breadcrumbs>
      <Eyebrow>Participantes / Fragmentos da Guerra</Eyebrow>
      <h1>Jogadores</h1>
      <p className="lead list-intro">
        Personagens, histórias e conquistas de quem construiu esta campanha.
      </p>
      <div className="grid">
        {players.map((player, id) =>
          id === 4 ? null : (
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
  const player = players[id];
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
        Participante de Fragmentos da Guerra. Perfil pessoal ainda não preenchido.
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
        <h2>Personagens nesta campanha</h2>
      </div>
      <div className="grid">
        <CharacterCards characters={playerCharacters} />
      </div>
      <div className="section-head spaced">
        <h2>Conquistas do jogador</h2>
        <span className="tag">TITULAR · JOGADOR</span>
      </div>
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
      <div className="section-head spaced">
        <h2>Missões relacionadas</h2>
      </div>
      <div className="folders">
        <MissionFolders entries={relatedLogs} />
      </div>
    </>
  );
}
