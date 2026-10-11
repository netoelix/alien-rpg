import { useState } from 'react';
import { StarGrid } from '../components/StarGrid.jsx';
import { validateNavigation } from '../../data/star-map.js';

export function NavigationEditor({ campaign, onApply }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [name, setName] = useState('');
  const [installations, setInstallations] = useState('');
  const [error, setError] = useState('');
  function add(event) {
    event.preventDefault();
    const navigation = {
      ...campaign.navigation,
      systems: [
        ...(campaign.navigation?.systems || []),
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          ...position,
          installations: installations
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        },
      ],
    };
    const errors = validateNavigation({ navigation });
    if (errors.length) {
      setError(errors.join(' '));
      return;
    }
    onApply(navigation);
    setName('');
    setInstallations('');
    setError('');
  }
  return (
    <>
      <p>
        Sol é a origem. Sistemas oficiais são compartilhados e fixos. Novos sistemas pertencem
        exclusivamente a esta campanha. Clique no mapa ou informe coordenadas em parsecs.
      </p>
      <StarGrid campaign={campaign} onPosition={setPosition} />
      <form onSubmit={add}>
        <label>
          Nome do novo sistema
          <input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        {['x', 'y'].map((axis) => (
          <label key={axis}>
            Eixo {axis.toUpperCase()} (parsecs)
            <input
              required
              type="number"
              step="0.1"
              value={position[axis]}
              onChange={(event) => setPosition({ ...position, [axis]: Number(event.target.value) })}
            />
          </label>
        ))}
        <label>
          Estações / postos planetários (um por linha)
          <textarea
            value={installations}
            onChange={(event) => setInstallations(event.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">ADICIONAR AO RASCUNHO</button>
      </form>
    </>
  );
}
