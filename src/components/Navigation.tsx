import { NavLink, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isSelected = (path: string) => location.pathname === path;

  return (
    <>
      <div className="nav-container">
        <div className={ isSelected('/about') ? 'selected' : 'unselected' } />
        <NavLink to="/about">Sobre</NavLink>
        <div className={ isSelected('/about') ? 'selected' : 'unselected' } />
      </div>
      <div className="nav-container">
        <div className={ isSelected('/players') ? 'selected' : 'unselected' } />
        <NavLink to="/players">Jogadores</NavLink>
        <div className={ isSelected('/players') ? 'selected' : 'unselected' } />
      </div>
      <div className="nav-container">
        <div className={ isSelected('/timeline') ? 'selected' : 'unselected' } />
        <NavLink to="/timeline">Logs das missões</NavLink>
        <div className={ isSelected('/timeline') ? 'selected' : 'unselected' } />
      </div>
      {/* <div className="nav-container">
        <div className={ isSelected('/map') ? 'selected' : 'unselected' } />
        <NavLink to="/map">Mapa</NavLink>
        <div className={ isSelected('/map') ? 'selected' : 'unselected' } />
      </div> */}
    </>
  );
}

export default Navigation;
