import { AchievementsContainer } from '../styles/AchievementsStyle';

interface AchievementsProps {
  achievements: Array<{
    medal: string | undefined;
    character: any; name: string, description: string
  }>;
  characterIndex: number;
}

function Achievements({ achievements, characterIndex }: AchievementsProps) {
  return (
    <AchievementsContainer className="player-achievements">
      <div className="info-achievements">
        {achievements.map((achievement, index) => (
          <div key={ index } className="achievements">
            <h3>{achievement.name}</h3>
            <p>{achievement.description}</p>
            <p>{achievement.character[characterIndex].date}</p>
            <div className="achievements-img">
              <img src={ achievement.medal } alt={ achievement.description } />
            </div>
          </div>
        ))}
      </div>
    </AchievementsContainer>
  );
}

export default Achievements;
