import { Container, PlayerContainer } from '../../styles/PlayerStyle';
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
  return (
    <PlayerContainer>
      <h1 className="player">
        <p>Jogador</p>
        {' '}
        {playerId}
      </h1>
      <Container>
        <div>
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
        <CharacerImg
          images={ images }
          characterName={ characterName }
        />
        <CharacterAbout about={ about } />
      </Container>
    </PlayerContainer>
  );
}

export default CharacterInformations;
