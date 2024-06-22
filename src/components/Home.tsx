import { NavLink } from 'react-router-dom';

function Home() {
  return (
    <>
      <h1>Diário de campanha: Alien RPG</h1>
      <NavLink to="/about">Abrir</NavLink>
    </>
  );
}

export default Home;
