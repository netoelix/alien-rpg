import { data } from '../assets/data';
import { PlayerStile, AchievementsContainer, PlayerDetails } from '../styles/PlayerStyle';

function Player() {
  return (
    <div>
      {
        data.map(({ playerId, characterName, profission,
          codname, images, achievements }) => (
            <PlayerStile key={ playerId }>
              <section>
                <PlayerDetails>
                  <h3>
                    Jogador:
                    {' '}
                    {playerId}
                  </h3>
                  <p>
                    Personagem:
                    {' '}
                    {characterName}
                  </p>
                  <p>
                    Profissão:
                    {' '}
                    {profission}
                  </p>
                  <p>
                    Codnome:
                    {' '}
                    {codname}
                  </p>
                </PlayerDetails>
                <img src={ images } alt={ characterName } />
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
              </section>
            </PlayerStile>
        ))
      }
    </div>
  );
}

export default Player;
