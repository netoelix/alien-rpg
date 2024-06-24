import { AchievementsContainer } from '../styles/AchievementsStyle';
import MedalIconBasic from '../assets/svg/MedalIconBasic.svg';

interface AchievementsProps {
  achievements: Array<{
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
              <img src={ MedalIconBasic } alt="" />
            </div>
          </div>
        ))}
      </div>
    </AchievementsContainer>
  );
}

export default Achievements;
