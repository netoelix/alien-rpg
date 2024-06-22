import styled from 'styled-components';

export const HeaderStyle = styled.header`

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    align-content: center;
    background-color: #11633F;
    width: 100%;
    height: 90px;

    .header-title {
        padding-top: 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        width: 100%;
    }
    h1 {
        padding-left: 20px;
        padding-right: 20px;
        color: white;
    }
`;

export const NavigationStyle = styled.nav`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    align-content: center;
    background-color: #12B866;
    width: 100%;
    height: 40px;
    a {
        color: white;
        text-decoration: none;
    }
    .selected {
        background-color: white;
        width:20px;
        height: 20px;
        margin: 0px 10px;
    }

    .unselected {
        background-color: transparent;
        width:20px;
        height: 40px;
        margin: 0px 10px;
    }

    .nav-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        align-content: center;
        padding: 0px 20px;
    }
`;
