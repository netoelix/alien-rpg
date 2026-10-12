import { campaignSystems, campaignRoute } from '../../data/star-map.js';
import { useMapDraft } from './useMapDraft.js';

const initialStop = {
  selected: '',
  systemId: '',
  arrival: '',
  departure: '',
  missionIndex: '',
  note: '',
};

export function MapRouteEditor({ campaign, onApply, storageKey }) {
  const [form, setForm] = useMapDraft(storageKey, initialStop);
  const systems = campaignSystems(campaign);
  const route = campaign.navigation?.route || [];
  const identified = campaignRoute(campaign);
  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  function choose(id) {
    const stop = route.find((entry) => entry.id === id);
    setForm(
      stop
        ? {
            ...initialStop,
            ...stop,
            selected: id,
            missionIndex: stop.missionIndex == null ? '' : String(stop.missionIndex),
          }
        : initialStop,
    );
  }
  function submit(event) {
    event.preventDefault();
    const stop = {
      id: form.selected || crypto.randomUUID(),
      systemId: form.systemId,
      arrival: form.arrival.trim(),
      departure: form.departure.trim(),
      note: form.note.trim(),
      missionIndex: form.missionIndex === '' ? null : Number(form.missionIndex),
    };
    const next = form.selected
      ? route.map((entry) => (entry.id === form.selected ? stop : entry))
      : [...route, stop];
    if (onApply({ ...campaign.navigation, route: next })) setForm(initialStop);
  }
  function move(index, direction) {
    const next = [...route];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onApply({ ...campaign.navigation, route: next });
  }
  return (
    <>
      <p>
        As paradas seguem a ordem definida abaixo, inclusive quando você retorna ao mesmo sistema.
        Datas são do universo do jogo. Uma rota manual substitui o percurso identificado pelas
        missões; removendo todas as paradas manuais, esse percurso volta a aparecer.
      </p>
      {!route.length && (
        <p className="muted">
          Percurso das missões: {identified.filter((stop) => stop.system).length} de{' '}
          {identified.length} paradas possuem sistema identificado. Não há linhas atravessando
          paradas sem posição.
        </p>
      )}
      <ol className="map-route-editor-list">
        {route.map((stop, index) => (
          <li key={stop.id}>
            <span>
              {systems.find((system) => system.id === stop.systemId)?.name} · {stop.arrival}
              {stop.departure ? ' → ' + stop.departure : ''}
            </span>
            <div className="toolbar">
              <button type="button" onClick={() => choose(stop.id)}>
                EDITAR PARADA {index + 1}
              </button>
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>
                SUBIR PARADA {index + 1}
              </button>
              <button
                type="button"
                disabled={index === route.length - 1}
                onClick={() => move(index, 1)}
              >
                DESCER PARADA {index + 1}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    onApply({
                      ...campaign.navigation,
                      route: route.filter((entry) => entry.id !== stop.id),
                    }) &&
                    form.selected === stop.id
                  )
                    setForm(initialStop);
                }}
              >
                REMOVER PARADA {index + 1}
              </button>
            </div>
          </li>
        ))}
      </ol>
      <form onSubmit={submit} className="map-editor-form">
        <label>
          Sistema da parada
          <select
            required
            value={form.systemId}
            onChange={(event) => change('systemId', event.target.value)}
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
          <label>
            Chegada no universo
            <input
              required
              value={form.arrival}
              onChange={(event) => change('arrival', event.target.value)}
              placeholder="Ex.: 04/04/2120"
            />
          </label>
          <label>
            Saída no universo (opcional)
            <input
              value={form.departure}
              onChange={(event) => change('departure', event.target.value)}
            />
          </label>
        </div>
        <label>
          Missão associada (opcional)
          <select
            value={form.missionIndex}
            onChange={(event) => {
              const value = event.target.value;
              const mission = campaign.timelines[Number(value)];
              setForm((current) => ({
                ...current,
                missionIndex: value,
                arrival: current.arrival || (value !== '' ? mission.dateTime : ''),
              }));
            }}
          >
            <option value="">Sem associação</option>
            {campaign.timelines.map((mission, index) => (
              <option key={index} value={index}>
                {mission.mission} · {mission.dateTime}
              </option>
            ))}
          </select>
        </label>
        <label>
          Observações da parada
          <textarea value={form.note} onChange={(event) => change('note', event.target.value)} />
        </label>
        <div className="toolbar">
          <button type="submit">
            {form.selected ? 'APLICAR PARADA AO RASCUNHO' : 'ADICIONAR PARADA AO RASCUNHO'}
          </button>
          <button type="button" onClick={() => setForm(initialStop)}>
            NOVA PARADA / LIMPAR
          </button>
        </div>
      </form>
    </>
  );
}
