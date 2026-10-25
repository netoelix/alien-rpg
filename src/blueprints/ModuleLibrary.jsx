import { ModuleThumbnail } from './ModulePreview.jsx';
import { useRef, useState } from 'react';
import {
  createModule,
  parseModuleLibrary,
  mergeModuleLibrary,
  serializeModuleLibrary,
  moduleBounds,
} from './modules.js';
import { downloadBlob, projectFilename } from './export.js';
export function ModuleLibrary({ project, ids, disabled, onPlace, onError }) {
  const [modules, setModules] = useState([]);
  const [name, setName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const latestModules = useRef(modules);
  latestModules.current = modules;
  const [search, setSearch] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const normalize = (value) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const input = useRef(null);
  return (
    <details className="blueprint-module-library">
      <summary>Meus módulos ({modules.length})</summary>
      <small>
        Biblioteca desta sessão. Baixe os módulos para reutilizar depois em qualquer mapa.
      </small>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          try {
            const module = createModule(project, ids, name);
            setModules(mergeModuleLibrary(modules, [module]));
            setName('');
          } catch (error) {
            onError(error.message);
          }
        }}
      >
        <label>
          Nome do módulo
          <input
            maxLength={80}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enfermaria, ponte…"
          />
        </label>
        <button disabled={disabled || !ids.length}>Guardar seleção</button>
      </form>
      <small>
        Selecione as peças desejadas. Portas e janelas acompanham suas estruturas; salas
        retangulares incluem os equipamentos internos.
      </small>
      <input
        hidden
        type="file"
        ref={input}
        accept=".alien-module,.alien-library,application/json"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          setImporting(true);
          setImportStatus('');
          try {
            if (file.size > 20000000) throw new Error('Biblioteca acima de 20 MB.');
            const incoming = parseModuleLibrary(await file.text());
            const merged = mergeModuleLibrary(latestModules.current, incoming);
            const added = merged.length - latestModules.current.length;
            latestModules.current = merged;
            setModules(merged);
            setSearch('');
            setImportStatus(
              added
                ? `${added} módulo(s) importado(s).`
                : 'Os módulos deste arquivo já estão na biblioteca.',
            );
          } catch (error) {
            setImportStatus(error.message);
            onError(error.message);
          } finally {
            setImporting(false);
          }
        }}
      />
      <button disabled={disabled || importing} onClick={() => input.current.click()}>
        Importar módulo / biblioteca
      </button>
      <button
        disabled={!modules.length}
        onClick={() => {
          try {
            downloadBlob(
              new Blob([serializeModuleLibrary(modules)], { type: 'application/json' }),
              'meus-modulos.alien-library',
            );
          } catch (error) {
            onError(error.message);
          }
        }}
      >
        Baixar biblioteca inteira
      </button>
      <p role="status">{importing ? 'Importando biblioteca…' : importStatus}</p>
      <label>
        Buscar módulo
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nome do módulo…"
        />
      </label>
      {!!modules.length &&
        !modules.some((module) => normalize(module.name).includes(normalize(search))) && (
          <p>Nenhum módulo encontrado.</p>
        )}
      {modules.map(
        (module, index) =>
          normalize(module.name).includes(normalize(search)) && (
            <article className="deck-link-card" key={index}>
              <ModuleThumbnail module={module} />
              <strong>{module.name}</strong>
              <small>
                {' '}
                · {module.elements.length} peças · {moduleBounds(module).w.toFixed(1)} ×{' '}
                {moduleBounds(module).h.toFixed(1)} m
              </small>
              {renaming === index && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!newName.trim()) return;
                    setModules((items) =>
                      items.map((item, i) =>
                        i === index ? { ...item, name: newName.trim() } : item,
                      ),
                    );
                    setRenaming(null);
                  }}
                >
                  <label>
                    Novo nome
                    <input
                      maxLength={80}
                      required
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                    />
                  </label>
                  <button disabled={disabled}>Salvar nome</button>
                  <button type="button" onClick={() => setRenaming(null)}>
                    Cancelar
                  </button>
                </form>
              )}
              <div className="blueprint-module-actions">
                <button
                  disabled={disabled}
                  onClick={() => {
                    setRenaming(index);
                    setNewName(module.name);
                  }}
                >
                  Renomear
                </button>
                <button disabled={disabled} onClick={() => onPlace(module)}>
                  Posicionar
                </button>
                <button
                  onClick={() =>
                    downloadBlob(
                      new Blob([JSON.stringify(module, null, 2)], { type: 'application/json' }),
                      projectFilename(module.name) + '.alien-module',
                    )
                  }
                >
                  Baixar
                </button>
                <button
                  disabled={disabled}
                  onClick={() => {
                    if (window.confirm('Remover este módulo da biblioteca da sessão?')) {
                      setModules((items) => items.filter((_, i) => i !== index));
                      setRenaming(null);
                    }
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ),
      )}
    </details>
  );
}
