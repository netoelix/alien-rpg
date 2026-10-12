import { useCallback, useState } from 'react';
import { StarGrid } from '../components/StarGrid.jsx';
import { validateNavigation } from '../../data/star-map.js';
import { MapSystemsEditor } from './MapSystemsEditor.jsx';
import { MapTerritoriesEditor } from './MapTerritoriesEditor.jsx';
import { MapRouteEditor } from './MapRouteEditor.jsx';

export function NavigationEditor({ campaign, onApply, storageKey }) {
  const [tool, setTool] = useState('inspect');
  const [systemPick, setSystemPick] = useState(null);
  const [territoryPick, setTerritoryPick] = useState(null);
  const [contour, setContour] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const updateContour = useCallback((points) => setContour(points), []);
  function apply(navigation) {
    const errors = validateNavigation({ ...campaign, navigation });
    if (errors.length) {
      setError(errors.join(' '));
      setMessage('');
      return false;
    }
    onApply(navigation);
    setError('');
    setMessage('Cartografia aplicada ao rascunho. Confira o site e salve os arquivos com backup.');
    return true;
  }
  return (
    <>
      <p>
        Sol é a origem. O catálogo oficial é compartilhado e fixo. Descobertas, territórios e
        percurso pertencem somente à campanha selecionada.
      </p>
      <label className="map-tool">
        Ferramenta ao clicar no mapa
        <select value={tool} onChange={(event) => setTool(event.target.value)}>
          <option value="inspect">Consultar sistemas</option>
          <option value="system">Posicionar sistema da campanha</option>
          <option value="territory">Posicionar centro / desenhar território</option>
        </select>
      </label>
      <StarGrid
        campaign={campaign}
        polygonPoints={tool === 'territory' ? contour : []}
        marker={tool === 'system' ? systemPick?.point : undefined}
        onPosition={(point) => {
          if (tool === 'system') setSystemPick({ point });
          if (tool === 'territory') setTerritoryPick({ point });
        }}
      />
      {error && (
        <p role="alert" className="map-editor-message">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="map-editor-message">
          {message}
        </p>
      )}
      <details className="map-editor-section" open>
        <summary>SISTEMAS DA CAMPANHA</summary>
        <MapSystemsEditor
          campaign={campaign}
          onApply={apply}
          pick={systemPick}
          storageKey={storageKey + ':systems'}
        />
      </details>
      <details className="map-editor-section">
        <summary>TERRITÓRIOS E REGIÕES</summary>
        <MapTerritoriesEditor
          campaign={campaign}
          onApply={apply}
          pick={territoryPick}
          onDraw={() => setTool('territory')}
          onContour={updateContour}
          storageKey={storageKey + ':territories'}
        />
      </details>
      <details className="map-editor-section">
        <summary>ROTA E PARADAS</summary>
        <MapRouteEditor campaign={campaign} onApply={apply} storageKey={storageKey + ':route'} />
      </details>
    </>
  );
}
