import { characterAchievements } from '../../data/character-records.js';
import { useState } from 'react';
import { useCampaign } from '../context/CampaignContext.jsx';
import {
  Breadcrumbs,
  Eyebrow,
  RouteLink,
  CharacterCards,
  AwardCards,
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
  return (
    <div className="diary-area">
      <Eyebrow>Terminal pessoal / Diário</Eyebrow>
      <h2>Diário de {character.characterName}</h2>
      {!character.journal?.length && (
        <p className="muted">Nenhuma página registrada no arquivo da campanha.</p>
      )}
      <div className="journal-entries">
        {(character.journal || []).map((entry) => (
          <details className="collapsible-section" key={entry.id}>
            <summary>
              <h3>{entry.title}</h3>
              <span>{entry.dateTime}</span>
            </summary>
            <div className="collapsible-content">
              <Narrative text={entry.text} />
            </div>
          </details>
        ))}
      </div>
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
  const { characters, players, timelines, relatedTo, campaign, achievements } = useCampaign();
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
            {section === 'awards' && (
              <div className="awards">
                <AwardCards awards={characterAchievements(campaign, achievements, character.id)} />
                <p className="muted small-text">
                  Somente feitos atribuídos a este personagem. Concessões antigas sem personagem
                  identificado permanecem no histórico do jogador.
                </p>
              </div>
            )}
            {section === 'diary' ? <Diary character={character} /> : null}
          </div>
        </section>
      </div>
    </>
  );
}
