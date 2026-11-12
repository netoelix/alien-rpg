import { useState } from 'react';
import './FoundryExport.css';

export function FoundryExport({ project, disabled, exporting, setExporting }) {
  const [scale, setScale] = useState(50);
  const [status, setStatus] = useState('');
  const width = Math.round(project.width * scale),
    height = Math.round(project.height * scale);
  return (
    <fieldset className="blueprint-foundry-export">
      <legend>Foundry VTT 14 · experimental</legend>
      <p>Todos os pavimentos, imagens, paredes e acessos em um arquivo.</p>
      <label>
        Resolução
        <select
          value={scale}
          disabled={exporting}
          onChange={(e) => setScale(Number(e.target.value))}
        >
          {[20, 25, 50, 75, 100].map((value) => (
            <option key={value} value={value}>
              {value} pixels por metro
            </option>
          ))}
        </select>
      </label>
      <small>
        {width} × {height} pixels por pavimento. Camadas completas; objetos ocultos não são
        exportados.
      </small>
      <button
        disabled={disabled || exporting}
        onClick={async () => {
          setExporting(true);
          setStatus('Verificando o projeto…');
          try {
            const { downloadFoundryArchive } = await import('./render.jsx');
            await downloadFoundryArchive(project, {
              pixelsPerMeter: scale,
              onProgress: ({ completed, total }) =>
                setStatus(`Gerando imagens: ${completed}/${total}`),
            });
            setStatus('Arquivo .alien-foundry gerado. Importe pelo módulo no Foundry.');
          } catch (error) {
            setStatus(error.message);
          } finally {
            setExporting(false);
          }
        }}
      >
        {exporting ? 'GERANDO…' : 'BAIXAR PARA FOUNDRY'}
      </button>
      <p role="status" aria-live="polite">
        {status}
      </p>
      <small>
        Cada rede de ventilação gera uma cena separada. Portas curvas exigem manter o importador
        0.2.2 ou mais recente ativo para sincronizar seus trechos.
      </small>
      <p>
        <a href="/downloads/alien-blueprint-importer.zip" download>
          Baixar módulo experimental do Foundry
        </a>
      </p>
      <small>
        Extraia em Data/modules, ative o módulo e abra Configurações → Importar mapa Blueprint. Para
        conexões, ative os acessos da Suíte MÃE.
      </small>
    </fieldset>
  );
}
