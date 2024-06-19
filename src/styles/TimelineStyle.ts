import styled from 'styled-components';

export const TimelineText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    margin-bottom: 20px;
    
    h1 {
        font-size: 2rem;
        color: white;
        padding: 20px;
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
  margin: 20px 0;
  width: 100%;
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
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.5s linear;
    background-color: #f5c518;
    border-radius: 5px;
    width: 300px;
    margin-top: 20px;
  }

  .description-text.open {
    visibility: visible;
    opacity: 1;
  }
  .text-resume {
    overflow-y: auto;
    max-height: 400px;
  }
  `;

export const EventDate = styled.p`
  margin: 0;
  padding: 10px;
  background: white;
  border: 1px solid black;
  border-radius: 5px;
  text-align: center;
`;
