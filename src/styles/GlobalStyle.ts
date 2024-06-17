import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      color: black;
      font-family: sans-serif;
      body {
        background-color: #343a40;
      }
    }
  `;
export default GlobalStyle;
