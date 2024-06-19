import { PlayerGrid } from '../../styles/PlayerStyle';
import CharacerImg from './CharacterImg';

interface CharacterInformationProps {
  playerId: string;
  characterName: string;
  profession: string;
  codname: string;
  images: string;
}

function CharacterInformations({
  playerId,
  characterName,
  profession,
  codname,
  images,
}: CharacterInformationProps) {
  return (
    <section>
      <PlayerGrid>
        <h3 className="player">
          Jogador:
          {' '}
          {playerId}
        </h3>
        <p className="character">
          Personagem:
          {' '}
          {characterName}
        </p>
        <CharacerImg
          images={ images }
          characterName={ characterName }
        />
        <p className="profession">
          Profissão:
          {' '}
          {profession}
        </p>
        <p className="codename">
          Codnome:
          {' '}
          {codname}
        </p>
      </PlayerGrid>
    </section>
  );
}

export default CharacterInformations;
