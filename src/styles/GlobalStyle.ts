import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      color: black;
      font-family: sans-serif;
      body {
        background-color: #003554;
      }
    }
  `;
export default GlobalStyle;
