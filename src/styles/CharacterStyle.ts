import styled from 'styled-components';

export const CharacterStyle = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-around;
    align-items: center;
    width: 1200px;;
    height:250px;
    background-color: #142E15;
    border: 8px solid #16B769;
    border-end-end-radius: 8rem;
    border-start-end-radius: 4rem;
    border-top-left-radius: 150px;
    border-bottom-left-radius: 150px;
    margin: 70px 0px;
    
    .info-character {
        display: flex;
        flex-direction: column;
        h2 {
            color: white;
        }
        p {
            color: white;
        }
    }
    
    .image-character {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        background-color: #16B769;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        margin-right: 200px;
        h2 {
            color: white;
        }
        p {
            color: white;
        }
    }
    
    .bio-character {
        display: flex;
        flex-direction: column;
        
        h2 {
            color: white;
        }
        p {
            color: white;
        }
    }
    `;
