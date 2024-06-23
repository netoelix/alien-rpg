import { createGlobalStyle } from 'styled-components';

import NicoMoji from '../assets/font/NicoMoji-Regular.ttf';
import Sevastopol from '../assets/font/Sevastopol-Interface.ttf';

const GlobalStyle = createGlobalStyle`
   @font-face {
    font-family: 'NicoMoji';
    src: url(${NicoMoji}) format('truetype');
  }
  @font-face {
    font-family: 'Sevastopol';
    src: url(${Sevastopol}) format('truetype');
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: white;
    font-family: 'NicoMoji', sans-serif;
    
  }

  body {
    background-color: #152E1B;
  }

  p {
    font-family: 'Sevastopol', sans-serif; 
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
