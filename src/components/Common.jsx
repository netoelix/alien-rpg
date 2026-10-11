import { players, awardDate } from '../../data/model.js';
import { parseNarrative } from '../lib/narrative.js';

export function RouteLink({ to = '', className = '', children, ...props }) {
  return (
    <a href={`#/${to}`} className={className} {...props}>
      {children}
    </a>
  );
}

export function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}

export function Breadcrumbs({ children }) {
  return (
    <div className="breadcrumbs">
      <RouteLink>INÍCIO</RouteLink> / <RouteLink to="campaign">FRAGMENTOS DA GUERRA</RouteLink>
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
  if (!entries.length) return <div className="empty">Nenhum arquivo encontrado.</div>;
  return entries.map(({ log, id }) => (
    <RouteLink key={id} to={`mission/${id}`} className="folder">
      <span className="icon" aria-hidden="true">
        ▱
      </span>
      <small>
        ARQUIVO {String(id + 1).padStart(3, '0')} · {log.dateTime}
      </small>
      <h3>{log.mission}</h3>
      <div className="bottom">
        <small>{log.location}</small>
        <span>→</span>
      </div>
    </RouteLink>
  ));
}

export function CharacterCards({ characters }) {
  return characters.map((character) => (
    <RouteLink key={character.id} to={`character/${character.id}`} className="card">
      <div className="person-card">
        <img src={character.images} alt={`Retrato de ${character.characterName}`} loading="lazy" />
        <div>
          <Eyebrow>{character.codname}</Eyebrow>
          <h3>{character.characterName}</h3>
          <p className="meta">{character.profession}</p>
          <p className="meta">{players[character.playerId].playerId}</p>
        </div>
      </div>
    </RouteLink>
  ));
}

export function AwardCards({ awards, playerId }) {
  if (!awards.length) return <div className="empty">Nenhuma conquista registrada.</div>;
  return awards.map((award) => (
    <article className="award" key={award.id}>
      <img src={award.medal} alt={`Medalha ${award.rank}`} loading="lazy" />
      <div>
        <h3>{award.name || 'Conquista sem título'}</h3>
        <p>{award.description}</p>
        <small>
          {awardDate(award, playerId)} · {award.category} / {award.rank}
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
