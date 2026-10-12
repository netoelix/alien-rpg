import { useEffect, useState } from 'react';
import { positionInSector, positionFromSector, officialSystems } from '../../data/star-map.js';
import { useMapDraft } from './useMapDraft.js';

const initialSystem = { selected: '', name: '', installations: '', x: 0, y: 0 };

export function MapSystemsEditor({ campaign, onApply, pick, storageKey }) {
  const [form, setForm] = useMapDraft(storageKey, initialSystem);
  const systems = campaign.navigation?.systems || [];
  const sector = positionInSector(form.x, form.y);
  const [sectorInput, setSectorInput] = useState({
    sectorX: String(sector.sectorX),
    sectorY: String(sector.sectorY),
  });
  useEffect(() => {
    const position = positionInSector(form.x, form.y);
    setSectorInput({ sectorX: String(position.sectorX), sectorY: String(position.sectorY) });
  }, [form.x, form.y, form.selected]);
  useEffect(() => {
    if (pick) setForm((current) => ({ ...current, ...pick.point }));
  }, [pick, setForm]);
  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  function resetForm() {
    setForm(initialSystem);
    setSectorInput({ sectorX: '0', sectorY: '0' });
  }
  function choose(id) {
    const system = systems.find((entry) => entry.id === id);
    if (!system) {
      resetForm();
      return;
    }
    setForm(
      system
        ? {
            selected: id,
            name: system.name,
            installations: system.installations.join('\n'),
            x: system.x,
            y: system.y,
          }
        : initialSystem,
    );
  }
  function sectorChange(field, value) {
    const next = { ...sector, [field]: Number(value) };
    setForm((current) => ({
      ...current,
      ...positionFromSector(next.sectorX, next.sectorY, next.column, next.row),
    }));
  }
  function submit(event) {
    event.preventDefault();
    const system = {
      id: form.selected || crypto.randomUUID(),
      name: form.name.trim(),
      x: form.x,
      y: form.y,
      installations: form.installations
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    };
    const next = form.selected
      ? systems.map((entry) => (entry.id === form.selected ? system : entry))
      : [...systems, system];
    if (onApply({ ...campaign.navigation, systems: next })) resetForm();
  }
  return (
    <>
      <p>
        Os {officialSystems.length} sistemas conferidos do catálogo oficial são fixos. Cadastre ou
        ajuste abaixo somente os sistemas exclusivos desta campanha.
      </p>
      <label>
        Sistema da campanha para editar
        <select value={form.selected} onChange={(event) => choose(event.target.value)}>
          <option value="">+ Novo sistema</option>
          {systems.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </label>
      <form onSubmit={submit} className="map-editor-form">
        <label>
          Nome do sistema
          <input
            required
            value={form.name}
            onChange={(event) => change('name', event.target.value)}
          />
        </label>
        <div className="map-form-grid">
          {['x', 'y'].map((axis) => (
            <label key={axis}>
              Coordenada {axis.toUpperCase()} (parsecs)
              <input
                type="number"
                step="0.01"
                required
                value={form[axis]}
                onChange={(event) =>
                  change(axis, event.target.value === '' ? '' : Number(event.target.value))
                }
              />
            </label>
          ))}
        </div>
        <fieldset>
          <legend>Posição dentro do quadrado (grade 10 × 10)</legend>
          <div className="map-form-grid">
            {[
              ['sectorX', 'Quadrado X'],
              ['sectorY', 'Quadrado Y'],
            ].map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="-?[0-9]+"
                  required
                  value={sectorInput[field]}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSectorInput((current) => ({ ...current, [field]: value }));
                    if (/^-?[0-9]+$/.test(value)) sectorChange(field, value);
                  }}
                />
              </label>
            ))}
            {[
              ['column', 'Coluna interna'],
              ['row', 'Linha interna'],
            ].map(([field, label]) => (
              <label key={field}>
                {label}
                <select
                  value={sector[field]}
                  onChange={(event) => sectorChange(field, event.target.value)}
                >
                  {Array.from({ length: 10 }, (_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="muted small-text">
            Valores negativos usam o limite inferior do quadrado. X −0,5 pertence ao quadrado −1,
            coluna 5.
          </p>
        </fieldset>
        <label>
          Estações / postos planetários (um por linha)
          <textarea
            value={form.installations}
            onChange={(event) => change('installations', event.target.value)}
          />
        </label>
        <div className="toolbar">
          <button type="submit">
            {form.selected ? 'APLICAR SISTEMA AO RASCUNHO' : 'ADICIONAR SISTEMA AO RASCUNHO'}
          </button>
          <button type="button" onClick={resetForm}>
            LIMPAR FORMULÁRIO
          </button>
          {form.selected && (
            <button
              type="button"
              onClick={() => {
                if (
                  onApply({
                    ...campaign.navigation,
                    systems: systems.filter((entry) => entry.id !== form.selected),
                  })
                )
                  setForm(initialSystem);
              }}
            >
              REMOVER DO RASCUNHO
            </button>
          )}
        </div>
      </form>
    </>
  );
}
