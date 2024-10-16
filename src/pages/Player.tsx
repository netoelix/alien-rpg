import { useState } from 'react';
import Character from '../components/Character';
import { PlayerStyle } from '../styles/PlayerStyle';
import { data } from '../assets/data/data';
import Achievements from '../components/Achievements';
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
    setSelectedButton((prevState) => ({ ...prevState, [playerId]: 'character' }));
    setShowComponentForPlayer((prevState) => ({ ...prevState, [playerId]: 'character' }));
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

  function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  return (
    data.map(({ playerId, characters }) => (
      <PlayerStyle key={ playerId }>
        <section
          className="player-container"
          style={
              { height: cardHeight[playerId] }
            }
        >
          <header className="player-header">
            <h1>{playerId}</h1>

            <div className="achievements-player">
              {shuffleArray(findAchievementsForPlayer(playerId)).slice(0, 3)
                .map((achievement, index) => (
                  <div key={ index }>
                    <div>
                      <img src={ achievement.medal } alt={ achievement.description } />
                    </div>
                  </div>
                ))}
            </div>
          </header>
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
                  characters.map((character, index) => (
                    <Character
                      key={ index }
                      characterName={ character.characterName }
                      profession={ character.profession }
                      codname={ character.codname }
                      images={ character.images }
                      about={ character.about }
                    />
                  ))
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
