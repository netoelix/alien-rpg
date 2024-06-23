import styled from 'styled-components';

export const CharacterStyle = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-around;
    align-items: center;
    width: 95%;
    height:250px;
    background-color: #142E15;
    border: 8px solid #16B769;
    border-end-end-radius: 8rem;
    border-start-end-radius: 4rem;
    border-top-left-radius: 150px;
    border-bottom-left-radius: 150px;
    margin: 70px 0px;
    box-shadow: inset 0 0 10px #000000, 0px 0px 15px 5px rgba(0,0,0,0.75);
    
    .info-character {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
        height: 200px;
        margin-left: 60px;
        h3 {
            color: white;
            font-size: 1vw;
            text-align: end;
        }
        div {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
        }
        p {
            color: white;
            white-space: nowrap;
            font-weight: 400;
            font-size: 25px;
            text-align: end;
            font-family: 'Sevastopol', sans-serif;        
        }

        .character-codnome {
            margin-right: 40px;
        }
    }
    
    .image-character {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        box-shadow: 0px 0px 15px 17px rgba(0,0,0,0.75);
        img {
            width: 320px;
            height: 320px;
        }
    }
    
    .bio-character {
        display: flex;
        flex-direction: column;
        width: 600px;
        height: 200px;
        margin-right: 50px;
        padding: 10px;
        
        h3 {
            color: white;
            padding-bottom: 10px;
        }
        p {
            color: white;
            overflow-y: auto;
            padding-right: 10px;
            text-align: justify;
            font-size: 25px;
            font-family: 'Sevastopol', sans-serif;
        }
    }

    .bio-character p::-webkit-scrollbar {
    width: 10px;
    }

    .bio-character p::-webkit-scrollbar-track {
        background: #16B769;
    }

    .bio-character p::-webkit-scrollbar-thumb {
        background: #FFFFFF;
    }

    .bio-character p::-webkit-scrollbar-thumb:hover {
        background: #11633F;
    }
    `;
