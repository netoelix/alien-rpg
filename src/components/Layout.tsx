import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ButtonTop from './ButtonTop';

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <ButtonTop />
      <Footer />
    </>
  );
}

export default Layout;
