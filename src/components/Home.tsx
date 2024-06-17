import { NavLink } from 'react-router-dom';
import { HomeStyle } from '../styles/HomeStyle';
import { NavgationStyle } from '../styles/NavgationStyle';

function Home() {
  return (
    <HomeStyle>
      <h1>Diário de campanha: Alien RPG</h1>
      <NavgationStyle>
        <NavLink to="/about">Abrir</NavLink>
      </NavgationStyle>
    </HomeStyle>
  );
}

export default Home;
