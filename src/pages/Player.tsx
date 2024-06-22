import Character from '../components/Character';
import { PlayerStyle } from '../styles/PlayerStyle';

function Player() {
  return (
    <PlayerStyle>
      <section className="player-card">
        <div className="player-header">
          <h1>Jogador</h1>
          <h3>Consuistas</h3>
        </div>
        <div className="player-all-character">
          <Character />
          <Character />
        </div>
        <div className="player-final-card" />
      </section>
    </PlayerStyle>
  );
}

export default Player;
