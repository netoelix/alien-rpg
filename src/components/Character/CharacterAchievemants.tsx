import { AchievementsContainer } from '../../styles/PlayerStyle';

function CharacterAchievemants({ achievements }) {
  return (
    <div>
      <p>
        Conquistas do jogador:
        {' '}
        {achievements.map(({ id, description, name }) => (
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
