import styled from 'styled-components';

export const PlayerStile = styled.div`
    margin: 30px;
    padding: 20px;
    background-color: #051923;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    
        section {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
        }

    h3 {
        font-size: 1.5rem;
        color: white;
    }
    
    p {
        font-size: 1rem;
        color: white;
    }
    
    img {
        width: 300px;
        height: 300px;
        border-radius: 50%;
        margin: 10px 0;
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

export const PlayerDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin: 25px;
    padding: 15px;
    background-color: #003554;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    width: 400px;
    
    span {
    font-size: 0.8rem;
    color: white;
    }
`;
