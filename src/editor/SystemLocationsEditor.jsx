import { useState } from 'react';
import { locationFields, newLocation } from '../../data/system-profiles.js';

function LocationCard({ location, index, children }) {
  const [expanded, setExpanded] = useState(!location.name);
  return (
    <details
      className="location-card"
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>
        {location.name || 'Novo local ' + (index + 1)}
        {location.commonName ? ' · ' + location.commonName : ''}
      </summary>
      {children}
    </details>
  );
}

export function SystemLocationsEditor({ locations = [], onChange }) {
  function update(id, field, value) {
    onChange(
      locations.map((location) =>
        location.id === id ? { ...location, [field]: value } : location,
      ),
    );
  }
  return (
    <section className="system-locations-editor">
      <h3>Planetas, luas e instalações</h3>
      <p className="muted">
        Adicione uma ficha para cada local conhecido. Apenas o nome do local é obrigatório. Campos
        vazios não aparecem na consulta; população aceita texto e estimativas.
      </p>
      {locations.map((location, index) => (
        <LocationCard key={location.id} location={location} index={index}>
          <div className="map-form-grid">
            {locationFields.map(([field, label]) => (
              <label key={field}>
                {label}
                <textarea
                  rows={['installations', 'atmosphere', 'resources'].includes(field) ? 3 : 2}
                  maxLength={4000}
                  value={location[field] || ''}
                  onChange={(event) => update(location.id, field, event.target.value)}
                  placeholder={field === 'name' ? 'Ex.: PROSPECT, LV-426…' : 'Não informado'}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            className="danger-button"
            onClick={() => {
              if (
                window.confirm(
                  'Remover esta ficha do formulário? A mudança só será guardada quando você aplicar e salvar o rascunho.',
                )
              )
                onChange(locations.filter((entry) => entry.id !== location.id));
            }}
          >
            REMOVER FICHA
          </button>
        </LocationCard>
      ))}
      <button
        type="button"
        disabled={locations.length >= 100}
        onClick={() => onChange([...locations, newLocation()])}
      >
        + ADICIONAR LOCAL
      </button>
    </section>
  );
}
