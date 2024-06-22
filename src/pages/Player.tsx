import { useState } from 'react';
import Character from '../components/Character';
import { PlayerStyle } from '../styles/PlayerStyle';
import { data } from '../assets/data/data';

function Player() {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>(
    data.reduce((acc, { playerId }) => ({ ...acc, [playerId]: false }), {}),
  );
  const [cardHeight, setCardHeight] = useState<{ [key: string]: string }>(
    data.reduce((acc, { playerId }) => ({ ...acc, [playerId]: '80px' }), {}),
  );
  const toggleVisibility = (playerId: string) => {
    setIsVisible((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
    setCardHeight((prev) => ({
      ...prev,
      [playerId]: prev[playerId] === '80px' ? 'auto' : '80px',
    }));
  };

  return (
    data.map(({ playerId, characterName, profession, codname, images, about }) => (
      <PlayerStyle key={ playerId }>
        <section className="player-container" style={ { height: cardHeight[playerId] } }>
          <div className="player-header">
            <h1>{playerId}</h1>
            <h3>Conquistas</h3>
          </div>
          {isVisible[playerId] && (
            <div className="player-card">
              <div className="player-all-character">
                <Character
                  characterName={ characterName }
                  profession={ profession }
                  codname={ codname }
                  images={ images }
                  about={ about }
                />
              </div>
            </div>
          )}
          <button
            className="player-final-card"
            onClick={ () => toggleVisibility(playerId) }
          >
            Expandir / Recolher
          </button>
        </section>
      </PlayerStyle>
    ))
  );
}

export default Player;
