import { useState } from 'react';
import { AchievementsContainer } from '../../styles/PlayerStyle';

function CharacterAchievemants({ achievements }: any) {
  const [areAchievementsVisible, setAchievementsVisible] = useState(false);

  const getAchievementClass = (name: string) => {
    if (name.includes('Bronze')) {
      return 'bronze';
    } if (name.includes('Prata')) {
      return 'prata';
    } if (name.includes('Ouro')) {
      return 'ouro';
    } if (name.includes('Diamante')) {
      return 'diamante';
    }
    return 'normal';
  };

  return (
    <AchievementsContainer>
      <button onClick={ () => setAchievementsVisible(!areAchievementsVisible) }>
        Conquistas do jogador:
      </button>
      {areAchievementsVisible && achievements.map(({ id, description, name }: any) => (
        <p key={ id } className={ getAchievementClass(name) }>
          <span>
            {'Conquista: '}
            {name}
            {' - Requisito: '}
            {description}
          </span>
        </p>
      ))}
    </AchievementsContainer>
  );
}

export default CharacterAchievemants;
