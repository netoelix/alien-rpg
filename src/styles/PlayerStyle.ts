import styled from 'styled-components';

export const PlayerStile = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    margin: 25px;
    background-color: #051923;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    /* border: 25px solid #003554; */
    
    section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
    }
    
    img {
        width: 300px;
        height: 300px;
        border-radius: 50%;
        margin: 10px 0;
        border: 5px solid #003554;
    }
`;

export const AchievementsContainer = styled.div`

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 25px;
    padding: 15px;
    background-color: #006494;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    width: 400px;
    span {
    font-size: 0.8rem;
    color: white;
    }
`;

export const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: 0fr;
  grid-template-rows: auto auto auto auto;
  gap: 5px 0px;
  padding: 20px;
  place-items: center;

  h3 {
        font-size: 1.5rem;
        color: #274b5b;
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
    clip-path: polygon(10% 0%, 90% 0%, 100% 
        20%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 0% 20%);
    text-align: center;
  }

  .player {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    height: 100px;
  }

  .info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-column: 1 / 2; /* Ajustado para a primeira coluna */
  grid-row: 2 / 3; /* Ajustado para a mesma linha que a imagem */
}

.character, .profession, .codename {
  clip-path: polygon(10% 0%, 90% 0%, 100% 0%, 100% 100%, 90% 100%, 10% 100%, 0% 80%, 0% 20%);
  margin-top: 15px;
  height: 50px;
}

  .character {
  grid-column: 1 / 2; /* Ajustado para a primeira coluna */
  grid-row: 2 / 3; /* Ajustado para a mesma linha que a imagem */
  height: 50px;
  justify-self: center; /* Mantido para centralizar horizontalmente */
}

.profession {
  grid-column: 1 / 2; /* Ajustado para a primeira coluna */
  grid-row: 2 / 3; /* Ajustado para a mesma linha que a imagem */
  height: 50px;
  justify-self: center; /* Mantido para centralizar horizontalmente */
}

.codename {
  grid-column: 1 / 2; /* Ajustado para a primeira coluna */
  grid-row: 2 / 3; /* Ajustado para a mesma linha que a imagem */
  height: 50px;
  justify-self: center; /* Mantido para centralizar horizontalmente */
}

  .text-about {
    grid-column: 3 / 3;
    grid-row: 1 / 4;
    height: 500px;
    width: 500px;
    overflow-y: auto;
  }
  .image {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  align-self: center;
  justify-self: center;
}
`;
