import styled from 'styled-components';

export const TimelineText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    margin-bottom: 20px;
    height: 130vh;

    img {
        width: 100%;
        height: 130vh;
        object-fit: cover;
        position: absolute;
        z-index: -1;
        opacity: 0.4;
    }

    .blur-background {
      background: rgba(39, 75, 91, 0.5);
      backdrop-filter: blur(1px);
    }

    div {
      width: 100%;
    }

    h1 {
        font-size: 2rem;
        color: white;
        padding: 20px;
        width: 100%;  
        text-align: center;
    }
    p {
        font-size: 1rem;
        color: #274b5b;
        padding: 5px 20px;
    }
    span {
        color: #f5c518;
    }
    `;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 300px;
`;

export const TimelineLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: white;
  z-index: 1;
`;

export const EventContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;
  z-index: 2;
  flex-wrap: wrap;

  :hover {
      background: #f5c518;
      cursor: pointer;
  }
  p {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .event-container {
  position: relative;
  }

  .description-text {
    position: absolute;
    top: 60%;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.5s linear;
    background-color: #f5c518;
    border-radius: 5px;
    width: 300px;
    margin-top: 10px;
    margin-bottom: 20px;
    max-height: 350px;
    overflow-y: auto;
    border: 3px solid #274b5b;
  }

  .description-text.open {
    visibility: visible;
    opacity: 1;
  }
  .text-resume {
    min-height: 350px;
    border-radius: 5px;
  }
  `;

export const EventDate = styled.p`
  margin: 0;
  padding: 10px;
  background: white;
  border: 1px solid black;
  border-radius: 5px;
  text-align: center;

  p {
    padding: 5px;
  }
`;
