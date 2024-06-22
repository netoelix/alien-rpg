import styled from 'styled-components';

export const HomeStyle = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    background-color: #142E15;
    height: 100vh;
    color: white;
    h1 {
        font-size: 2.5vw;
        margin: 50px 0px;
        color: #16B769;
    }
    a {
        color: white;
        font-size: 1.5vw;
        text-decoration: none;
        border: 2px solid #16B769;
        padding: 10px 20px;
        border-radius: 8px;
        transition: 0.5s;
        &:hover {
            background-color: #16B769;
            color: black;
        }
    }
`;
