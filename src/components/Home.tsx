import { NavLink } from 'react-router-dom';
import { HomeStyle } from '../styles/HomeStyle';

function Home() {
  return (
    <HomeStyle>
      <h1>Diário de campanha: Alien RPG</h1>
      <NavLink to="/about">Abrir</NavLink>
    </HomeStyle>
  );
}

export default Home;
