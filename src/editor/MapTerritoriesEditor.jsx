import { useEffect } from 'react';
import { campaignSystems, officialTerritories } from '../../data/star-map.js';
import { useMapDraft } from './useMapDraft.js';

const initialTerritory = {
  selected: '',
  name: '',
  color: '#b568c8',
  kind: 'political',
  shape: 'circle',
  x: 0,
  y: 0,
  radiusLy: 1,
  points: [],
  islands: [],
  part: 0,
};

export function MapTerritoriesEditor({ campaign, onApply, pick, storageKey, onDraw, onContour }) {
  const [form, setForm] = useMapDraft(storageKey, initialTerritory);
  const rings = [form.points, ...(form.islands || [])];
  const points = rings[form.part || 0] || form.points;
  const territories = campaign.navigation?.territories || [];
  const hidden = campaign.navigation?.hiddenTerritories || [];
  const systems = campaignSystems(campaign);
  useEffect(() => {
    if (!pick) return;
    setForm((current) =>
      current.shape === 'polygon'
        ? updateRing(current, [
            ...[current.points, ...(current.islands || [])][current.part || 0],
            pick.point,
          ])
        : { ...current, ...pick.point },
    );
  }, [pick, setForm]);
  useEffect(() => {
    onContour(form.shape === 'polygon' ? points : []);
  }, [form.shape, points, onContour]);
  function updateRing(current, value) {
    if (!current.part) return { ...current, points: value };
    return {
      ...current,
      islands: current.islands.map((ring, index) => (index === current.part - 1 ? value : ring)),
    };
  }
  function change(field, value) {
    setForm((current) =>
      field === 'points' ? updateRing(current, value) : { ...current, [field]: value },
    );
  }
  function choose(id) {
    const territory = territories.find((entry) => entry.id === id);
    setForm(territory ? { ...initialTerritory, ...territory, selected: id } : initialTerritory);
  }
  function personalize(base) {
    const territory = {
      ...structuredClone(base),
      id: crypto.randomUUID(),
      official: false,
      points: base.points.map((point) => ({ ...point })),
    };
    if (
      onApply({
        ...campaign.navigation,
        territories: [...territories, territory],
        hiddenTerritories: [...new Set([...hidden, base.id])],
      })
    )
      setForm({ ...initialTerritory, ...territory, selected: territory.id });
  }
  function submit(event) {
    event.preventDefault();
    const territory = {
      id: form.selected || crypto.randomUUID(),
      name: form.name.trim(),
      kind: form.kind,
      color: form.color,
      shape: form.shape,
      ...(form.shape === 'circle'
        ? { x: form.x, y: form.y, radiusLy: form.radiusLy }
        : { points: form.points, islands: form.islands || [] }),
    };
    const next = form.selected
      ? territories.map((entry) => (entry.id === form.selected ? territory : entry))
      : [...territories, territory];
    if (onApply({ ...campaign.navigation, territories: next })) setForm(initialTerritory);
  }
  return (
    <>
      <p>
        O manto-base usa contornos simplificados da referência. Personalize uma região inteira ou
        adicione uma área local sobre ela. Todas as alterações abaixo pertencem somente a esta
        campanha.
      </p>
      <details className="map-base-regions">
        <summary>Regiões compartilhadas do mapa-base</summary>
        {officialTerritories.map((territory) => (
          <div className="map-base-region" key={territory.id}>
            <label>
              <input
                type="checkbox"
                checked={!hidden.includes(territory.id)}
                onChange={(event) =>
                  onApply({
                    ...campaign.navigation,
                    hiddenTerritories: event.target.checked
                      ? hidden.filter((id) => id !== territory.id)
                      : [...hidden, territory.id],
                  })
                }
              />
              <i className="map-color" style={{ background: territory.color }} />
              {territory.name}
            </label>
            <button type="button" onClick={() => personalize(territory)}>
              PERSONALIZAR NESTA CAMPANHA
            </button>
          </div>
        ))}
      </details>
      <label>
        Território da campanha para editar
        <select value={form.selected} onChange={(event) => choose(event.target.value)}>
          <option value="">+ Novo território</option>
          {territories.map((territory) => (
            <option key={territory.id} value={territory.id}>
              {territory.name}
            </option>
          ))}
        </select>
      </label>
      <form onSubmit={submit} className="map-editor-form">
        <label>
          Nome da área / governo
          <input
            required
            value={form.name}
            onChange={(event) => change('name', event.target.value)}
          />
        </label>
        <div className="map-form-grid">
          <label>
            Tipo
            <select value={form.kind} onChange={(event) => change('kind', event.target.value)}>
              <option value="political">Domínio político</option>
              <option value="geographic">Região geográfica</option>
            </select>
          </label>
          <label>
            Cor do manto
            <input
              type="color"
              value={form.color}
              onChange={(event) => change('color', event.target.value)}
            />
          </label>
          <label>
            Contorno
            <select value={form.shape} onChange={(event) => change('shape', event.target.value)}>
              <option value="circle">Raio em torno de um ponto</option>
              <option value="polygon">Contorno desenhado</option>
            </select>
          </label>
        </div>
        {form.shape === 'circle' ? (
          <>
            <label>
              Centralizar em um sistema
              <select
                value={
                  systems.find((system) => system.x === form.x && system.y === form.y)?.id || ''
                }
                onChange={(event) => {
                  const system = systems.find((entry) => entry.id === event.target.value);
                  if (system) setForm((current) => ({ ...current, x: system.x, y: system.y }));
                }}
              >
                <option value="">Selecionar sistema…</option>
                {systems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="map-form-grid">
              {['x', 'y'].map((axis) => (
                <label key={axis}>
                  Centro {axis.toUpperCase()} (parsecs)
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
              <label>
                Raio (anos-luz)
                <input
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  required
                  value={form.radiusLy}
                  onChange={(event) =>
                    change('radiusLy', event.target.value === '' ? '' : Number(event.target.value))
                  }
                />
              </label>
            </div>
            <p className="muted small-text">
              1 ano-luz corresponde a aproximadamente 0,307 parsec. A borda demarca o raio e o
              brilho suaviza o interior.
            </p>
          </>
        ) : (
          <>
            <p>
              Selecione a ferramenta de contorno e clique no mapa para adicionar vértices. Arrastar
              move a vista. São necessários pelo menos três pontos.
            </p>
            <button type="button" onClick={onDraw}>
              DESENHAR NO MAPA
            </button>
            <label>
              Área do contorno
              <select
                value={form.part || 0}
                onChange={(event) => change('part', Number(event.target.value))}
              >
                {rings.map((_, index) => (
                  <option value={index} key={index}>
                    {index === 0 ? 'Área principal' : 'Área separada ' + index}
                  </option>
                ))}
              </select>
            </label>
            <div className="toolbar">
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    islands: [...(current.islands || []), []],
                    part: (current.islands || []).length + 1,
                  }))
                }
              >
                ADICIONAR ÁREA SEPARADA
              </button>
              {form.part > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      islands: current.islands.filter((_, index) => index !== current.part - 1),
                      part: 0,
                    }))
                  }
                >
                  REMOVER ESTA ÁREA
                </button>
              )}
            </div>
            <div className="map-vertices">
              {points.map((point, index) => (
                <div className="map-vertex-card" key={index}>
                  <strong>Ponto {index + 1}</strong>
                  {['x', 'y'].map((axis) => (
                    <label key={axis}>
                      {axis.toUpperCase()}
                      <input
                        type="number"
                        step="0.1"
                        value={point[axis]}
                        onChange={(event) =>
                          change(
                            'points',
                            points.map((entry, pointIndex) =>
                              pointIndex === index
                                ? {
                                    ...entry,
                                    [axis]:
                                      event.target.value === '' ? '' : Number(event.target.value),
                                  }
                                : entry,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    aria-label={'Remover vértice ' + (index + 1)}
                    onClick={() =>
                      change(
                        'points',
                        points.filter((_, pointIndex) => pointIndex !== index),
                      )
                    }
                  >
                    REMOVER
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => change('points', [...points, { x: 0, y: 0 }])}>
              ADICIONAR VÉRTICE MANUALMENTE
            </button>
          </>
        )}
        <div className="toolbar">
          <button type="submit">APLICAR TERRITÓRIO AO RASCUNHO</button>
          <button type="button" onClick={() => setForm(initialTerritory)}>
            LIMPAR FORMULÁRIO
          </button>
          {form.selected && (
            <button
              type="button"
              onClick={() => {
                if (
                  onApply({
                    ...campaign.navigation,
                    territories: territories.filter((entry) => entry.id !== form.selected),
                  })
                )
                  setForm(initialTerritory);
              }}
            >
              REMOVER TERRITÓRIO DO RASCUNHO
            </button>
          )}
        </div>
      </form>
    </>
  );
}
