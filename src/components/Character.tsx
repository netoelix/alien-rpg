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
          <p>Personagem</p>
          <h3>{characterName}</h3>
        </div>
        <div>
          <p>Codinome</p>
          <h3>{codname}</h3>
        </div>
        <div>
          <p>Profissão</p>
          <h3>{profession}</h3>
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
