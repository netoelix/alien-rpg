import { useEffect, useRef, useState } from 'react';
import { Drawing } from './Drawing.jsx';
import { AssetSymbol, assetNames } from './Assets.jsx';
import {
  duplicateElement,
  exampleProject,
  layerFor,
  makeModule,
  moveElement,
  nearestWall,
  newProject,
  parseProject,
  removeElement,
  snap,
  uid,
} from './model.js';
import { downloadBlob, exportDrawing, projectFilename } from './export.js';
import './blueprints.css';
const storageKey = 'alien-blueprint-recovery-v1';
// Memória desta aba: navegar pelo site não descarta a planta em andamento.
let sessionProject = null;
let sessionDirty = false;
const toolNames = {
  select: 'Selecionar / mover',
  pan: 'Mover visão',
  room: 'Sala retangular',
  polygon: 'Sala por vértices',
  ellipse: 'Sala circular',
  corridor: 'Corredor',
  door: 'Porta',
  vent: 'Ventilação',
  asset: 'Equipamento',
  module: 'Módulo pronto',
  label: 'Texto',
};
const hints = {
  select:
    'Arraste para mover. Ctrl+D duplica; R gira equipamentos; setas movem pela grade (Shift: 10 passos).',
  pan: 'Arraste o mapa para deslocar a visão.',
  room: 'Arraste do primeiro ao último canto da sala.',
  polygon:
    'Clique nos cantos em ordem. Enter fecha a sala; Backspace remove o último ponto; Escape cancela.',
  ellipse: 'Arraste para definir o tamanho da sala circular ou oval.',
  corridor: 'Clique nos pontos do percurso. Use Concluir traçado ou Enter para terminar.',
  vent: 'Clique nos pontos do duto. Use Concluir traçado ou Enter. Cruzamentos nesta versão são apenas visuais.',
  door: 'Clique próximo à parede de uma sala ou corredor. A abertura acompanha a parede.',
  asset: 'Escolha uma peça e clique na planta. Medidas e rotação podem ser ajustadas depois.',
  module: 'Clique para inserir um módulo de 10 × 8 m. Cada peça pode ser editada separadamente.',
  label: 'Escreva a anotação no painel e clique onde deseja inseri-la.',
};
export default function BlueprintEditor() {
  const [project, setProject] = useState(() => sessionProject || newProject());
  const [past, setPast] = useState([]),
    [future, setFuture] = useState([]);
  const [tool, setTool] = useState('room'),
    [selected, setSelected] = useState(null);
  const [asset, setAsset] = useState('console'),
    [moduleType, setModuleType] = useState('bridge');
  const [lineWidth, setLineWidth] = useState(2),
    [doorWidth, setDoorWidth] = useState(1.5),
    [label, setLabel] = useState('PONTE');
  const [points, setPoints] = useState([]),
    [gesture, setGesture] = useState(null),
    [cursor, setCursor] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [grid, setGrid] = useState(true),
    [magnet, setMagnet] = useState(true);
  const [message, setMessage] = useState(
    'Crie uma planta ou abra um projeto salvo no seu computador.',
  );
  const [autosave, setAutosave] = useState(false),
    [recovery, setRecovery] = useState(false),
    [dirty, setDirty] = useState(sessionDirty);
  const [format, setFormat] = useState('png'),
    [transparent, setTransparent] = useState(false),
    [pixels, setPixels] = useState(2048),
    [exportLayers, setExportLayers] = useState(project.layers.map((l) => l.id)),
    [exporting, setExporting] = useState(false);
  useEffect(() => {
    sessionProject = project;
    sessionDirty = dirty;
  }, [project, dirty]);
  const svgRef = useRef(null),
    fileRef = useRef(null);
  useEffect(() => {
    try {
      setRecovery(Boolean(localStorage.getItem(storageKey)));
    } catch {
      setMessage('Armazenamento local indisponível. Use Salvar projeto.');
    }
  }, []);
  useEffect(() => {
    if (!autosave) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(project));
        setRecovery(true);
      } catch {
        setMessage(
          'Não foi possível guardar a recuperação local. Baixe o projeto para preservar seu trabalho.',
        );
        setAutosave(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [project, autosave]);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function commit(next) {
    try {
      const valid = parseProject(JSON.stringify(next));
      setPast((p) => [...p.slice(-49), project]);
      setFuture([]);
      setProject(valid);
      setDirty(true);
      setMessage('Alteração aplicada somente neste navegador.');
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  }
  function replace(next) {
    setProject(next);
    setPast([]);
    setFuture([]);
    setSelected(null);
    setPoints([]);
    setGesture(null);
    setView({ x: 0, y: 0, zoom: 1 });
    setDirty(false);
  }
  function undo() {
    if (!past.length) return;
    setFuture((f) => [project, ...f]);
    setProject(past.at(-1));
    setPast((p) => p.slice(0, -1));
    setSelected(null);
    setPoints([]);
    setDirty(true);
  }
  function redo() {
    if (!future.length) return;
    setPast((p) => [...p, project]);
    setProject(future[0]);
    setFuture((f) => f.slice(1));
    setSelected(null);
    setDirty(true);
  }
  function allowed(kind) {
    const layer = project.layers.find((l) => l.id === layerFor(kind));
    return layer?.visible && !layer.locked;
  }
  function add(elements) {
    if (elements.some((e) => !allowed(e.kind))) {
      setMessage('Mostre e desbloqueie as camadas usadas por esta ferramenta.');
      return false;
    }
    const ok = commit({ ...project, elements: [...project.elements, ...elements] });
    if (ok) setSelected(elements[0]?.id);
    return ok;
  }
  function location(event, align = true) {
    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const p = point.matrixTransform(svgRef.current.getScreenCTM().inverse());
    return {
      x: Math.max(0, Math.min(project.width, align && magnet ? snap(p.x, project.grid) : p.x)),
      y: Math.max(0, Math.min(project.height, align && magnet ? snap(p.y, project.grid) : p.y)),
    };
  }
  function down(event) {
    if (event.button !== 0) return;
    svgRef.current.focus({ preventScroll: true });
    const p = location(event);
    setCursor(p);
    if (tool === 'pan') {
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({ kind: 'pan', clientX: event.clientX, clientY: event.clientY, view });
      return;
    }
    if (tool === 'select') {
      const id = event.target.closest('[data-object]')?.dataset.object;
      const element = project.elements.find((e) => e.id === id);
      if (!element) {
        setSelected(null);
        return;
      }
      if (!allowed(element.kind)) {
        setMessage('Esta camada está bloqueada.');
        return;
      }
      setSelected(id);
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({ kind: 'move', element, start: p, end: p });
      return;
    }
    if (tool === 'module') {
      add(makeModule(moduleType, p.x, p.y));
      return;
    }
    if (!allowed(tool)) {
      setMessage('Mostre e desbloqueie a camada desta ferramenta.');
      return;
    }
    if (['room', 'ellipse'].includes(tool)) {
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({ kind: tool, start: p, end: p });
      return;
    }
    if (['corridor', 'vent', 'polygon'].includes(tool)) {
      setPoints((old) =>
        old.length && old.at(-1).x === p.x && old.at(-1).y === p.y ? old : [...old, p],
      );
      return;
    }
    if (tool === 'door') {
      const wall = nearestWall(project.elements, p, Math.max(0.75, 2 / view.zoom));
      if (!wall) {
        setMessage('Clique mais perto de uma parede.');
        return;
      }
      add([
        {
          id: uid(),
          kind: 'door',
          wallId: wall.wallId,
          segment: wall.segment,
          t: wall.t,
          width: doorWidth,
        },
      ]);
      return;
    }
    if (tool === 'asset')
      add([{ id: uid(), kind: 'asset', asset, x: p.x, y: p.y, w: 2, h: 2, rotation: 0 }]);
    if (tool === 'label' && label.trim())
      add([{ id: uid(), kind: 'label', x: p.x, y: p.y, text: label, size: 1 }]);
  }
  function move(event) {
    const p = location(event);
    setCursor(p);
    if (!gesture) return;
    if (gesture.kind === 'pan') {
      const matrix = svgRef.current.getScreenCTM();
      setView({
        ...gesture.view,
        x: gesture.view.x - (event.clientX - gesture.clientX) / matrix.a,
        y: gesture.view.y - (event.clientY - gesture.clientY) / matrix.d,
      });
      return;
    }
    setGesture({ ...gesture, end: p });
  }
  function rectangle(g) {
    return {
      id: 'preview',
      kind: g.kind,
      x: Math.min(g.start.x, g.end.x),
      y: Math.min(g.start.y, g.end.y),
      w: Math.abs(g.start.x - g.end.x),
      h: Math.abs(g.start.y - g.end.y),
    };
  }
  function up(event) {
    if (!gesture) return;
    if (svgRef.current.hasPointerCapture(event.pointerId))
      svgRef.current.releasePointerCapture(event.pointerId);
    const g = { ...gesture, end: location(event) };
    setGesture(null);
    if (['room', 'ellipse'].includes(g.kind)) {
      const e = rectangle(g);
      if (e.w >= 0.25 && e.h >= 0.25) add([{ ...e, id: uid() }]);
    }
    if (g.kind === 'move' && (g.end.x !== g.start.x || g.end.y !== g.start.y)) {
      let changed;
      if (g.element.kind === 'door') {
        const wall = nearestWall(project.elements, g.end);
        if (!wall) {
          setMessage('A porta precisa permanecer sobre uma parede.');
          return;
        }
        changed = { ...g.element, wallId: wall.wallId, segment: wall.segment, t: wall.t };
      } else changed = moveElement(g.element, g.end.x - g.start.x, g.end.y - g.start.y);
      commit({
        ...project,
        elements: project.elements.map((e) => (e.id === changed.id ? changed : e)),
      });
    }
  }
  function finish() {
    if (points.length < (tool === 'polygon' ? 3 : 2)) return;
    if (add([{ id: uid(), kind: tool, points, width: lineWidth }])) setPoints([]);
  }
  function changeTool(next) {
    setTool(next);
    setPoints([]);
    setGesture(null);
  }
  function remove() {
    if (selected && allowed(selectedElement?.kind)) {
      commit(removeElement(project, selected));
      setSelected(null);
    }
  }
  async function openFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (
      dirty &&
      !window.confirm('Substituir a planta atual? Baixe o projeto antes se quiser guardá-la.')
    )
      return;
    try {
      if (file.size > 5_000_000) throw new Error('Projeto acima de 5 MB.');
      replace(parseProject(await file.text()));
      setMessage('Projeto aberto do seu computador.');
    } catch (error) {
      setMessage('Não foi possível abrir: ' + error.message);
    }
  }
  const selectedElement = project.elements.find((e) => e.id === selected);
  const editable = selectedElement && allowed(selectedElement.kind);
  function duplicate() {
    if (!editable || gesture || points.length) return;
    try {
      const copy = duplicateElement(project, selected);
      if (commit(copy.project)) {
        setSelected(copy.selectedId);
        setTool('select');
        setMessage(
          'Cópia selecionada. Arraste para posicionar; equipamentos internos são peças independentes.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  function rotateSelection(delta) {
    if (selectedElement?.kind === 'asset' && !gesture && !points.length)
      property('rotation', (((selectedElement.rotation + delta) % 360) + 360) % 360);
  }
  function nudge(dx, dy) {
    if (!editable || selectedElement.kind === 'door' || gesture || points.length) return;
    commit({
      ...project,
      elements: project.elements.map((element) =>
        element.id === selected ? moveElement(element, dx, dy) : element,
      ),
    });
  }
  function property(key, value) {
    if (editable)
      commit({
        ...project,
        elements: project.elements.map((e) => (e.id === selected ? { ...e, [key]: value } : e)),
      });
  }
  function zoom(factor) {
    setView((v) => {
      const z = Math.max(0.5, Math.min(12, v.zoom * factor));
      return {
        zoom: z,
        x: v.x + project.width / v.zoom / 2 - project.width / z / 2,
        y: v.y + project.height / v.zoom / 2 - project.height / z / 2,
      };
    });
  }
  let drawn = project,
    preview = [];
  if (gesture && ['room', 'ellipse'].includes(gesture.kind)) preview = [rectangle(gesture)];
  if (points.length)
    preview = [
      {
        id: 'preview',
        kind: tool,
        width: lineWidth,
        points: cursor ? [...points, cursor] : points,
      },
    ];
  if (gesture?.kind === 'move' && gesture.element.kind !== 'door')
    drawn = {
      ...project,
      elements: project.elements.map((e) =>
        e.id === gesture.element.id
          ? moveElement(e, gesture.end.x - gesture.start.x, gesture.end.y - gesture.start.y)
          : e,
      ),
    };
  // Mantém a grade legível em plantas grandes sem mudar a medida de encaixe.
  const gridStep =
    project.grid * Math.max(1, Math.ceil(project.width / view.zoom / project.grid / 100));
  return (
    <div className="blueprint-editor">
      <div className="blueprint-heading">
        <div>
          <div className="eyebrow">OFICINA CARTOGRÁFICA · VERSÃO INICIAL</div>
          <h1>Criador de plantas</h1>
          <p>Desenhe, monte e exporte. Seus mapas não são enviados ao servidor.</p>
        </div>
        <a href="#/" className="button">
          VOLTAR AO ARQUIVO
        </a>
      </div>
      <div className="blueprint-filebar">
        <button
          onClick={() => {
            if (
              !dirty ||
              window.confirm('Começar outra planta? Salve o projeto atual antes de continuar.')
            )
              replace(newProject());
          }}
        >
          NOVA PLANTA
        </button>
        <button
          onClick={() => {
            if (!dirty || window.confirm('Substituir a planta atual pelo exemplo?'))
              replace(exampleProject());
          }}
        >
          ABRIR EXEMPLO
        </button>
        <button onClick={() => fileRef.current.click()}>ABRIR PROJETO</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.alien-map,application/json"
          hidden
          onChange={openFile}
        />
        <button
          onClick={() => {
            downloadBlob(
              new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }),
              projectFilename(project.name) + '.alien-map',
            );
            setDirty(false);
            setMessage(
              'Download do projeto solicitado. Guarde esse arquivo para editar novamente.',
            );
          }}
        >
          SALVAR PROJETO
        </button>
        <button disabled={!past.length} onClick={undo}>
          DESFAZER
        </button>
        <button disabled={!future.length} onClick={redo}>
          REFAZER
        </button>
        <span>
          {project.elements.length} objetos · {dirty ? 'alterações nesta sessão' : 'projeto pronto'}
        </span>
      </div>
      <p role="status" className="blueprint-status">
        {message}
      </p>
      <div className="blueprint-layout">
        <aside className="blueprint-tools" aria-label="Ferramentas de desenho">
          <h2>Ferramentas</h2>
          <div className="blueprint-tool-grid">
            {Object.entries(toolNames).map(([id, name]) => (
              <button key={id} aria-pressed={tool === id} onClick={() => changeTool(id)}>
                {name}
              </button>
            ))}
          </div>
          {['corridor', 'vent', 'polygon'].includes(tool) && (
            <>
              {tool !== 'polygon' && (
                <label>
                  Largura (m)
                  <input
                    type="number"
                    min=".25"
                    max="50"
                    step=".25"
                    value={lineWidth}
                    onChange={(e) =>
                      setLineWidth(Math.max(0.25, Math.min(50, Number(e.target.value))))
                    }
                  />
                </label>
              )}
              <button disabled={points.length < (tool === 'polygon' ? 3 : 2)} onClick={finish}>
                CONCLUIR TRAÇADO
              </button>
              <button
                disabled={!points.length}
                onClick={() => setPoints((current) => current.slice(0, -1))}
              >
                REMOVER ÚLTIMO PONTO
              </button>
              <button disabled={!points.length} onClick={() => setPoints([])}>
                CANCELAR TRAÇADO
              </button>
            </>
          )}
          {tool === 'door' && (
            <label>
              Largura da porta (m)
              <input
                type="number"
                min=".25"
                max="20"
                step=".25"
                value={doorWidth}
                onChange={(e) => setDoorWidth(Math.max(0.25, Math.min(20, Number(e.target.value))))}
              />
            </label>
          )}
          {tool === 'asset' && (
            <div className="blueprint-assets">
              {Object.entries(assetNames).map(([id, name]) => (
                <button key={id} aria-pressed={asset === id} onClick={() => setAsset(id)}>
                  <svg
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <AssetSymbol type={id} />
                  </svg>
                  {name}
                </button>
              ))}
            </div>
          )}
          {tool === 'module' && (
            <label>
              Módulo (10 × 8 m)
              <select value={moduleType} onChange={(e) => setModuleType(e.target.value)}>
                <option value="bridge">Ponte de comando</option>
                <option value="medical">Enfermaria</option>
                <option value="quarters">Alojamento</option>
              </select>
            </label>
          )}
          {tool === 'label' && (
            <label>
              Anotação
              <input value={label} maxLength="200" onChange={(e) => setLabel(e.target.value)} />
            </label>
          )}
          <details open>
            <summary>Propriedades da seleção</summary>
            {selectedElement ? (
              <>
                <p>
                  {toolNames[selectedElement.kind]}{' '}
                  {selectedElement.asset && '· ' + assetNames[selectedElement.asset]}
                </p>
                <fieldset disabled={!editable}>
                  {['x', 'y', 'w', 'h', 'width', 'size', 'rotation']
                    .filter((key) => typeof selectedElement[key] === 'number')
                    .map((key) => (
                      <label key={key}>
                        {
                          {
                            x: 'X (m)',
                            y: 'Y (m)',
                            w: 'Largura (m)',
                            h: 'Altura (m)',
                            width: 'Largura (m)',
                            size: 'Texto (m)',
                            rotation: 'Rotação (°)',
                          }[key]
                        }
                        <input
                          type="number"
                          step={key === 'rotation' ? 15 : 0.25}
                          value={selectedElement[key]}
                          onChange={(e) => property(key, Number(e.target.value))}
                        />
                      </label>
                    ))}
                  {selectedElement.kind === 'label' && (
                    <label>
                      Texto
                      <input
                        value={selectedElement.text}
                        maxLength="200"
                        onChange={(e) => property('text', e.target.value)}
                      />
                    </label>
                  )}
                  {selectedElement.kind !== 'door' && (
                    <button onClick={duplicate}>DUPLICAR PEÇA</button>
                  )}
                  {selectedElement.kind === 'asset' && (
                    <div className="blueprint-quick-actions">
                      <button onClick={() => rotateSelection(-90)}>GIRAR −90°</button>
                      <button onClick={() => rotateSelection(90)}>GIRAR +90°</button>
                    </div>
                  )}
                  <button onClick={remove}>REMOVER OBJETO</button>
                </fieldset>
              </>
            ) : (
              <p className="muted">Use Selecionar / mover para ajustar uma peça.</p>
            )}
          </details>
        </aside>
        <section className="blueprint-workspace" aria-label="Área de desenho">
          <p className="blueprint-hint">{hints[tool]}</p>
          <div className="blueprint-canvas-toolbar">
            <button aria-label="Ampliar planta" onClick={() => zoom(1.5)}>
              +
            </button>
            <button aria-label="Reduzir planta" onClick={() => zoom(1 / 1.5)}>
              −
            </button>
            <button onClick={() => setView({ x: 0, y: 0, zoom: 1 })}>ENQUADRAR</button>
            <label>
              <input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} />
              Grade
            </label>
            <label>
              <input
                type="checkbox"
                checked={magnet}
                onChange={(e) => setMagnet(e.target.checked)}
              />
              Encaixar
            </label>
            <span>
              {Math.round(view.zoom * 100)}% · grade visível {gridStep} m
            </span>
          </div>
          <svg
            ref={svgRef}
            className="blueprint-canvas"
            viewBox={`${view.x} ${view.y} ${project.width / view.zoom} ${project.height / view.zoom}`}
            role="application"
            aria-label="Planta editável. Escolha uma ferramenta e desenhe. Enter conclui traçado, Escape cancela, Delete remove seleção."
            tabIndex="0"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => setGesture(null)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                duplicate();
              }
              if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                rotateSelection(e.shiftKey ? -90 : 90);
              }
              const direction = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [0, -1],
                ArrowDown: [0, 1],
              }[e.key];
              if (direction && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                const step = project.grid * (e.shiftKey ? 10 : 1);
                nudge(direction[0] * step, direction[1] * step);
              }
              if (e.key === 'Backspace' && points.length) {
                e.preventDefault();
                setPoints((current) => current.slice(0, -1));
              }
              if (e.key === 'Enter' && ['corridor', 'vent', 'polygon'].includes(tool)) {
                e.preventDefault();
                finish();
              }
              if (e.key === 'Escape') {
                setGesture(null);
                setPoints([]);
              }
              if (e.key === 'Delete') {
                e.preventDefault();
                remove();
              }
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                e.shiftKey ? redo() : undo();
              }
            }}
          >
            <Drawing
              project={drawn}
              grid={grid}
              gridStep={gridStep}
              selected={selected}
              preview={preview}
              interactive={tool === 'select'}
            />
          </svg>
          <p className="muted">
            {project.width} × {project.height} m · encaixe de {project.grid} m ·{' '}
            {cursor
              ? `X ${cursor.x.toFixed(2)} / Y ${cursor.y.toFixed(2)} m`
              : 'Arraste salas; clique para posicionar peças.'}
          </p>
        </section>
        <aside className="blueprint-settings" aria-label="Projeto, camadas e exportação">
          <details open>
            <summary>Projeto e escala</summary>
            <label>
              Nome
              <input
                value={project.name}
                maxLength="120"
                onChange={(e) => commit({ ...project, name: e.target.value })}
              />
            </label>
            {['width', 'height'].map((key) => (
              <label key={key}>
                {key === 'width' ? 'Largura' : 'Altura'} da planta (m)
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={project[key]}
                  onChange={(e) => commit({ ...project, [key]: Number(e.target.value) })}
                />
              </label>
            ))}
            <label>
              Encaixe da grade
              <select
                value={project.grid}
                onChange={(e) => commit({ ...project, grid: Number(e.target.value) })}
              >
                {[0.25, 0.5, 1, 2, 5, 10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} m
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">Alterar a grade não redimensiona salas nem objetos.</p>
            <label>
              Aparência
              <select
                value={project.theme}
                onChange={(e) => commit({ ...project, theme: e.target.value })}
              >
                <option value="green">Terminal verde</option>
                <option value="blue">Planta azul</option>
                <option value="print">Impressão clara</option>
              </select>
            </label>
          </details>
          <details open>
            <summary>Camadas</summary>
            {project.layers.map((layer) => (
              <div className="blueprint-layer" key={layer.id}>
                <b>{layer.name}</b>
                <label>
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={(e) =>
                      commit({
                        ...project,
                        layers: project.layers.map((l) =>
                          l.id === layer.id ? { ...l, visible: e.target.checked } : l,
                        ),
                      })
                    }
                  />
                  Visível
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={layer.locked}
                    onChange={(e) =>
                      commit({
                        ...project,
                        layers: project.layers.map((l) =>
                          l.id === layer.id ? { ...l, locked: e.target.checked } : l,
                        ),
                      })
                    }
                  />
                  Bloqueada
                </label>
                <label>
                  Opacidade
                  <input
                    type="range"
                    min=".1"
                    max="1"
                    step=".1"
                    value={layer.opacity}
                    onChange={(e) =>
                      commit({
                        ...project,
                        layers: project.layers.map((l) =>
                          l.id === layer.id ? { ...l, opacity: Number(e.target.value) } : l,
                        ),
                      })
                    }
                  />
                </label>
              </div>
            ))}
          </details>
          <details>
            <summary>Recuperação neste dispositivo</summary>
            <label>
              <input
                type="checkbox"
                checked={autosave}
                onChange={(e) => setAutosave(e.target.checked)}
              />
              Guardar automaticamente neste navegador
            </label>
            <p className="muted">
              Opcional. Não sincroniza entre dispositivos. Baixe o projeto para guardar uma cópia
              duradoura.
            </p>
            <button
              disabled={!recovery}
              onClick={() => {
                if (dirty && !window.confirm('Substituir a planta atual pela recuperação local?'))
                  return;
                try {
                  replace(parseProject(localStorage.getItem(storageKey) || ''));
                  setMessage('Cópia local recuperada.');
                } catch (error) {
                  setMessage(error.message);
                }
              }}
            >
              RECUPERAR CÓPIA LOCAL
            </button>
            <button
              disabled={!recovery}
              onClick={() => {
                if (window.confirm('Apagar somente a cópia de recuperação deste navegador?')) {
                  try {
                    localStorage.removeItem(storageKey);
                    setAutosave(false);
                    setRecovery(false);
                  } catch {
                    setMessage('Não foi possível limpar o armazenamento local.');
                  }
                }
              }}
            >
              APAGAR CÓPIA LOCAL
            </button>
          </details>
          <details open>
            <summary>Exportar imagem</summary>
            <p className="muted">
              A exportação usa toda a planta e mantém o mesmo alinhamento entre camadas. A grade não
              é exportada.
            </p>
            {project.layers.map((l) => (
              <label key={l.id}>
                <input
                  type="checkbox"
                  checked={exportLayers.includes(l.id)}
                  disabled={!l.visible}
                  onChange={(e) =>
                    setExportLayers((ids) =>
                      e.target.checked ? [...ids, l.id] : ids.filter((id) => id !== l.id),
                    )
                  }
                />
                {l.name}
                {!l.visible ? ' (oculta)' : ''}
              </label>
            ))}
            <label>
              Formato
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="png">PNG</option>
                <option value="svg">SVG vetorial</option>
              </select>
            </label>
            <label>
              Maior lado
              <select value={pixels} onChange={(e) => setPixels(Number(e.target.value))}>
                {[1024, 2048, 4096].map((n) => (
                  <option key={n} value={n}>
                    {n} pixels
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
              />
              Fundo transparente
            </label>
            <button
              disabled={exporting || !!gesture || !!points.length}
              onClick={async () => {
                setExporting(true);
                try {
                  await exportDrawing(svgRef.current, project, {
                    format,
                    transparent,
                    pixels,
                    layers: exportLayers.filter(
                      (id) => project.layers.find((l) => l.id === id)?.visible,
                    ),
                  });
                  setMessage(
                    'Download da imagem solicitado. O projeto continua editável nesta sessão.',
                  );
                } catch (error) {
                  setMessage(error.message);
                } finally {
                  setExporting(false);
                }
              }}
            >
              {exporting ? 'GERANDO…' : 'BAIXAR IMAGEM'}
            </button>
          </details>
        </aside>
      </div>
    </div>
  );
}
