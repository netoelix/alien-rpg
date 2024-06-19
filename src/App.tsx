import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Layout from './components/Layout';
import GlobalStyle from './styles/GlobalStyle';
import Player from './components/Player';
import About from './components/About';
import Timeline from './components/Timeline';

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
