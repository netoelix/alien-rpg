import { NavLink } from 'react-router-dom';
import { NavgationStyle } from '../styles/NavgationStyle';

function Navgation() {
  return (
    <NavgationStyle>
      <NavLink to="/about">Sobre</NavLink>
      <NavLink to="/players">Jogadores</NavLink>
      <NavLink to="/timeline">Linha do tempo</NavLink>
    </NavgationStyle>
  );
}

export default Navgation;
