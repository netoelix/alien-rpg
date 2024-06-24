import { useState } from 'react';
import Character from '../components/Character';
import { PlayerStyle } from '../styles/PlayerStyle';
import { data } from '../assets/data/data';
import Achievements from '../components/Achievements';
import MedalIconBasic from '../assets/svg/MedalIconBasic.svg';
import { achievements } from '../assets/data/achievements';

function Player() {
  const [selectedButton, setSelectedButton] = useState<{ [key: string]: string }>({});
  const [showComponentForPlayer, setShowComponentForPlayer] = useState<{
    [key: string]: string }>({});
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>(
    data.reduce((acc, { playerId }) => ({ ...acc, [playerId]: false }), {}),
  );
  const [cardHeight, setCardHeight] = useState<{ [key: string]: string }>(
    data.reduce((acc, { playerId }) => ({ ...acc, [playerId]: '80px' }), {}),
  );
  const toggleVisibility = (playerId: string | any) => {
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

  const handleButtonClick = (playerId: string, buttonName: string) => {
    setSelectedButton((prevState) => ({
      ...prevState,
      [playerId]: buttonName,
    }));
    handleShowComponent(playerId, buttonName);
  };

  const findAchievementsForPlayer = (playerId: string) => {
    return achievements.filter((achievement) => achievement.character
      .some((char) => char.name === playerId));
  };

  const getPlayerIndex = (playerId: string) => {
    switch (playerId) {
      case 'André':
        return 0;
      case 'Fernando (Gelatto)':
        return 1;
      case 'Bruno':
        return 2;
      default:
        return 0;
    }
  };

  return (
    data.map(({ playerId, characterName, profession,
      codname, images, about }) => (
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
                {findAchievementsForPlayer(playerId).slice(0, 3)
                  .map((achievement, index) => (
                    <div key={ index }>
                      <div>
                        <img src={ MedalIconBasic } alt={ achievement.description } />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {isVisible[playerId] && (
              <div className="player-card">
                <div className="button-container">
                  <div
                    className={ selectedButton[playerId] === 'character'
                      ? 'selected' : 'unselected' }
                  />
                  <button
                    className="information-button"
                    onClick={ () => handleButtonClick(playerId, 'character') }
                  >
                    Personagens
                  </button>
                  <div
                    className={ selectedButton[playerId] === 'character'
                      ? 'selected' : 'unselected' }
                  />
                  <div
                    className={ selectedButton[playerId] === 'achievements'
                      ? 'selected' : 'unselected' }
                  />
                  <button
                    className="information-button"
                    onClick={ () => handleButtonClick(playerId, 'achievements') }
                  >
                    Conquistas
                  </button>
                  <div
                    className={ selectedButton[playerId] === 'achievements'
                      ? 'selected' : 'unselected' }
                  />
                </div>
                <div className="player-all-character">
                  {showComponentForPlayer[playerId] === 'achievements' ? (
                    <Achievements
                      achievements={ findAchievementsForPlayer(playerId) }
                      characterIndex={ getPlayerIndex(playerId) }
                    />
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
