import { useState } from 'react';
import { timelines, logMembers } from '../../data/model.js';
import {
  Breadcrumbs,
  Eyebrow,
  RouteLink,
  MissionFolders,
  Narrative,
} from '../components/Common.jsx';
import { hasRedactions } from '../lib/narrative.js';

export function MissionsPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState('old');
  const normalizedQuery = query.toLocaleLowerCase('pt-BR');
  const entries = timelines
    .map((log, id) => ({ log, id }))
    .filter(({ log }) =>
      `${log.mission} ${log.location} ${log.dateTime}`
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery),
    );
  if (order === 'new') entries.reverse();

  return (
    <>
      <Breadcrumbs>Arquivos de missões</Breadcrumbs>
      <Eyebrow>Registros oficiais / Cronologia do universo</Eyebrow>
      <h1>Arquivos de missões</h1>
      <p className="lead">
        Abra uma pasta para consultar o relato e os integrantes daquela operação.
      </p>
      <div className="toolbar">
        <label>
          LOCALIZAR ARQUIVO
          <input
            type="search"
            placeholder="Missão, sistema ou data…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          ORDEM
          <select value={order} onChange={(event) => setOrder(event.target.value)}>
            <option value="old">Cronológica</option>
            <option value="new">Mais recentes primeiro</option>
          </select>
        </label>
        <span className="muted" aria-live="polite">
          {entries.length} arquivos
        </span>
      </div>
      <div className="folders">
        <MissionFolders entries={entries} />
      </div>
    </>
  );
}

export function MissionPage({ id }) {
  const log = timelines[id];
  const participants = logMembers(log);
  return (
    <>
      <Breadcrumbs>{log.mission}</Breadcrumbs>
      <div className="split">
        <aside className="sidepanel">
          <Eyebrow>Arquivo {String(id + 1).padStart(3, '0')}</Eyebrow>
          <h3 className="section-intro">{log.location}</h3>
          <p className="muted">
            {log.dateTime}
            <br />
            <small>DATA NO UNIVERSO</small>
          </p>
          <h3 className="section-intro">Registros desta missão</h3>
          <RouteLink to={`log/${id}`}>01 · Relato oficial →</RouteLink>
          <h3 className="section-intro">Personagens associados</h3>
          {participants.length ? (
            participants.map((character) => (
              <RouteLink key={character.id} to={`character/${character.id}`}>
                {character.characterName}
              </RouteLink>
            ))
          ) : (
            <p className="muted">Nenhum dossiê associado.</p>
          )}
        </aside>
        <section>
          <Eyebrow>Pasta de operação</Eyebrow>
          <h1>{log.mission}</h1>
          <div className="document">
            <span className="tag">LOG OFICIAL / 01</span>
            <h2 className="section-intro">Relato da missão</h2>
            <p className="muted">{log.esquad}</p>
            <div className="actions">
              <RouteLink to={`log/${id}`} className="button solid">
                ABRIR REGISTRO →
              </RouteLink>
            </div>
          </div>
          <p className="muted small-text section-intro">
            Cada operação reúne seus registros. Esta missão possui um relato oficial no arquivo
            atual.
          </p>
        </section>
      </div>
    </>
  );
}

export function LogPage({ id }) {
  const log = timelines[id];
  const [revealed, setRevealed] = useState(false);
  const censored = hasRedactions(log.descrition);

  return (
    <>
      <Breadcrumbs>Registro {String(id + 1).padStart(3, '0')}</Breadcrumbs>
      <div className="split">
        <aside className="sidepanel">
          <Eyebrow>Pastas</Eyebrow>
          <RouteLink to={`mission/${id}`}>▱ {log.mission}</RouteLink>
          <RouteLink to="missions">← TODOS OS ARQUIVOS</RouteLink>
          <h3 className="section-intro">Equipe registrada</h3>
          <p className="muted small-text">{log.esquad}</p>
          {censored ? (
            <div className="actions">
              <button
                aria-pressed={revealed}
                aria-controls="mission-prose"
                onClick={() => setRevealed((value) => !value)}
              >
                {revealed ? 'OCULTAR TARJAS' : 'REVELAR TARJAS'}
              </button>
            </div>
          ) : null}
        </aside>
        <article className="document">
          <header className="document-head">
            <Eyebrow>Arquivo oficial / Wild Weasel</Eyebrow>
            <h2>{log.mission}</h2>
            <small>
              {log.dateTime} · {log.location} · DATA NO UNIVERSO
            </small>
          </header>
          {log.descrition === 'CORROMPIDO' ? (
            <div className="warning">
              REGISTRO CORROMPIDO
              <br />O relato desta operação está indisponível no arquivo.
            </div>
          ) : (
            <Narrative
              id="mission-prose"
              text={log.descrition}
              className={`mission-prose ${revealed ? 'reveal' : ''}`}
            />
          )}
        </article>
      </div>
    </>
  );
}
