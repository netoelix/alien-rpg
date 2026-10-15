import { ArchiveImage } from './ArchiveImage.jsx';
import { useCampaign } from '../context/CampaignContext.jsx';
import { parseNarrative } from '../lib/narrative.js';
import { characterStates } from '../../data/editor-rules.js';
import { missionMapLink } from '../../data/map-links.js';

export function MissionSystemLink({ missionIndex }) {
  const { campaign, timelines } = useCampaign();
  const destination = missionMapLink(campaign, missionIndex);
  const label = timelines[missionIndex]?.location;
  return destination ? (
    <RouteLink to={destination} className="system-link" title="Ver esta localização no mapa">
      {label} ↗
    </RouteLink>
  ) : (
    <span>{label}</span>
  );
}

export function RouteLink({ to = '', className = '', children, ...props }) {
  const { campaign } = useCampaign();
  const destination =
    to && !to.startsWith('c/') && to !== 'editor' ? 'c/' + campaign.id + '/' + to : to;
  return (
    <a href={to === 'editor' ? '/#/editor' : `#/${destination}`} className={className} {...props}>
      {children}
    </a>
  );
}

export function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}

export function CharacterStatus({ character }) {
  const label = characterStates[character.lifeStatus];
  return label ? (
    <span className="tag life-state" data-status={character.lifeStatus}>
      {label}
    </span>
  ) : null;
}

export function Breadcrumbs({ children }) {
  const { campaign } = useCampaign();
  return (
    <div className="breadcrumbs">
      <RouteLink>INÍCIO</RouteLink> / <RouteLink to="campaign">{campaign.title}</RouteLink>
      {children ? <> / {children}</> : null}
    </div>
  );
}

export function Narrative({ text, className = '', id }) {
  const paragraphs = parseNarrative(text);
  return (
    <div id={id} className={`prose ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph.map((segment, segmentIndex) =>
            segment.redacted ? (
              <span className="redacted" key={segmentIndex}>
                {segment.text}
              </span>
            ) : (
              segment.text
            ),
          )}
        </p>
      ))}
    </div>
  );
}

export function MissionFolders({ entries }) {
  const { missionRecords } = useCampaign();
  if (!entries.length) return <div className="empty">Nenhum arquivo encontrado.</div>;
  return entries.map(({ log, id }) => (
    <article key={id} className="folder">
      <span className="icon" aria-hidden="true">
        ▱
      </span>
      <small>
        ARQUIVO {String(id + 1).padStart(3, '0')} · {log.dateTime}
      </small>
      <h3>
        <RouteLink to={`mission/${id}`}>{log.mission}</RouteLink>
      </h3>
      {missionRecords(log).length > 1 ? (
        <small>{missionRecords(log).length} REGISTROS</small>
      ) : null}
      <div className="bottom">
        <small>
          <MissionSystemLink missionIndex={id} />
        </small>
        <RouteLink to={`mission/${id}`} aria-label={`Abrir missão ${log.mission}`}>
          ABRIR →
        </RouteLink>
      </div>
    </article>
  ));
}

export function CharacterCards({ characters }) {
  const { players } = useCampaign();
  return characters.map((character) => (
    <RouteLink key={character.id} to={`character/${character.id}`} className="card">
      <div className="person-card">
        <ArchiveImage
          src={character.images}
          alt={`Retrato de ${character.characterName}`}
          loading="lazy"
        />
        <div>
          {character.codname?.trim() ? <Eyebrow>{character.codname}</Eyebrow> : null}
          <h3>{character.characterName}</h3>
          <CharacterStatus character={character} />
          <p className="meta">{character.profession}</p>
          <p className="meta">{players[character.playerId].playerId}</p>
        </div>
      </div>
    </RouteLink>
  ));
}

export function AwardCards({ awards, playerId }) {
  const { awardDate } = useCampaign();
  if (!awards.length) return <div className="empty">Nenhuma conquista registrada.</div>;
  return awards.map((award) => (
    <article className="award" key={award.id}>
      <img src={award.medal} alt={`Medalha ${award.rank}`} loading="lazy" />
      <div>
        <h3>{award.name || 'Conquista sem título'}</h3>
        {award.stars && (
          <p aria-label={award.stars + ' de 3 estrelas'} className="achievement-stars">
            {'★'.repeat(award.stars)}
            {'☆'.repeat(3 - award.stars)}
          </p>
        )}
        <p>{award.description}</p>
        <small>
          {award.date || awardDate(award, playerId)} · {award.category} / {award.rank}
        </small>
      </div>
    </article>
  ));
}

export function MissingPage() {
  return (
    <>
      <Eyebrow>Arquivo não localizado</Eyebrow>
      <h1>Registro indisponível</h1>
      <RouteLink className="button">VOLTAR AO INÍCIO</RouteLink>
    </>
  );
}

export function CollapsibleSection({ title, count, children }) {
  return (
    <details className="collapsible-section">
      <summary>
        <h2>
          {title} <span className="section-count">{count}</span>
        </h2>
        <span className="expand-label">EXPANDIR +</span>
        <span className="collapse-label">RECOLHER −</span>
      </summary>
      <div className="collapsible-content">{children}</div>
    </details>
  );
}
