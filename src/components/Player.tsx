import { data } from '../assets/data';

function Player() {
  return (
    <div>
      {
        data.map(({ playerId, characterName, profission,
          codname, images, achievements }) => (
            <section key={ playerId }>
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
              <img src={ images } alt={ characterName } />
              <p>
                Conquistas do jogador:
                {' '}
                {achievements.map(({ id, description, name }) => (
                  <div key={ id }>
                    <span>
                      {'Conquista: '}
                      {name}
                      {' - Requisito: '}
                      {description}
                    </span>
                  </div>
                ))}
              </p>
            </section>
        ))
      }
    </div>
  );
}

export default Player;
