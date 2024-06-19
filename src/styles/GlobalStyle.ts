import { createGlobalStyle, keyframes } from 'styled-components';

const Gradient = keyframes`
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
`;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: black;
    font-family: sans-serif;
    body {
      background: linear-gradient(120deg, rgba(3,5,4,1) 25%, rgba(39,75,91,1) 100%);
      background-size: 200% 200%;
      animation: ${Gradient} 20s ease infinite;
    }
  }
`;

export default GlobalStyle;
