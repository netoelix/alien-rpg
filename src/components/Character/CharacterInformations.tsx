import { useState } from 'react';
import { PlayerGrid } from '../../styles/PlayerStyle';
import CharacterAbout from './CharacterAbout';
import CharacerImg from './CharacterImg';

interface CharacterInformationProps {
  playerId: string;
  characterName: string;
  profession: string;
  codname: string;
  images: string;
  about: string | undefined;
}

function CharacterInformations({
  playerId,
  characterName,
  profession,
  codname,
  images,
  about,
}: CharacterInformationProps) {
  const [isContentVisible, setContentVisible] = useState(false);

  return (
    <section>
      <PlayerGrid>
        <button className="player" onClick={ () => setContentVisible(!isContentVisible) }>
          <p>Jogador</p>
          {' '}
          {playerId}
        </button>
        {isContentVisible && (
          <>
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
          </>
        )}
      </PlayerGrid>
    </section>
  );
}

export default CharacterInformations;
