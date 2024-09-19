import styled from 'styled-components';

export const AchievementsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-around;
    align-items: center;
    border-end-end-radius: 8rem;
    border-start-end-radius: 4rem;
    border-top-left-radius: 150px;
    border-bottom-left-radius: 150px;
    margin: 70px 0px;

    select {
        width: 160px;
        height: 30px;
        border-radius: 5px;
        margin: 10px;
        border: 1px solid #12B866;
        background-color: #152E1B;
        color: #fff;
    }

    .info-achievements {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        flex-wrap: wrap;

        .achievements {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-around;
            align-content: space-between;
            flex-wrap: wrap;
            width: 45%;
            height: 110px;
            background-size: 200% 100%;
            border: 2px solid #12B866;
            margin: 5px;
            padding: 5px;
            box-shadow: 0px 0px 15px 5px rgba(0,0,0,0.75);
            margin: 10px;
            background-color: #152E1B;

            div {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                align-content: center;
                flex-wrap: wrap;
            }
            p {
                padding-left: 10px;
                font-size: 25px;
                width: 80%;
                color: #fff;
                word-wrap: break-word;
                word-break: break-word;
            }

            h3 {
                padding-left: 10px;
                font-size: 1rem;
                color: #142E15;
                text-align: center;
                color: #fff;
            }

            .achievements-img {
                height: 100%;
                background-color: #11633F;
            }

            img {
                width: 70px;
                height: 70px;
            }
        }
    }

    @media screen and (max-width: 1200px) {
        height: 25%;
        .inputs-container {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            align-content: center;
            margin: 10px;
        }
        .info-achievements {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            align-content: center;
            .achievements {
                width: 95%;
                height: 145px;
                h3 {
                    font-size: 1rem;
                    width: 70%;
                }
                p {
                    font-size: 1.3rem;
                    text-align: center;
                    width: 70%;
                }
                .achievements-img {
                    height: 100%;
                    background-color: #11633F;
                }
            }
        }
    }
`;
