import styled from 'styled-components';
import pasta from '../assets/svg/pasta.svg';

export const TimeLineContainer = styled.main`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
    background-color: #152E1B;
    width: 100%;
    padding: 50px 0px;

    .time-lide-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        margin-bottom: 50px;
    }
    
    .time-line-folder {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        border: 2px solid #12B866;
        margin: 20px;
        background-image: url(${pasta});
        background-size: cover;
        background-position: center;
        width: 240px;
        height: 160px;

        h3 {
            color: #11633F;
        }
    }

    .time-line-resume {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        align-content: center;
        width: 80%
    }

    .time-line-header-mission {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        align-content: center;
        h1 {
            background-color: #12B866;
            border: 2px solid #fff;
            margin: 10px;
            padding: 5px;
        }
        h2 {
            background-color: #11633F;
            border: 2px solid #12B866;
            margin: 10px;
            padding: 5px;
        }

    }

    .time-line-description {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        align-content: center;
        border: 2px solid #12B866;
        margin: 10px;
        
        div {
            background-color: #12B866;
            height: 20px;
            width: 100%;
        }
        p {
            padding: 10px;
            text-align: justify;
            font-size: 25px;
        }
    }

    @keyframes slideBackground {
        0% {
            background-position: 0% 0%;
        }
        100% {
            background-position: 100% 0%;
        }
    }

    .corrompido {
        background-image: repeating-linear-gradient(
                45deg,
                #11633F,
                #11633F 1px,
                #0e5533 1px,
                #0e5533 2px,
                #12B866 2px,
                #12B866 3px
            );
        animation: slideBackground 1s linear infinite;
    }
    
    @media screen and (max-width: 1000px) {
        .time-lide-content {
        flex-direction: column;  
        }
        .time-line-folder {
            width: 220px;
            height: 150px;
        }
        .time-line-resume {
            width: 100%
        }
        .time-line-header-mission {
            width: 100%;
            h1 {
                width: 95%;
            }
            h2 {
                width: 95%;
            }
        }
    }
`;
