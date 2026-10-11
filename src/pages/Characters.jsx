import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext.jsx';
import {
  Breadcrumbs,
  Eyebrow,
  RouteLink,
  CharacterCards,
  MissionFolders,
  Narrative,
  CharacterStatus,
  CollapsibleSection,
} from '../components/Common.jsx';

export function CharactersPage() {
  const { characters, campaign } = useCampaign();
  return (
    <>
      <Breadcrumbs>Personagens</Breadcrumbs>
      <Eyebrow>Arquivo de pessoal / {campaign.unit || campaign.title}</Eyebrow>
      <h1>Dossiês de personagens</h1>
      <p className="lead list-intro">Os integrantes que fizeram parte desta história.</p>
      <div className="grid">
        <CharacterCards characters={characters} />
      </div>
    </>
  );
}

function Biography({ character }) {
  const [expanded, setExpanded] = useState(false);
  // Apenas textos longos precisam do controle no celular. No desktop, tudo é visível.
  const collapsible = character.about.length > 700;
  return (
    <article
      className={`document biography ${expanded ? 'expanded' : ''} ${collapsible ? 'collapsible' : ''}`}
    >
      <h2>Biografia</h2>
      <Narrative id="character-biography" text={character.about} className="biography-text" />
      {collapsible ? (
        <button
          className="biography-toggle"
          aria-expanded={expanded}
          aria-controls="character-biography"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'RECOLHER BIOGRAFIA' : 'EXPANDIR BIOGRAFIA'}
        </button>
      ) : null}
    </article>
  );
}

function Diary({ character }) {
  const { campaign } = useCampaign();
  // Preserva os rascunhos escritos antes da conversão para React.
  const storageKey = `alien-rpg-diary-${campaign.id}-${character.id}`;
  const [draft, setDraft] = useState(() => {
    try {
      return (
        localStorage.getItem(storageKey) ??
        (campaign.id === 'fragmentos-da-guerra'
          ? localStorage.getItem(`alien-prototype-diary-${character.id}`)
          : '') ??
        ''
      );
    } catch {
      return '';
    }
  });
  const [status, setStatus] = useState('');

  function saveDraft() {
    try {
      localStorage.setItem(storageKey, draft);
      setStatus('Rascunho guardado neste navegador. Não publicado.');
    } catch {
      setStatus('Armazenamento local indisponível. Use Baixar texto.');
    }
  }

  function downloadDraft() {
    const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `diario-${character.id}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="diary-area">
      <Eyebrow>Terminal pessoal / Rascunho</Eyebrow>
      <h2>Diário de {character.characterName}</h2>
      <p className="muted list-intro">
        Ainda não há páginas publicadas. Experimente escrever um rascunho pessoal; ele fica apenas
        neste navegador.
      </p>
      <label htmlFor="diary-draft">NOVA PÁGINA</label>
      <textarea
        id="diary-draft"
        placeholder="O que seu personagem quer deixar registrado?"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="actions">
        <button onClick={saveDraft}>GUARDAR RASCUNHO LOCAL</button>
        <button onClick={downloadDraft}>BAIXAR TEXTO</button>
      </div>
      <p className="draft-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

const characterSections = [
  { id: 'bio', label: 'BIOGRAFIA' },
  { id: 'logs', label: 'MISSÕES' },
  { id: 'awards', label: 'CONQUISTAS' },
  { id: 'diary', label: 'DIÁRIO' },
];

export function CharacterPage({ id }) {
  const { characters, players, timelines, relatedTo } = useCampaign();
  const character = characters.find((character) => character.id === id);
  const [section, setSection] = useState('bio');
  const relatedLogs = timelines
    .map((log, logId) => ({ log, id: logId }))
    .filter(({ log }) => relatedTo(log, character));

  return (
    <>
      <Breadcrumbs>{character.characterName}</Breadcrumbs>
      <div className="split character-layout">
        <aside className="sidepanel character-sidebar">
          <img className="portrait" src={character.images} alt={character.characterName} />
          <Eyebrow>
            Dossiê{' '}
            {String(characters.findIndex((character) => character.id === id) + 1).padStart(3, '0')}
          </Eyebrow>
          {character.codname?.trim() ? <h3>{character.codname}</h3> : null}
          <p className="muted">{character.profession}</p>
          <CharacterStatus character={character} />
          <RouteLink to={`player/${character.playerId}`}>
            JOGADOR · {players[character.playerId].playerId} →
          </RouteLink>
        </aside>
        <section>
          <Eyebrow>Arquivo de pessoal</Eyebrow>
          <h1>{character.characterName}</h1>
          <div className="tabs" aria-label="Seções do personagem">
            {characterSections.map((item) => (
              <button
                key={item.id}
                className={section === item.id ? 'active' : ''}
                aria-pressed={section === item.id}
                aria-controls="character-content"
                onClick={() => setSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div id="character-content">
            {section === 'bio' ? <Biography character={character} /> : null}
            {section === 'logs' ? (
              <CollapsibleSection title="Missões relacionadas" count={relatedLogs.length}>
                <div className="folders">
                  <MissionFolders entries={relatedLogs} />
                </div>
              </CollapsibleSection>
            ) : null}
            {section === 'awards' ? (
              <div className="empty">
                Ainda não há conquistas atribuídas especificamente a este personagem.
                <div className="actions centered">
                  <RouteLink to={`player/${character.playerId}`} className="button">
                    VER CONQUISTAS DE {players[character.playerId].playerId}
                  </RouteLink>
                </div>
              </div>
            ) : null}
            {section === 'diary' ? <Diary character={character} /> : null}
          </div>
        </section>
      </div>
    </>
  );
}
