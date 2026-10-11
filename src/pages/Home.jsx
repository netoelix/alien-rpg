import { Breadcrumbs, Eyebrow, RouteLink } from '../components/Common.jsx';

export function HomePage() {
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
            01 CAMPANHA / WILD WEASEL
          </small>
        </div>
      </div>
      <div className="section-head">
        <h2>Campanhas disponíveis</h2>
        <span className="eyebrow">01 ARQUIVO</span>
      </div>
      <RouteLink to="campaign" className="card">
        <span className="arrow">↗</span>
        <span className="tag amber">ENCERRADA</span>
        <h3>Fragmentos da Guerra</h3>
        <p className="lead">
          O registro do esquadrão Wild Weasel, entre as corporações e a guerra.
        </p>
        <div className="stats">
          <div>
            <b>17</b>
            <small>REGISTROS DE MISSÃO</small>
          </div>
          <div>
            <b>07</b>
            <small>PERSONAGENS</small>
          </div>
          <div>
            <b>2120–2122</b>
            <small>CRONOLOGIA DO UNIVERSO</small>
          </div>
        </div>
      </RouteLink>
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
  return (
    <>
      <Breadcrumbs />
      <Eyebrow>AU / Divisão de operações especiais</Eyebrow>
      <h1>Fragmentos da Guerra</h1>
      <span className="tag amber">CAMPANHA ENCERRADA</span>
      <p className="lead section-intro">
        Presos entre a Weyland-Yutani e a UPP, os sobreviventes de Acheron Prime encontram um novo
        caminho nas forças especiais das Américas Unidas. Este é o arquivo do esquadrão Wild Weasel.
      </p>
      <div className="stats">
        <div>
          <b>17</b>
          <small>REGISTROS</small>
        </div>
        <div>
          <b>04</b>
          <small>JOGADORES</small>
        </div>
        <div>
          <b>07</b>
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
      <RouteLink to="mission/16" className="card">
        <h3>Alto Comando, Divisão de Operações Especiais</h3>
        <p className="muted section-intro">Unidade WILD WEASEL: esquadrão desaparecido.</p>
      </RouteLink>
    </>
  );
}
