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
    padding: 50px;

    .player-card {
        background-color: #051923;
        width: 95%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        align-content: center;
        height: 500px;
        border-radius: 20px;
    }

    .player-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        align-content: center;
        width: 100%;
        height: 90px;
        background-color: #16B769;
        border-top-right-radius: 20px;
        border-top-left-radius: 20px;
        h1, h3 {
            padding-left: 20px;
            padding-right: 20px;
            color: white;
        }
    }

    .player-all-character {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        align-content: center;
        width: 100%;
        overflow-y: auto;
    }

    .player-final-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        width: 100%;
        height: 50px;
        background-color: #16B769;
        border-bottom-right-radius: 20px;
        border-bottom-left-radius: 20px;
    }
    `;
