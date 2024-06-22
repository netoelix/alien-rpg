import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout';
import About from './pages/About';
import Player from './pages/Player';
import Timeline from './pages/Timeline';

function App() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={ <Home /> } />
        <Route element={ <Layout /> }>
          <Route path="/about" element={ <About /> } />
          <Route path="/players" element={ <Player /> } />
          <Route path="/timeline" element={ <Timeline /> } />
        </Route>
      </Routes>
    </>
  );
}

export default App;
