import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../style.css';

const legacyRoutes = { about: 'campaign', players: 'players', timeline: 'missions' };
const legacyPage = window.location.pathname.replace(/\/$/, '').split('/').at(-1);
if (!window.location.hash && legacyRoutes[legacyPage]) {
  window.history.replaceState(null, '', `/#/${legacyRoutes[legacyPage]}`);
}

class ApplicationBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main role="alert">
          Não foi possível abrir os registros. Recarregue a página para tentar novamente.
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApplicationBoundary>
      <App />
    </ApplicationBoundary>
  </React.StrictMode>,
);
