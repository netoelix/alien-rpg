import { officialSystems, validateSystemProfiles } from '../../data/star-map.js';
import { SystemLocationsEditor } from './SystemLocationsEditor.jsx';
import { useMapDraft } from './useMapDraft.js';
import { useState } from 'react';

export function OfficialSystemsEditor({ profiles = {}, onApply, storageKey }) {
  const [form, setForm] = useMapDraft(storageKey, { selected: '', locations: [] });
  const [message, setMessage] = useState('');
  function choose(id) {
    const system = officialSystems.find((entry) => entry.id === id);
    setForm({ selected: id, locations: structuredClone(profiles[id] ?? system?.locations ?? []) });
    setMessage('');
  }
  function submit(event) {
    event.preventDefault();
    if (!form.selected) return;
    const next = { ...profiles, [form.selected]: form.locations };
    const errors = validateSystemProfiles(next);
    if (errors.length) return setMessage(errors.join(' '));
    onApply(next);
    setMessage(
      'Fichas aplicadas ao rascunho global. Salve o rascunho e publique para atualizar todas as campanhas.',
    );
  }
  return (
    <form onSubmit={submit} className="map-editor-form">
      <p>
        Estas fichas são compartilhadas por todas as campanhas. Nome, posição e instalações da
        referência cartográfica permanecem fixos. A afiliação de um local não altera as cores dos
        territórios.
      </p>
      <label>
        Sistema oficial para consultar / completar
        <select value={form.selected} onChange={(event) => choose(event.target.value)}>
          <option value="">Selecionar sistema…</option>
          {officialSystems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      {form.selected && (
        <>
          <SystemLocationsEditor
            locations={form.locations}
            onChange={(locations) => setForm((current) => ({ ...current, locations }))}
          />
          <button type="submit">APLICAR FICHAS AO RASCUNHO GLOBAL</button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
