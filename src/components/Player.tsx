import { data } from '../assets/data';
import { PlayerStile } from '../styles/PlayerStyle';
import CharacterAchievemants from './Character/CharacterAchievemants';
import CharacerImg from './Character/CharacterImg';
import CharacterInformations from './Character/CharacterInformations';

function Player() {
  return (
    <div>
      {
        data.map(({ playerId, characterName, profession,
          codname, images, achievements }) => (
            <PlayerStile key={ playerId }>
              <CharacterInformations
                key={ playerId }
                playerId={ playerId }
                characterName={ characterName }
                profession={ profession }
                codname={ codname }
              />
              <CharacerImg
                key={ playerId }
                images={ images }
                characterName={ characterName }
              />
              <CharacterAchievemants
                key={ playerId }
                achievements={ achievements }
              />
            </PlayerStile>
        ))
      }
    </div>
  );
}

export default Player;
