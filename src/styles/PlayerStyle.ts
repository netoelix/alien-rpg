import styled from 'styled-components';

export const PlayerStyle = styled.main`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
    background-color: #152E1B;
    width: 100%;
    padding: 50px 0px;

    .player-container {
        width: 95%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        align-content: center;
        height: 500px;
        border-radius: 20px;
        box-shadow: 0px 0px 10px 2px rgba(0,0,0,0.75);

        .achievements-player {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            align-content: center;
            padding-left: 20px;
            padding-right: 20px;

            img {
                width: 40px;
                height: 40px;
                margin-right: 10px;
            }
        }
    }

    .player-card {
        background-color: #051923;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        align-content: center;
        box-shadow: inset 0 0 10px #000000;
    }

    .player-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        align-content: center;
        width: 100%;
        height: 50px;
        background-color: #16B769;
        border-top-right-radius: 20px;
        border-top-left-radius: 20px;
        h3 {
            padding-right: 20px;
            color: white;
        }
        h1 {
            padding-left: 20px;
            color: white;
            width: 340px;
        }
    }

    .button-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        align-content: center;
        width: 100%;
        height: 40px;

        .selected {
        background-color: white;
        width:20px;
        height: 20px;
        margin: 0px 10px;
    }

        .unselected {
            background-color: transparent;
            width:20px;
            height: 20px;
            margin: 0px 10px;
        }
    }
    
    .information-button {
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        padding: 10px;
        border-radius: 10px;
    }

    .player-all-character {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        align-content: center;
        width: 100%;
    }

    .player-final-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        width: 100%;
        height: 30px;
        border: none;
        background-color: #16B769;
        border-bottom-right-radius: 20px;
        border-bottom-left-radius: 20px;
    }
    @media screen and (max-width: 1200px) {
        .player-container {
            height: 400px;
        }
        .player-header {
            h3 {
                font-size: 10px;
            }
            h1 {
                font-size: 20px;
            }
        }
        .button-container {
            height: 50px;
            .information-button {
                font-size: 15px;
            }
        }
        .player-final-card {
            height: 25px;
        }
        .player-final-card {
            height: 35px;
        }
    }
    `;
