import { locationFields } from '../../data/system-profiles.js';

export function SystemLocations({ locations = [] }) {
  if (!locations.length) return <p className="muted">Fichas de locais ainda não preenchidas.</p>;
  return (
    <section aria-label="Consulta de planetas, luas e instalações">
      <h3>Locais conhecidos</h3>
      {locations.map((location) => (
        <details key={location.id} className="location-card">
          <summary>
            {location.name}
            {location.commonName ? ' · ' + location.commonName : ''}
            {location.type && <span className="muted location-type">{location.type}</span>}
          </summary>
          <dl className="location-facts">
            {locationFields
              .filter(([key]) => !['name', 'commonName'].includes(key) && location[key]?.trim())
              .map(([key, label]) => (
                <div key={key}>
                  <dt>{label.replace(' (opcional)', '')}</dt>
                  <dd>{location[key]}</dd>
                </div>
              ))}
          </dl>
        </details>
      ))}
    </section>
  );
}
