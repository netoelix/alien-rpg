import { data } from '../assets/data';
import { PlayerStile } from '../styles/PlayerStyle';
import CharacterAchievemants from './Character/CharacterAchievemants';
import CharacterInformations from './Character/CharacterInformations';

function Player() {
  return (
    <div>
      {
        data.map(({ playerId, characterName, profession,
          codname, images, achievements, about }) => (
            <PlayerStile key={ playerId }>
              <CharacterInformations
                playerId={ playerId }
                characterName={ characterName }
                profession={ profession }
                codname={ codname }
                images={ images }
                about={ about }
              />
              <CharacterAchievemants
                achievements={ achievements }
              />
            </PlayerStile>
        ))
      }
    </div>
  );
}

export default Player;
