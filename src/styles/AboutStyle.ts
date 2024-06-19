import styled from 'styled-components';

export const AboutStyle = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    padding: 20px;
    background-color: #051923;
    height: 100vh;
    
    h1 , p {
        font-size: 2rem;
        color: white;
        padding: 20px;
    }
    span {
        color: #f5c518;
    }
    h3 {
        font-size: 1.5rem;
        color: white;
        padding: 20px;
    }
`;

export const AboutCharacter = styled.div`
    padding: 20px;
    background-color: #a4b8b6;
    border-radius: 10px;
    
    p {
        font-size: 14px;
        color: #274b5b;
        padding: 5px;
    }
`;
