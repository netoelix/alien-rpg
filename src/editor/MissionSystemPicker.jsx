import { useId, useState } from 'react';
import { StarGrid } from '../components/StarGrid.jsx';
import { campaignSystems, normalizeSystemName } from '../../data/star-map.js';

export function MissionSystemPicker({ campaign, value, onChange }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [pickOnMap, setPickOnMap] = useState(false);
  const systems = campaignSystems(campaign);
  const selected = systems.find((system) => system.id === value.systemId);
  const options = systems
    .filter((system) =>
      normalizeSystemName(system.name + ' ' + system.installations.join(' ')).includes(
        normalizeSystemName(query),
      ),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const creating = Boolean(value.newSystem);

  function choose(system) {
    onChange({ systemId: system.id, location: system.name, newSystem: undefined });
    setQuery('');
    setOpen(false);
  }

  return (
    <fieldset className="mission-system-picker">
      <legend>Sistema da missão</legend>
      <label>
        Buscar sistema ou instalação
        <input
          type="search"
          value={query}
          autoComplete="off"
          aria-controls={listId}
          aria-expanded={open}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
        />
      </label>
      <button type="button" onClick={() => setOpen(!open)}>
        {open ? 'RECOLHER SISTEMAS' : 'ESCOLHER SISTEMA'}
      </button>
      {open && (
        <div id={listId} className="mission-system-options">
          {options.map((system) => (
            <button type="button" key={system.id} onClick={() => choose(system)}>
              <strong>{system.name}</strong>
              <span>
                {system.installations.join(' / ') || 'Sem instalações cadastradas'} ·{' '}
                {system.official ? 'oficial' : 'campanha'}
              </span>
            </button>
          ))}
          {!options.length && <p>Nenhum sistema encontrado.</p>}
        </div>
      )}
      {selected && (
        <p role="status">
          Vinculado a <strong>{selected.name}</strong> · X {selected.x} / Y {selected.y} pc
        </p>
      )}
      <label>
        Localização exibida no registro · obrigatório
        <input
          required
          value={value.location || ''}
          onChange={(event) => onChange({ location: event.target.value })}
        />
      </label>
      <p className="muted small-text">
        O texto pode indicar uma base ou operação. O vínculo com o sistema permanece mesmo quando
        você altera esse texto.
      </p>
      {selected && (
        <button type="button" onClick={() => onChange({ systemId: '' })}>
          REMOVER VÍNCULO
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          onChange({
            newSystem: creating
              ? undefined
              : { id: crypto.randomUUID(), name: query, x: '', y: '', installations: [] },
          });
          setOpen(false);
        }}
      >
        {creating ? 'CANCELAR NOVO SISTEMA' : 'CADASTRAR SISTEMA NESTA CAMPANHA'}
      </button>
      {creating && (
        <>
          <button type="button" onClick={() => setPickOnMap(!pickOnMap)}>
            {pickOnMap ? 'RECOLHER MAPA' : 'ESCOLHER POSIÇÃO NO MAPA'}
          </button>
          {pickOnMap && (
            <StarGrid
              campaign={campaign}
              onPosition={(point) => onChange({ newSystem: { ...value.newSystem, ...point } })}
              marker={
                Number.isFinite(value.newSystem.x) && Number.isFinite(value.newSystem.y)
                  ? value.newSystem
                  : undefined
              }
            />
          )}
          <div className="map-form-grid">
            <label>
              Nome do novo sistema
              <input
                required
                value={value.newSystem.name}
                onChange={(event) =>
                  onChange({
                    newSystem: { ...value.newSystem, name: event.target.value },
                    ...(!value.location || value.location === value.newSystem.name
                      ? { location: event.target.value }
                      : {}),
                  })
                }
              />
            </label>
            {['x', 'y'].map((axis) => (
              <label key={axis}>
                Coordenada {axis.toUpperCase()} (parsecs)
                <input
                  type="number"
                  required
                  step="0.01"
                  value={value.newSystem[axis]}
                  onChange={(event) =>
                    onChange({
                      newSystem: {
                        ...value.newSystem,
                        [axis]: event.target.value === '' ? '' : Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
            <label>
              Estações e postos · um por linha
              <textarea
                value={value.newSystem.installations.join('\n')}
                onChange={(event) =>
                  onChange({
                    newSystem: {
                      ...value.newSystem,
                      installations: event.target.value.split('\n'),
                    },
                  })
                }
              />
            </label>
            <p className="muted small-text">
              O sistema e seu vínculo serão criados ao aplicar a missão. Você também pode
              posicioná-lo visualmente em Mapa estelar → Sistemas.
            </p>
          </div>
        </>
      )}
    </fieldset>
  );
}
