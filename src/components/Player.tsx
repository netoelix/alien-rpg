import { data } from '../assets/data';

function Player() {
  return (
    <div>
      {
        data.map(({ id, characterName, profission, codname, images }) => (
          <section key={ id }>
            <h3>
              Jogador:
              {' '}
              {id}
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
          </section>
        ))
      }
    </div>
  );
}

export default Player;
