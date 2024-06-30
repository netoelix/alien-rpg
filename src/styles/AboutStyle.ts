import styled from 'styled-components';

export const AboutStyle = styled.div`

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 20px;
    margin-bottom: 20px;
    width:90%;
    
    h1 {
        font-size: 2rem;
        color: white;
        padding: 20px;
    }
    h2 {
        font-size: 1.5rem;
        color: white;
        padding: 20px;
    }
    h3 {
        font-size: 1.5rem;
        color: white;
        padding: 20px;
    }
    h4 {
        font-size: 1.2rem;
        color: white;
        padding: 20px;
    }
    p {
        font-size: 25px;
        color: white;
        padding: 5px 20px;
    }
    span {
        color: #f5c518;
    }
    a {
        color: #f5c518;
        text-decoration: none;
    }
    ul, ol {
    list-style-type: none;
    }
    @media screen and (max-width: 1000px) {
        width: 95%;
        padding: 5px;
        h1 {
            font-size: 35px;
            padding: 5px;
        }
        h2 {
        font-size: 30px;
        color: white;
        padding: 5px;
        }
        h3 {
            font-size: 27px;
            padding: 5px;
        }
        h4 {
            font-size: 25px;
            padding: 5px;
        }
        p {
            font-size: 23px;
            padding: 5px 15px;
        }
        span {
            font-size: 20px;
        }
        a {
            font-size: 15px;
        }
    }
`;

export const AboutCharacter = styled.div`
    padding: 20px;
    background-color: #a4b8b6;
    
    p {
        font-size: 14px;
        color: #274b5b;
        padding: 5px;
    }
`;
