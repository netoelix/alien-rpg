import { useState } from 'react';
import { StarGrid } from '../components/StarGrid.jsx';
import { useCampaign } from '../context/CampaignContext.jsx';
import { Breadcrumbs, Eyebrow, RouteLink } from '../components/Common.jsx';
import { campaignRoute, officialSystems } from '../../data/star-map.js';
import { resolveMapLink } from '../../data/map-links.js';

export function MapPage({ targetKind, targetId }) {
  const { campaign } = useCampaign();
  const stops = campaignRoute(campaign);
  const target = resolveMapLink(campaign, targetKind, targetId);
  const [cutoff, setCutoff] = useState(target.index >= 0 ? target.index : null);
  const lastIndex = stops.length - 1;
  const limit = cutoff === null ? lastIndex : Math.min(cutoff, lastIndex);
  const visibleStops = stops.slice(0, limit + 1);
  const pending = stops.filter((stop) => !stop.system);
  return (
    <>
      <Breadcrumbs>Navegação estelar</Breadcrumbs>
      <Eyebrow>Cartografia / um quadrado = um parsec</Eyebrow>
      <h1>Mapa de {campaign.title}</h1>
      <p className="map-note">
        Sol é a origem. {officialSystems.length} sistemas da referência estão disponíveis para
        consulta, com suas instalações. As coordenadas foram transcritas do mapa de 2183; sistemas
        descobertos pertencem somente à sua campanha.
      </p>
      <p className="muted small-text">
        Os contornos do manto-base são aproximações visuais do mapa de 2183. A campanha pode definir
        sua própria configuração territorial.
      </p>
      {stops.length > 0 && (
        <label className="map-cutoff">
          Percurso até
          <select value={limit} onChange={(event) => setCutoff(Number(event.target.value))}>
            {stops.map((stop, index) => (
              <option key={stop.id} value={index}>
                {index + 1}. {stop.arrival} ·{' '}
                {stop.system?.name || stop.note || 'Sistema não localizado'}
              </option>
            ))}
          </select>
        </label>
      )}
      {target.invalid && (
        <p role="status">O ponto deste link não existe mais. Exibindo o mapa completo.</p>
      )}
      {targetKind === 'system' && target.system && (
        <p className="muted">
          Localização de {target.system.name}. Este link não indica uma parada da equipe.
        </p>
      )}
      <StarGrid campaign={campaign} stops={visibleStops} focusSystemId={target.system?.id} />
      {!stops.length && <p className="empty">Nenhuma parada registrada nesta campanha.</p>}
      {pending.length > 0 && (
        <details className="map-editor-section">
          <summary>PARADAS SEM POSIÇÃO ({pending.length})</summary>
          <p>
            Estas paradas permanecem no histórico, mas interrompem o traçado. Cadastre os sistemas
            exclusivos e associe-os à rota no editor.
          </p>
          <ul>
            {pending.map((stop) => (
              <li key={stop.id}>
                {stop.note} · {stop.arrival}
              </li>
            ))}
          </ul>
        </details>
      )}
      <details className="map-editor-section">
        <summary>HISTÓRICO DO PERCURSO ({stops.length})</summary>
        {stops.length > 0 && (
          <p className="muted small-text">
            {stops[0].inferred
              ? 'Sistemas vinculados às missões, seguindo a ordem do arquivo.'
              : 'Ordem de paradas definida no editor da campanha.'}
          </p>
        )}
        <ol className="map-route-history">
          {stops.map((stop, index) => (
            <li key={stop.id} className={index > limit ? 'muted' : ''}>
              <strong>{stop.system?.name || stop.note}</strong> · {stop.arrival}
              {stop.departure ? ' → ' + stop.departure : ''}
              {stop.note && stop.system && <p>{stop.note}</p>}
              {Number.isInteger(stop.missionIndex) && campaign.timelines[stop.missionIndex] && (
                <RouteLink to={'mission/' + stop.missionIndex}>
                  {campaign.timelines[stop.missionIndex].mission} →
                </RouteLink>
              )}
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
