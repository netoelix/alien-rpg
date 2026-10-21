import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { campaignModels as savedModels, modelsForArchive } from '../data/model.js';
import { CampaignContext, ArchiveContext, useCampaign } from './context/CampaignContext.jsx';
const BlueprintEditor = lazy(() => import('./blueprints/BlueprintEditor.jsx'));
const Editor = lazy(() => import('./editor/Editor.jsx'));
import { RouteLink, MissingPage } from './components/Common.jsx';
import { HomePage, CampaignPage } from './pages/Home.jsx';
import { MissionsPage, MissionPage, LogPage } from './pages/Missions.jsx';
import { CharactersPage, CharacterPage } from './pages/Characters.jsx';
import { PlayersPage, PlayerPage, PlayerCharactersPage } from './pages/Players.jsx';
import { MapPage } from './pages/Map.jsx';

import { readDraftPreview } from './lib/draft-preview.js';

const navigation = [
  { route: 'campaign', label: 'CAMPANHA', children: ['campaign'] },
  { route: 'missions', label: 'ARQUIVOS', children: ['missions', 'mission', 'log'] },
  { route: 'characters', label: 'PERSONAGENS', children: ['characters', 'character'] },
  { route: 'players', label: 'JOGADORES', children: ['players', 'player', 'player-characters'] },
  { route: 'map', label: 'NAVEGAÇÃO', children: ['map'] },
];

function RoutePage({ route, idText, recordText }) {
  const { campaign, characters, players, timelines, missionRecords } = useCampaign();
  const id = /^\d+$/.test(idText || '') ? Number(idText) : -1;
  switch (route) {
    case 'blueprints':
      return (
        <Suspense fallback={<p>Carregando oficina…</p>}>
          <BlueprintEditor />
        </Suspense>
      );
    case 'editor':
      return Editor ? (
        <Suspense fallback={<p>Carregando editor…</p>}>
          <Editor />
        </Suspense>
      ) : (
        <MissingPage />
      );
    case '':
      return <HomePage />;
    case 'campaign':
      return <CampaignPage />;
    case 'missions':
      return <MissionsPage />;
    case 'mission':
      return timelines[id] ? <MissionPage id={id} /> : <MissingPage />;
    case 'log':
      return timelines[id] &&
        missionRecords(timelines[id])[
          /^\d+$/.test(recordText || '0') ? Number(recordText || 0) : -1
        ] ? (
        <LogPage id={id} recordIndex={Number(recordText || 0)} />
      ) : (
        <MissingPage />
      );
    case 'characters':
      return <CharactersPage />;
    case 'character':
      return characters.some((character) => character.id === idText) ? (
        <CharacterPage id={idText} />
      ) : (
        <MissingPage />
      );
    case 'players':
      return <PlayersPage />;
    case 'player':
      return players[id] ? <PlayerPage id={id} /> : <MissingPage />;
    case 'player-characters':
      return players[id] ? <PlayerCharactersPage id={id} /> : <MissingPage />;
    case 'map':
      return (
        <MapPage
          key={`${campaign.id}:${idText}:${recordText}`}
          targetKind={idText}
          targetId={recordText}
        />
      );
    default:
      return <MissingPage />;
  }
}

export default function App() {
  const [preview] = useState(() => {
    if (!new URLSearchParams(window.location.search).has('draft')) return { models: savedModels };
    try {
      const archive = readDraftPreview(window.location.search, window.localStorage);
      return { models: archive ? modelsForArchive(archive) : savedModels, draft: Boolean(archive) };
    } catch (error) {
      return { models: savedModels, error: error.message };
    }
  });
  const campaignModels = preview.models;
  const [hash, setHash] = useState(window.location.hash);
  const [effects, setEffects] = useState(true);
  const mainRef = useRef(null);
  const segments = hash.replace(/^#\/?/, '').split('/');
  const scoped = segments[0] === 'c';
  const model = scoped
    ? campaignModels.find((model) => model.campaign.id === segments[1])
    : campaignModels[0];
  const [route = '', idText, recordText] = scoped ? segments.slice(2) : segments;
  const title = model?.campaign.title || 'Arquivo Alien';
  const pageTitle =
    route === 'blueprints'
      ? 'Editor de mapas'
      : route === 'editor'
        ? 'Editor de campanhas'
        : route
          ? title
          : 'Arquivo de campanhas';

  useEffect(() => {
    function handleNavigation() {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
    window.addEventListener('hashchange', handleNavigation);
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  useEffect(() => {
    document.title = `${route ? pageTitle : 'Arquivo Alien'} · Terminal de campanhas`;
  }, [route, pageTitle]);

  useEffect(() => {
    document.body.classList.toggle('clean', !effects);
    return () => document.body.classList.remove('clean');
  }, [effects]);

  return (
    <ArchiveContext.Provider value={campaignModels}>
      <CampaignContext.Provider value={model || campaignModels[0]}>
        <div className="shell">
          <header className="masthead">
            <RouteLink className="brand">
              ARQUIVO <span>ALIEN</span>
            </RouteLink>
            <div className="system">
              <i /> TERMINAL DE CONSULTA{' '}
              <small>
                REGISTROS DE CAMPANHA / {String(campaignModels.length).padStart(2, '0')}
              </small>
            </div>
            <button
              aria-pressed={effects}
              title="Ativar ou desativar textura da tela"
              onClick={() => setEffects((value) => !value)}
            >
              {effects ? 'CRT ON' : 'CRT OFF'}
            </button>
          </header>
          <div className="topline">
            <span>INTERFACE DE ACESSO PÚBLICO</span>
            <span>REGISTROS DISPONÍVEIS · LEITURA</span>
          </div>
          <nav aria-label="Navegação principal">
            <RouteLink to="editor">
              {import.meta.env.MODE === 'editor' ? 'EDITOR LOCAL' : 'EDITOR'}
            </RouteLink>
            <a href="#/blueprints" aria-current={route === 'blueprints' ? 'page' : undefined}>
              CRIAR PLANTA
            </a>
            {route && route !== 'editor' && route !== 'blueprints'
              ? navigation.map((item) => (
                  <RouteLink
                    key={item.route}
                    to={item.route}
                    className={item.children.includes(route) ? 'active' : ''}
                    aria-current={item.children.includes(route) ? 'page' : undefined}
                  >
                    {item.label}
                  </RouteLink>
                ))
              : null}
          </nav>
          {preview.draft ? (
            <p className="editor-status">
              PRÉVIA DO RASCUNHO · alterações aplicadas, ainda sem publicação.
            </p>
          ) : null}
          <main ref={mainRef} tabIndex={-1}>
            {preview.error ? (
              <p role="alert">{preview.error}</p>
            ) : model ? (
              <RoutePage key={hash} route={route} idText={idText} recordText={recordText} />
            ) : (
              <MissingPage />
            )}
          </main>
          <footer>
            <span>DESENVOLVIDO POR ELIX MERLINO NETO</span>
            <span>VERSÃO 3.0 · {pageTitle}</span>
          </footer>
        </div>
      </CampaignContext.Provider>
    </ArchiveContext.Provider>
  );
}
