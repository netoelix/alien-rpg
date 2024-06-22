import { CharacterStyle } from '../styles/CharacterStyle';

function Character() {
  return (
    <CharacterStyle className="player-character">
      <div className="info-character">
        <h2>Nome</h2>
        <p>Nome do jogador</p>
      </div>
      <div className="image-character">
        <h2>Imagem</h2>
        <p>Imagem do personagem</p>
      </div>
      <div className="bio-character">
        <h2>Bio</h2>
        <p>Bio do personagem</p>
      </div>
    </CharacterStyle>
  );
}

export default Character;
