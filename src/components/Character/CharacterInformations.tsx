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
          <p>Jogador</p>
          {' '}
          {playerId}
        </h3>
        <p className="character">
          <span>Personagem</span>
          {' '}
          {characterName}
        </p>
        <CharacerImg
          images={ images }
          characterName={ characterName }
        />
        <p className="profession">
          <span>Profissão</span>
          {' '}
          {profession}
        </p>
        <p className="codename">
          <span>Codnome</span>
          {' '}
          {codname}
        </p>
      </PlayerGrid>
    </section>
  );
}

export default CharacterInformations;
