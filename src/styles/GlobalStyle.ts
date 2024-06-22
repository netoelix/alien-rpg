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
    color: white;
    font-family: 'NicoMoji', sans-serif;
  }

    ::-webkit-scrollbar {
    width: 10px;
    }

    ::-webkit-scrollbar-track {
    background: #16B769;
    }

    ::-webkit-scrollbar-thumb {
    background: #FFFFFF;
    }

    ::-webkit-scrollbar-thumb:hover {
    background: #11633F;
    }
`;

export default GlobalStyle;
