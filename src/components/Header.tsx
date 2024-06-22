import { HeaderStyle, NavigationStyle } from '../styles/HeaderStyle';
import Navigation from './Navigation';

function Header() {
  return (
    <HeaderStyle>
      <div className="header-title">
        <h1>Alien RPG: Fragmentos da Guerra</h1>
      </div>
      <NavigationStyle>
        <Navigation />
      </NavigationStyle>
    </HeaderStyle>
  );
}

export default Header;
