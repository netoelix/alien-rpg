import { PlayerDetails } from '../../styles/PlayerStyle';

function CharacterInformations({
  playerId,
  characterName,
  profession,
  codname,
}) {
  return (
    <section>
      <PlayerDetails>
        <h3>
          Jogador:
          {' '}
          {playerId}
        </h3>
        <p>
          Personagem:
          {' '}
          {characterName}
        </p>
        <p>
          Profissão:
          {' '}
          {profession}
        </p>
        <p>
          Codnome:
          {' '}
          {codname}
        </p>
      </PlayerDetails>
    </section>
  );
}

export default CharacterInformations;
