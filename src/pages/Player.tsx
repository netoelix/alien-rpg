import { useState } from 'react';
import Character from '../components/Character';
import { PlayerStyle } from '../styles/PlayerStyle';
import { data } from '../assets/data/data';
import Achievements from '../components/Achievements';
import MedalIconBasic from '../assets/svg/MedalIconBasic.svg';

function Player() {
  const [selectedButton, setSelectedButton] = useState('character');
  const [showComponentForPlayer, setShowComponentForPlayer] = useState<{
    [key: string]: string }>({});
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
  const handleShowComponent = (playerId: string, component: string) => {
    setShowComponentForPlayer((prevState) => ({
      ...prevState,
      [playerId]: component,
    }));
  };

  return (
    data.map(({ playerId, characterName, profession,
      codname, images, about, achievements }) => (
        <PlayerStyle key={ playerId }>
          <section
            className="player-container"
            style={
              { height: cardHeight[playerId] }
            }
          >
            <div className="player-header">
              <h1>{playerId}</h1>

              <div className="achievements-player">
                {
                achievements.slice(0, 3).map((achievement, index) => (
                  <div key={ index }>
                    <div>
                      <img src={ MedalIconBasic } alt={ achievement.description } />
                    </div>
                  </div>
                ))
              }
              </div>
            </div>
            {isVisible[playerId] && (
              <div className="player-card">
                <div className="button-container">
                  <div
                    className={ selectedButton === 'character'
                      ? 'selected' : 'unselected' }
                  />
                  <button
                    className="information-button"
                    onClick={ () => {
                      handleShowComponent(playerId, 'character');
                      setSelectedButton('character');
                    } }
                  >
                    Personagens
                  </button>
                  <div
                    className={ selectedButton === 'character'
                      ? 'selected' : 'unselected' }
                  />
                  <div
                    className={ selectedButton === 'achievements'
                      ? 'selected' : 'unselected' }
                  />
                  <button
                    className="information-button"
                    onClick={ () => {
                      handleShowComponent(playerId, 'achievements');
                      setSelectedButton('achievements');
                    } }
                  >
                    Conquistas
                  </button>
                  <div
                    className={ selectedButton === 'achievements'
                      ? 'selected' : 'unselected' }
                  />
                </div>
                <div className="player-all-character">
                  {showComponentForPlayer[playerId] === 'achievements' ? (
                    <Achievements achievements={ achievements } />
                  ) : (
                    <Character
                      characterName={ characterName }
                      profession={ profession }
                      codname={ codname }
                      images={ images }
                      about={ about }
                    />
                  )}
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
