import { useCampaign, useArchiveModels } from '../context/CampaignContext.jsx';
import { Breadcrumbs, Eyebrow, RouteLink } from '../components/Common.jsx';

export function HomePage() {
  const campaignModels = useArchiveModels();
  return (
    <>
      <div className="hero">
        <div>
          <Eyebrow>Rede de arquivos / Alien RPG</Eyebrow>
          <h1>
            SUAS HISTÓRIAS.
            <br />
            NO ESPAÇO.
          </h1>
          <p className="lead">
            Um arquivo das campanhas, dos personagens e dos acontecimentos que marcaram nossa
            jornada no universo de Alien.
          </p>
          <div className="actions">
            <RouteLink to="campaign" className="button solid">
              ACESSAR CAMPANHA →
            </RouteLink>
          </div>
          <p className="muted small-text">
            Relatos oficiais. Memórias pessoais. Nenhum registro esquecido.
          </p>
        </div>
        <div className="terminal-art" aria-hidden="true">
          <span>ARQUIVO CENTRAL / ACESSO PÚBLICO</span>
          <div className="orbit" />
          <div className="orbit two" />
          <strong>ALIEN</strong>
          <small>
            INTEGRIDADE DOS REGISTROS · ARQUIVO DISPONÍVEL
            <br />
            {String(campaignModels.length).padStart(2, '0')} CAMPANHA(S)
          </small>
        </div>
      </div>
      <div className="section-head">
        <h2>Campanhas disponíveis</h2>
        <span className="eyebrow">{String(campaignModels.length).padStart(2, '0')} ARQUIVO(S)</span>
      </div>
      {campaignModels.map((model) => (
        <RouteLink
          key={model.campaign.id}
          to={'c/' + model.campaign.id + '/campaign'}
          className="card campaign-card"
        >
          <span className="arrow">↗</span>
          <span className="tag amber">
            {model.campaign.status.replaceAll('-', ' ').toUpperCase()}
          </span>
          <h3>{model.campaign.title}</h3>
          <p className="lead">{model.campaign.summary}</p>
          <div className="stats">
            <div>
              <b>{model.timelines.length}</b>
              <small>REGISTROS DE MISSÃO</small>
            </div>
            <div>
              <b>{String(model.characters.length).padStart(2, '0')}</b>
              <small>PERSONAGENS</small>
            </div>
            <div>
              <b>{model.campaign.period || '—'}</b>
              <small>CRONOLOGIA DO UNIVERSO</small>
            </div>
          </div>
        </RouteLink>
      ))}
    </>
  );
}

const campaignSections = [
  {
    route: 'missions',
    label: '01 / ARQUIVOS',
    title: 'Logs das missões',
    description: 'Pastas, registros e acontecimentos da campanha.',
  },
  {
    route: 'characters',
    label: '02 / PESSOAL',
    title: 'Dossiês de personagens',
    description: 'Quem esteve a bordo e quais histórias deixou.',
  },
  {
    route: 'players',
    label: '03 / PARTICIPANTES',
    title: 'Jogadores e conquistas',
    description: 'Personagens jogados e feitos alcançados.',
  },
  {
    route: 'map',
    label: '04 / NAVEGAÇÃO',
    title: 'Rota da campanha',
    description: 'Uma leitura do percurso entre os sistemas.',
  },
];

export function CampaignPage() {
  const { campaign, timelines, characters, players } = useCampaign();
  const last = timelines.at(-1);
  return (
    <>
      <Breadcrumbs />
      <Eyebrow>{campaign.division || 'Arquivo de campanha'}</Eyebrow>
      <h1>{campaign.title}</h1>
      <span className="tag amber">{campaign.status.replaceAll('-', ' ').toUpperCase()}</span>
      <p className="lead section-intro">{campaign.description}</p>
      <div className="stats">
        <div>
          <b>{timelines.length}</b>
          <small>REGISTROS</small>
        </div>
        <div>
          <b>{String(players.filter((player) => !player.mascot).length).padStart(2, '0')}</b>
          <small>JOGADORES</small>
        </div>
        <div>
          <b>{String(characters.length).padStart(2, '0')}</b>
          <small>PERSONAGENS E MASCOTE</small>
        </div>
      </div>
      <div className="grid">
        {campaignSections.map((section) => (
          <RouteLink to={section.route} className="card" key={section.route}>
            <Eyebrow>{section.label}</Eyebrow>
            <h3>
              {section.title} <span className="arrow">→</span>
            </h3>
            <p className="muted">{section.description}</p>
          </RouteLink>
        ))}
      </div>
      <div className="section-head spaced">
        <h2>Último registro</h2>
        <span className="tag amber">ARQUIVO FINAL</span>
      </div>
      {last ? (
        <RouteLink to={'mission/' + (timelines.length - 1)} className="card">
          <h3>{last.mission}</h3>
          <p className="muted section-intro">{last.esquad}</p>
        </RouteLink>
      ) : (
        <div className="empty">Nenhum registro publicado.</div>
      )}
    </>
  );
}
