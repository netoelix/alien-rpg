import { AchievementsContainer } from '../styles/AchievementsStyle';
import MedalIconBasic from '../assets/svg/MedalIconBasic.svg';

interface Achievement {
  description: string;
  name: string;
}

interface AchievementsProps {
  achievements: Achievement[];
}

function Achievements({ achievements }: AchievementsProps) {
  return (
    <AchievementsContainer className="player-achievements">
      <div className="info-achievements">
        {achievements.map((achievement, index) => (
          <div key={ index } className="achievements">
            <h3>{achievement.name}</h3>
            <p>{achievement.description}</p>
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
