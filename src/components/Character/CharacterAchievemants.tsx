import { AchievementsContainer } from '../../styles/PlayerStyle';

function CharacterAchievemants({ achievements }: any) {
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
      <h1>
        Conquistas do jogador
      </h1>
      <div>
        { achievements.map(({ id, description, name }: any) => (
          <p key={ id } className={ getAchievementClass(name) }>
            <span>
              {'Conquista: '}
              {name}
              {' - Requisito: '}
              {description}
            </span>
          </p>
        ))}
      </div>
    </AchievementsContainer>
  );
}

export default CharacterAchievemants;
