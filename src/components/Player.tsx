import { data } from '../assets/data';
import { PlayerAllInformations, PlayerTitle } from '../styles/PlayerStyle';
import CharacterAchievemants from './Character/CharacterAchievemants';
import CharacterInformations from './Character/CharacterInformations';

function Player() {
  return (
    <div>
      <PlayerTitle>Jogadores</PlayerTitle>
      {
        data.map(({ playerId, characterName, profession,
          codname, images, achievements, about }) => (
            <PlayerAllInformations key={ playerId }>
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
            </PlayerAllInformations>
        ))
      }
    </div>
  );
}

export default Player;
