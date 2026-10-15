import React, { lazy, Suspense, useEffect, useState } from 'react';
const AdminGate = lazy(() => import('./editor/AdminGate.jsx'));
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

function Entry() {
  const [location, setLocation] = useState(window.location.href);
  useEffect(() => {
    const change = () => setLocation(window.location.href);
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const url = new URL(location);
  const segments = url.hash.replace(/^#\/?/, '').split('/');
  const route = segments[0] === 'c' ? segments[2] : segments[0];
  const restricted =
    import.meta.env.MODE !== 'editor' &&
    (route === 'editor' ||
      url.searchParams.has('draft') ||
      url.searchParams.has('admin') ||
      url.searchParams.has('code'));
  return restricted ? (
    <Suspense fallback={<p>Conferindo acesso…</p>}>
      <AdminGate>
        <App />
      </AdminGate>
    </Suspense>
  ) : (
    <App />
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApplicationBoundary>
      <Entry />
    </ApplicationBoundary>
  </React.StrictMode>,
);
