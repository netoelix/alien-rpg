import { PlayerGrid } from '../../styles/PlayerStyle';
import CharacterAbout from './CharacterAbout';
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
  about,
}: CharacterInformationProps) {
  return (
    <section>
      <PlayerGrid>
        <h3 className="player">
          <p>Jogador</p>
          {' '}
          {playerId}
        </h3>
        <div className="info-container">
          <p className="character">
            <span>Personagem</span>
            {' '}
            {characterName}
          </p>
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
        </div>
        <CharacterAbout about={ about } />
        <CharacerImg
          images={ images }
          characterName={ characterName }
        />
      </PlayerGrid>
    </section>
  );
}

export default CharacterInformations;
