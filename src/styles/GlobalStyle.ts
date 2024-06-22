import { createGlobalStyle } from 'styled-components';

import NicoMoji from '../assets/font/NicoMoji-Regular.ttf';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'NicoMoji';
    src: url(${NicoMoji}) format('truetype');
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: black;
    font-family: 'NicoMoji', sans-serif;
  }
`;

export default GlobalStyle;
