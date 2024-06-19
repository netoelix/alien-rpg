import { AchievementsContainer } from '../../styles/PlayerStyle';

function CharacterAchievemants({ achievements }: any) {
  return (
    <div>
      <p>
        Conquistas do jogador:
        {' '}
        {achievements.map(({ id, description, name }: any) => (
          <AchievementsContainer key={ id }>
            <span>
              {'Conquista: '}
              {name}
              {' - Requisito: '}
              {description}
            </span>
          </AchievementsContainer>
        ))}
      </p>
    </div>
  );
}

export default CharacterAchievemants;
