import styled from 'styled-components';

export const PlayerAllInformations = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    align-content: center;
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
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    align-content: center;
    background-color: #a4b8b6;
    border-radius: 10px;
    

    div {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      align-content: center;
      overflow-y: auto;
      max-height: 200px;
    }

    h1 {
      font-size: 1.5rem;
      color: #274b5b;
      font-weight: bold;
      background-color: #a4b8b6;
      border-radius: 10px;
      border: none;
      padding: 10px;
    }
    
    p {
      background-color: #006494;
      border-radius: 10px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      width: 400px;
      margin: 5px;
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

export const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  align-content: center;
  padding: 20px;

  h1 {
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
    clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100%
      80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
    text-align: center;
  }

  .player {
    height: 100px;
  }


`;

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;

    .character, .profession, .codename {
      margin: 15px;
      padding: 15px;
      position: absolute;
      background: white;
      padding: 10px;
      z-index: 1;
      background-color: #a4b8b6;
      width: 300px;
    }

    .character {
      right: 550px;
      top: 50px;
    }

    .profession {
      right: 550px;
      top: 150px;
    }

    .codename {
      right: 550px;
      top: 250px;
    }

    .text-about {
    height: 300px;
    width: 300px;
    overflow-y: auto;
    margin: 15px 15px 15px 0px;
    }
    .image {
      width: 300px;
      height: 300px;
      margin: 15px 0px 15px 15px;
      position: relative;
      z-index: 2;
      background-color: #a4b8b6;
      border-top-left-radius: 50%;
      border-bottom-left-radius: 50%;
    }
`;

export const PlayerTitle = styled.h1`
    color: white;
    text-align: center;
    padding-top: 20px;
`;
