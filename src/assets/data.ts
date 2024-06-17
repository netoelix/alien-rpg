import { stressAchievements, eliminationsAchievements, eliminationsXenomorphAchievements,
  eliminationsNeomorphAchievements,
  eliminationsLocalFaunaAchievements, eliminationsMechanicalAchievements,
  eliminationsInnocentsAchievements, explorationAchievements,
  explorationStarSystemsAchievements,
  explorationPlanetsAchievements, specialExplorationAchievements,
  specialEliminationsAchievements,
  xenomorphAttacksAchievements, specialAchievements } from './achievements';
import tokenAndré from './tokens/TrishaMonroe.png';
import tokenFernando from './tokens/HarperJammer.png';
import tokenBruno from './tokens/SeanBean.png';

export const data = [
  {
    playerId: 'André',
    characterName: 'Trisha Monroe',
    profission: 'Comtech Marine',
    codname: 'Grey Weasel',
    images: tokenAndré,
    achievements: [
      stressAchievements[0],
      eliminationsAchievements[0],
      explorationStarSystemsAchievements[0],
      explorationPlanetsAchievements[0],
    ],
  },
  {
    playerId: 'Fernando (Gelatto)',
    characterName: 'Harper "Offroad" Jammer',
    profission: 'Piloto',
    codname: 'Green Weasel',
    images: tokenFernando,
    achievements: [
      stressAchievements[0],
      eliminationsAchievements[0],
      explorationStarSystemsAchievements[0],
      explorationPlanetsAchievements[0],
    ],
  },
  {
    playerId: 'Bruno',
    characterName: 'Sean "Night Rider" Bean',
    profission: 'Fuzileiro',
    codname: 'Black Weasel',
    images: tokenBruno,
    achievements: [
      explorationStarSystemsAchievements[0],
      explorationPlanetsAchievements[0],
    ],
  },
];
