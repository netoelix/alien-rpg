import { CharacterStyle } from '../styles/CharacterStyle';

interface CharacterProps {
  characterName: string;
  profession: string;
  codname: string;
  images: string;
  about: string;
}

function Character({ characterName, profession,
  codname, images, about }: CharacterProps) {
  return (
    <CharacterStyle className="player-character">
      <div className="info-character">
        <div>
          <h3>Personagem</h3>
          <p>{characterName}</p>
        </div>
        <div className="character-codnome">
          <h3>Codinome</h3>
          <p>{codname}</p>
        </div>
        <div>
          <h3>Profissão</h3>
          <p>{profession}</p>
        </div>
      </div>
      <div className="image-character">
        <img src={ images } alt={ characterName } srcSet="" />
      </div>
      <div className="bio-character">
        <h3>Bio</h3>
        <p>{ about }</p>
      </div>
    </CharacterStyle>
  );
}

export default Character;
