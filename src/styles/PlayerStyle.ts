import styled from 'styled-components';

export const PlayerStile = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    margin: 25px;
    background-color: #051923;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    
    section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
    }
`;

export const AchievementsTitle = styled.h3`
    color: #274b5b;
`;

export const AchievementsContainer = styled.div`

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    button {
      font-size: 1.5rem;
      color: white;
      font-weight: bold;
      background-color: #006494;
      border-radius: 10px;
      border: none;
      padding: 10px;
    }
    
    p {
      background-color: #006494;
      border-radius: 10px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      width: 400px;
      margin: 25px;
      padding: 15px;
      font-weight: bold;
    }
    span {
    font-size: 0.8rem;
    color: white;

    }

    .normal {
      background-color: #006494;
      span {
          color: white;
        }
    }

    .ouro {
        background-color: #FFD700;
        span {
          color: #000000;
        }
    }

    .prata {
        background-color: #C0C0C0;
        span {
          color: #000000;
        }
    }

    .bronze {
        background-color: #CD7F32;
        span {
          color: #000000;
        }
    }

    .diamante {
        background-color: #E5E4E2;
        span {
          color: #000000;
        }
    }
`;

export const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: 0fr;
  grid-template-rows: auto auto auto auto;
  gap: 5px 0px;
  padding: 20px;
  place-items: center;

  button {
    font-size: 1.5rem;
    color: #274b5b;
    font-weight: bold;
      p {
        font-size: 0.8rem;
      }
    }
    
    p {
        font-size: 1rem;
        color: #274b5b;
    }
    
    span {
    font-size: 0.8rem;
    color: #274b5b;
    font-weight: bold;
    }

  .player, .character, .profession, .codename {
    background-color: #a4b8b6;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    width: 250px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    align-items: center;
    /* clip-path: polygon(10% 0%, 90% 0%, 100% 
        20%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 0% 20%); */
    clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100%
      80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
    text-align: center;
  }

  .player {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    height: 100px;
    cursor: pointer;
  }

  .info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-column: 1 / 2; /* Ajustado para a primeira coluna */
  grid-row: 2 / 3; /* Ajustado para a mesma linha que a imagem */
}

.character, .profession, .codename {
  /* clip-path: polygon(10% 0%, 90% 0%, 100% 0%,
     100% 100%, 90% 100%, 10% 100%, 0% 80%, 0% 20%); */
  clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100%
     80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
  margin: 20px 0px 20px 20px;
  height: 60px;
}

.character {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  justify-self: center;
}

.profession {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  justify-self: center;
}

.codename {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  justify-self: center;
}

.text-about {
  grid-column: 3 / 3;
  grid-row: 2 / 4;
  height: 300px;
  width: 300px;
  overflow-y: auto;
}
.image {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  align-self: center;
  justify-self: center;
  z-index: 1;
  width: 300px;
  height: 300px;
  margin: 15px;
}
`;
