import { useEffect, useRef, useState } from 'react';
import { ToolIcon } from './ToolIcon.jsx';
import { Drawing } from './Drawing.jsx';
import { AssetSymbol, assetNames } from './Assets.jsx';
import {
  wallTypes,
  wallSegments,
  setWallSection,
  setWallArc,
  fitOpenings,
  duplicateElement,
  exampleProject,
  layerFor,
  makeModule,
  moduleNames,
  moveElement,
  moveRoomContents,
  duplicateRoomContents,
  rotateRoomContents,
  moveVertex,
  changeVertexCount,
  nearestWall,
  openingHasWall,
  newProject,
  parseProject,
  removeElement,
  snap,
  uid,
} from './model.js';
import { downloadBlob, exportDrawing, projectFilename } from './export.js';
import './blueprints.css';
const storageKey = 'alien-blueprint-recovery-v1';
const normalizeSearch = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
// Memória desta aba: navegar pelo site não descarta a planta em andamento.
let sessionProject = null;
let sessionDirty = false;
const toolNames = {
  wall: 'Editar paredes',
  select: 'Selecionar / mover',
  pan: 'Mover visão',
  room: 'Sala retangular',
  polygon: 'Sala por vértices',
  ellipse: 'Sala circular',
  corridor: 'Corredor',
  door: 'Portas e janelas',
  vent: 'Ventilação',
  asset: 'Equipamento',
  module: 'Módulo pronto',
  label: 'Texto',
};
const toolKeys = {
  w: 'wall',
  v: 'select',
  h: 'pan',
  b: 'room',
  p: 'polygon',
  o: 'ellipse',
  c: 'corridor',
  d: 'door',
  n: 'vent',
  a: 'asset',
  m: 'module',
  t: 'label',
};
const hints = {
  wall: 'Clique na borda de uma sala ou corredor. Ajuste o trecho e o tipo no painel.',
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
  const [wallEdge, setWallEdge] = useState(0);
  const [creationWall, setCreationWall] = useState('auto');
  const [arcStart, setArcStart] = useState(0);
  const [roomShift, setRoomShift] = useState({ x: 0, y: 0 });
  const [arcPreview, setArcPreview] = useState(false);
  const [arcEnd, setArcEnd] = useState(90);
  const [wallStart, setWallStart] = useState(0);
  const [wallEnd, setWallEnd] = useState(100);
  const [wallType, setWallType] = useState('internal');
  const [focusMode, setFocusMode] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [project, setProject] = useState(() => sessionProject || newProject());
  const [past, setPast] = useState([]),
    [future, setFuture] = useState([]);
  const [tool, setTool] = useState('room'),
    [selected, setSelected] = useState(null);
  const [asset, setAsset] = useState('console'),
    [moduleType, setModuleType] = useState('bridge');
  const [assetSearch, setAssetSearch] = useState('');
  const matchingAssets = Object.entries(assetNames).filter(([, name]) =>
    normalizeSearch(name).includes(normalizeSearch(assetSearch)),
  );
  const [lineWidth, setLineWidth] = useState(2),
    [doorWidth, setDoorWidth] = useState(1.5),
    [openingType, setOpeningType] = useState('door'),
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
      const valid = parseProject(JSON.stringify(fitOpenings(next)));
      for (const opening of valid.elements.filter((element) => element.kind === 'door')) {
        const previous = project.elements.find((element) => element.id === opening.id);
        if (
          JSON.stringify(previous) !== JSON.stringify(opening) &&
          !openingHasWall(opening, valid.elements)
        )
          throw new Error(
            'Não há parede neste trecho unido. Recrie a divisória em Editar paredes antes de colocar uma porta ou janela.',
          );
      }
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
    const created = elements.map((element) =>
      ['room', 'ellipse', 'polygon', 'corridor'].includes(tool) && creationWall !== 'auto'
        ? {
            ...element,
            walls: wallSegments(element).map((_, segment) => ({
              segment,
              start: 0,
              end: 1,
              type: creationWall,
            })),
          }
        : element,
    );
    const joined = created.map((element) =>
      ['room', 'ellipse', 'polygon', 'corridor'].includes(tool) && element.walls
        ? { ...element, joinWalls: true }
        : element,
    );
    const ok = commit({ ...project, elements: [...project.elements, ...joined] });
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
    if (![0, 1, 2].includes(event.button) || gesture) return;
    event.preventDefault();
    svgRef.current.focus({ preventScroll: true });
    const p = location(event);
    setCursor(p);
    if (tool === 'pan' || event.button === 1 || event.button === 2 || spaceHeld) {
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({ kind: 'pan', clientX: event.clientX, clientY: event.clientY, view });
      return;
    }
    if (tool === 'wall') {
      const hit = nearestWall(
        project.elements,
        location(event, false),
        Math.max(0.75, 2 / view.zoom),
      );
      if (!hit) {
        setMessage('Clique próximo a uma borda.');
        return;
      }
      if (!allowed('room')) {
        setMessage('Mostre e desbloqueie a estrutura.');
        return;
      }
      setSelected(hit.wallId);
      setWallEdge(hit.segment);
      setPanelsOpen(true);
      const edgeSections = (project.elements.find((e) => e.id === hit.wallId)?.walls || []).filter(
        (wall) => wall.segment === hit.segment,
      );
      const section = edgeSections.find((wall) => hit.t >= wall.start && hit.t <= wall.end);
      const gapStart = Math.max(
        0,
        ...edgeSections.filter((wall) => wall.end <= hit.t).map((wall) => wall.end),
      );
      const gapEnd = Math.min(
        1,
        ...edgeSections.filter((wall) => wall.start >= hit.t).map((wall) => wall.start),
      );
      setWallStart((section?.start ?? gapStart) * 100);
      setWallEnd((section?.end ?? gapEnd) * 100);
      setWallType(section?.type ?? 'internal');
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
      const action = event.target.closest('[data-transform]')?.dataset.transform;
      if (action === 'rotate') {
        if (element.kind === 'room') {
          try {
            commit(rotateRoomContents(project, id));
          } catch (error) {
            setMessage(error.message);
          }
        } else if (element.kind === 'asset') {
          commit({
            ...project,
            elements: project.elements.map((item) =>
              item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item,
            ),
          });
        }
        return;
      }
      svgRef.current.setPointerCapture(event.pointerId);
      if (action === 'resize') {
        setGesture({ kind: 'resize', element, start: p, end: p });
        return;
      }
      const vertex = event.target.closest('[data-vertex]');
      if (vertex && element.points) {
        setGesture({
          kind: 'vertex',
          element,
          index: Number(vertex.dataset.vertex),
          start: p,
          end: p,
        });
        return;
      }
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
          openingType,
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
    if (g.kind === 'resize') {
      commit({
        ...project,
        elements: project.elements.map((element) =>
          element.id === g.element.id ? resized(g) : element,
        ),
      });
      return;
    }
    if (g.kind === 'vertex' && (g.end.x !== g.start.x || g.end.y !== g.start.y)) {
      commit({
        ...project,
        elements: project.elements.map((element) =>
          element.id === g.element.id ? moveVertex(element, g.index, g.end) : element,
        ),
      });
      return;
    }
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
  function resized(g) {
    return {
      ...g.element,
      w: Math.max(0.25, g.element.w + g.end.x - g.start.x),
      h: Math.max(0.25, g.element.h + g.end.y - g.start.y),
    };
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
  function vertexProperty(index, axis, value) {
    if (!editable || gesture) return;
    const changed = moveVertex(selectedElement, index, {
      ...selectedElement.points[index],
      [axis]: value,
    });
    commit({
      ...project,
      elements: project.elements.map((element) => (element.id === selected ? changed : element)),
    });
  }
  function vertexCount(index, action) {
    if (!editable || gesture || points.length) return;
    try {
      if (commit(changeVertexCount(project, selected, index, action)))
        setMessage(
          action === 'insert'
            ? 'Vértice inserido no meio do segmento. Arraste-o para modelar o contorno.'
            : 'Vértice removido. Portas em bordas alteradas foram reposicionadas no traçado; confira o resultado.',
        );
    } catch (error) {
      setMessage(error.message);
    }
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
  if (gesture?.kind === 'vertex')
    drawn = {
      ...project,
      elements: project.elements.map((element) =>
        element.id === gesture.element.id
          ? moveVertex(element, gesture.index, gesture.end)
          : element,
      ),
    };
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
  if (gesture?.kind === 'resize')
    drawn = {
      ...project,
      elements: project.elements.map((element) =>
        element.id === gesture.element.id ? resized(gesture) : element,
      ),
    };
  const gridStep =
    project.grid * Math.max(1, Math.ceil(project.width / view.zoom / project.grid / 100));
  return (
    <div
      className={`blueprint-editor ${focusMode ? 'blueprint-focus' : ''} ${!panelsOpen ? 'blueprint-panels-hidden' : ''}`}
    >
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
          <h2>{toolNames[tool]}</h2>
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
            <>
              <label>
                Tipo de abertura
                <select
                  value={openingType}
                  onChange={(event) => setOpeningType(event.target.value)}
                >
                  <option value="door">Porta</option>
                  <option value="window">Janela</option>
                </select>
              </label>
              <label>
                Largura da abertura (m)
                <input
                  type="number"
                  min=".25"
                  max="20"
                  step=".25"
                  value={doorWidth}
                  onChange={(e) =>
                    setDoorWidth(Math.max(0.25, Math.min(20, Number(e.target.value))))
                  }
                />
              </label>
            </>
          )}
          {tool === 'asset' && (
            <>
              <label>
                Buscar equipamento
                <input
                  type="search"
                  value={assetSearch}
                  onChange={(event) => setAssetSearch(event.target.value)}
                  placeholder="Nome da peça"
                />
              </label>
              <p aria-live="polite">
                {matchingAssets.length} peça(s) encontrada(s). Selecionada: {assetNames[asset]}.
              </p>
              <div className="blueprint-assets">
                {matchingAssets.map(([id, name]) => (
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
              {!matchingAssets.length && <p>Nenhum equipamento encontrado. Tente outro nome.</p>}
            </>
          )}
          {tool === 'module' && (
            <label>
              Módulo (10 × 8 m)
              <select value={moduleType} onChange={(e) => setModuleType(e.target.value)}>
                {Object.entries(moduleNames).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {tool === 'wall' && selectedElement && wallSegments(selectedElement).length > 0 && (
            <fieldset disabled={!editable}>
              <label>
                Borda
                <select
                  value={wallEdge}
                  onChange={(event) => {
                    const index = Number(event.target.value);
                    setWallEdge(index);
                    const section = selectedElement.walls?.find((wall) => wall.segment === index);
                    setWallStart((section?.start ?? 0) * 100);
                    setWallEnd((section?.end ?? 1) * 100);
                    setWallType(section?.type ?? 'internal');
                  }}
                >
                  {wallSegments(selectedElement).map((_, index) => (
                    <option key={index} value={index}>
                      Borda {index + 1}
                    </option>
                  ))}
                </select>
              </label>
              <details className="blueprint-wall-intervals">
                <summary>Trechos desta borda</summary>
                {(selectedElement.walls || [])
                  .filter((wall) => wall.segment === wallEdge)
                  .map((wall) => (
                    <button
                      key={wall.start}
                      onClick={() => {
                        setWallStart(wall.start * 100);
                        setWallEnd(wall.end * 100);
                        setWallType(wall.type);
                      }}
                    >
                      {Math.round(wall.start * 100)}–{Math.round(wall.end * 100)}% ·{' '}
                      {wallTypes[wall.type]}
                    </button>
                  ))}
                <button
                  onClick={() => {
                    setWallStart(0);
                    setWallEnd(100);
                  }}
                >
                  SELECIONAR BORDA INTEIRA
                </button>
              </details>
              <label>
                Tipo de parede
                <select value={wallType} onChange={(event) => setWallType(event.target.value)}>
                  <option value="auto">Automática (unir ambientes)</option>
                  {Object.entries(wallTypes).map(([value, name]) => (
                    <option key={value} value={value}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Início do trecho (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={wallStart}
                  onChange={(event) => setWallStart(Number(event.target.value))}
                />
              </label>
              <label>
                Fim do trecho (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={wallEnd}
                  onChange={(event) => setWallEnd(Number(event.target.value))}
                />
              </label>
              <button
                onClick={() => {
                  try {
                    commit(
                      setWallSection(project, selected, {
                        segment: wallEdge,
                        start: wallStart / 100,
                        end: wallEnd / 100,
                        type: wallType,
                      }),
                    );
                  } catch (error) {
                    setMessage(error.message);
                  }
                }}
              >
                APLICAR TRECHO
              </button>
              <p>
                Aplicar altera somente o intervalo escolhido, preservando os demais trechos.
                Automática restaura a união dos ambientes apenas nesse intervalo. Portas e janelas
                recortam a parede; remova a peça antes de transformar seu trecho em abertura livre.
              </p>
              {selectedElement.kind === 'ellipse' && (
                <details onToggle={(event) => setArcPreview(event.currentTarget.open)}>
                  <summary>Editar arco contínuo</summary>
                  <div className="blueprint-quick-actions">
                    {[90, 180, 360].map((angle) => (
                      <button key={angle} onClick={() => setArcEnd(arcStart + angle)}>
                        {angle === 360 ? 'CONTORNO INTEIRO' : `${angle}°`}
                      </button>
                    ))}
                  </div>
                  <p>
                    O tracejado branco mostra o arco antes de aplicar e não aparece na exportação.
                  </p>
                  <p>0° à direita; sentido horário. Para cruzar 0°, use um fim acima de 360°.</p>
                  <label>
                    Início do arco (°)
                    <input
                      type="number"
                      min="0"
                      max="359.99"
                      value={arcStart}
                      onChange={(event) => setArcStart(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Fim do arco (°)
                    <input
                      type="number"
                      min="0"
                      max="720"
                      value={arcEnd}
                      onChange={(event) => setArcEnd(Number(event.target.value))}
                    />
                  </label>
                  <button
                    onClick={() => {
                      try {
                        commit(setWallArc(project, selected, arcStart, arcEnd, wallType));
                      } catch (error) {
                        setMessage(error.message);
                      }
                    }}
                  >
                    APLICAR TIPO AO ARCO
                  </button>
                  <p>Usa o tipo de parede selecionado acima. Desfazer reverte o arco inteiro.</p>
                </details>
              )}
              <details>
                <summary>Padrões para este ambiente</summary>
                <p>Substitui todos os trechos deste ambiente. Espessura apenas visual.</p>
                {[
                  ['internal', 'Divisórias de nave'],
                  ['hull', 'Casco de nave / estação'],
                  ['structural', 'Instalação planetária'],
                ].map(([type, name]) => (
                  <button
                    key={type}
                    onClick={() =>
                      property(
                        'walls',
                        wallSegments(selectedElement).map((_, segment) => ({
                          segment,
                          start: 0,
                          end: 1,
                          type,
                        })),
                      )
                    }
                  >
                    {name}
                  </button>
                ))}
                <button onClick={() => property('walls', [])}>RESTAURAR PAREDES AUTOMÁTICAS</button>
              </details>
            </fieldset>
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
                  {selectedElement.kind === 'door'
                    ? selectedElement.openingType === 'window'
                      ? 'Janela'
                      : 'Porta'
                    : toolNames[selectedElement.kind]}{' '}
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
                  {selectedElement.points && (
                    <details className="blueprint-vertices">
                      <summary>Vértices ({selectedElement.points.length})</summary>
                      <p>
                        Arraste os círculos na planta ou ajuste as coordenadas. As portas acompanham
                        a borda.
                      </p>
                      <div className="blueprint-vertex-list">
                        {selectedElement.points.map((point, index) => (
                          <div key={index} className="blueprint-vertex-row">
                            <span>{index + 1}</span>
                            {['x', 'y'].map((axis) => (
                              <label key={axis}>
                                {axis.toUpperCase()} (m)
                                <input
                                  type="number"
                                  aria-label={`Vértice ${index + 1}, ${axis.toUpperCase()} em metros`}
                                  min="0"
                                  max={axis === 'x' ? project.width : project.height}
                                  step={project.grid}
                                  value={point[axis]}
                                  onChange={(event) =>
                                    vertexProperty(index, axis, Number(event.target.value))
                                  }
                                />
                              </label>
                            ))}
                            <div className="blueprint-vertex-actions">
                              <button
                                type="button"
                                aria-label={`Inserir vértice após ${index + 1}`}
                                disabled={
                                  selectedElement.points.length >= 500 ||
                                  (selectedElement.kind !== 'polygon' &&
                                    index === selectedElement.points.length - 1)
                                }
                                onClick={() => vertexCount(index, 'insert')}
                              >
                                + PONTO
                              </button>
                              <button
                                type="button"
                                aria-label={`Remover vértice ${index + 1}`}
                                disabled={
                                  selectedElement.points.length <=
                                  (selectedElement.kind === 'polygon' ? 3 : 2)
                                }
                                onClick={() => vertexCount(index, 'remove')}
                              >
                                REMOVER
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  {selectedElement.kind === 'door' && (
                    <label>
                      Tipo da abertura selecionada
                      <select
                        value={selectedElement.openingType || 'door'}
                        onChange={(event) => property('openingType', event.target.value)}
                      >
                        <option value="door">Porta</option>
                        <option value="window">Janela</option>
                      </select>
                    </label>
                  )}
                  {selectedElement.kind !== 'door' && (
                    <button onClick={duplicate}>DUPLICAR PEÇA</button>
                  )}
                  {wallSegments(selectedElement).length > 0 && (
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedElement.joinWalls === true}
                        onChange={(event) => property('joinWalls', event.target.checked)}
                      />
                      Unir paredes ao encostar ambientes
                    </label>
                  )}
                  {selectedElement.kind === 'room' && (
                    <details>
                      <summary>Sala com equipamentos</summary>
                      <div className="blueprint-quick-actions">
                        {[-1, 1].map((direction) => (
                          <button
                            key={direction}
                            onClick={() => {
                              try {
                                commit(rotateRoomContents(project, selected, direction));
                              } catch (error) {
                                setMessage(error.message);
                              }
                            }}
                          >
                            GIRAR {direction === 1 ? '+90°' : '−90°'} CONJUNTO
                          </button>
                        ))}
                      </div>
                      <p>
                        Inclui equipamentos inteiramente dentro da sala e suas portas/janelas.
                        Corredores e dutos permanecem no lugar.
                      </p>
                      {['x', 'y'].map((axis) => (
                        <label key={axis}>
                          Deslocamento {axis.toUpperCase()} (m)
                          <input
                            type="number"
                            step={project.grid}
                            value={roomShift[axis]}
                            onChange={(event) =>
                              setRoomShift({ ...roomShift, [axis]: Number(event.target.value) })
                            }
                          />
                        </label>
                      ))}
                      <button
                        onClick={() => {
                          try {
                            if (
                              commit(moveRoomContents(project, selected, roomShift.x, roomShift.y))
                            )
                              setRoomShift({ x: 0, y: 0 });
                          } catch (error) {
                            setMessage(error.message);
                          }
                        }}
                      >
                        MOVER CONJUNTO
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const copy = duplicateRoomContents(
                              project,
                              selected,
                              roomShift.x,
                              roomShift.y,
                            );
                            if (commit(copy.project)) {
                              setSelected(copy.selectedId);
                              setRoomShift({ x: 0, y: 0 });
                            }
                          } catch (error) {
                            setMessage(error.message);
                          }
                        }}
                      >
                        DUPLICAR CONJUNTO
                      </button>
                    </details>
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
          <div className="blueprint-tool-grid" role="toolbar" aria-label="Ferramentas da viewport">
            {Object.entries(toolNames).map(([id, name]) => {
              const shortcut = Object.keys(toolKeys)
                .find((key) => toolKeys[key] === id)
                .toUpperCase();
              return (
                <button
                  key={id}
                  aria-label={name}
                  title={name + ' (' + shortcut + ')'}
                  aria-keyshortcuts={shortcut}
                  aria-pressed={tool === id}
                  onClick={() => {
                    changeTool(id);
                    svgRef.current?.focus();
                  }}
                >
                  <ToolIcon name={id} />
                </button>
              );
            })}
          </div>
          <p className="blueprint-hint">
            {toolNames[tool]} · {hints[tool]}
          </p>
          {(['room', 'ellipse', 'polygon', 'corridor'].includes(tool) || tool === 'door') && (
            <div className="blueprint-context-tools" aria-label="Opções da ferramenta">
              {tool === 'door' ? (
                <>
                  <button
                    aria-pressed={openingType === 'door'}
                    onClick={() => setOpeningType('door')}
                  >
                    Porta
                  </button>
                  <button
                    aria-pressed={openingType === 'window'}
                    onClick={() => setOpeningType('window')}
                  >
                    Janela
                  </button>
                </>
              ) : (
                <label>
                  Parede ao desenhar
                  <select
                    value={creationWall}
                    onChange={(event) => setCreationWall(event.target.value)}
                  >
                    <option value="auto">Automática</option>
                    {Object.entries(wallTypes)
                      .filter(([type]) => type !== 'open')
                      .map(([type, name]) => (
                        <option key={type} value={type}>
                          {name}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            </div>
          )}
          <div className="blueprint-canvas-toolbar">
            <button aria-label="Ampliar planta" onClick={() => zoom(1.5)}>
              +
            </button>
            <button aria-label="Reduzir planta" onClick={() => zoom(1 / 1.5)}>
              −
            </button>
            <button
              title="Enquadrar (Home)"
              aria-label="Enquadrar planta"
              onClick={() => setView({ x: 0, y: 0, zoom: 1 })}
            >
              <ToolIcon name="fit" />
            </button>
            <button
              title="Mostrar ou ocultar painéis"
              aria-label="Mostrar painéis"
              aria-pressed={panelsOpen}
              onClick={() => setPanelsOpen((value) => !value)}
            >
              ☷
            </button>
            <button
              title="Alternar modo de foco (F)"
              aria-label="Modo de foco"
              aria-pressed={focusMode}
              onClick={() => setFocusMode((value) => !value)}
            >
              <ToolIcon name="focus" />
            </button>
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
            className={`blueprint-canvas ${gesture?.kind === 'pan' ? 'is-panning' : tool === 'pan' || spaceHeld ? 'can-pan' : ''}`}
            viewBox={`${view.x} ${view.y} ${project.width / view.zoom} ${project.height / view.zoom}`}
            role="application"
            aria-label="Planta editável. Escolha uma ferramenta e desenhe. Enter conclui traçado, Escape cancela, Delete remove seleção."
            tabIndex="0"
            onContextMenu={(event) => event.preventDefault()}
            onKeyUp={(event) => {
              if (event.code === 'Space') setSpaceHeld(false);
            }}
            onBlur={() => {
              setSpaceHeld(false);
              setGesture(null);
            }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => setGesture(null)}
            onKeyDown={(e) => {
              if (e.code === 'Space') {
                e.preventDefault();
                setSpaceHeld(true);
                return;
              }
              if (!e.ctrlKey && !e.metaKey && !e.altKey && !gesture) {
                const key = e.key.toLowerCase();
                if (toolKeys[key]) {
                  e.preventDefault();
                  changeTool(toolKeys[key]);
                  return;
                }
                if (key === 'f') {
                  e.preventDefault();
                  if (!e.repeat) setFocusMode((value) => !value);
                  return;
                }
                if (key === 'home') {
                  e.preventDefault();
                  setView({ x: 0, y: 0, zoom: 1 });
                  return;
                }
                if (key === '+' || key === '=') {
                  e.preventDefault();
                  zoom(1.5);
                  return;
                }
                if (key === '-') {
                  e.preventDefault();
                  zoom(1 / 1.5);
                  return;
                }
              }

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
                setFocusMode(false);
                setSpaceHeld(false);
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
              arcSelection={
                tool === 'wall' && arcPreview && selectedElement?.kind === 'ellipse'
                  ? { id: selected, start: arcStart, end: arcEnd }
                  : null
              }
              wallSelection={
                tool === 'wall'
                  ? { id: selected, segment: wallEdge, start: wallStart / 100, end: wallEnd / 100 }
                  : null
              }
              editVertices={tool === 'select' && !!editable}
              handleRadius={Math.max(0.15, project.width / view.zoom / 100)}
              project={drawn}
              grid={grid}
              gridStep={gridStep}
              selected={selected}
              preview={preview}
              interactive={tool === 'select'}
            />
          </svg>
          <p className="blueprint-coordinates muted">
            {project.width} × {project.height} m · encaixe de {project.grid} m ·{' '}
            {cursor
              ? `X ${cursor.x.toFixed(2)} / Y ${cursor.y.toFixed(2)} m`
              : 'Arraste salas; clique para posicionar peças.'}
          </p>
        </section>
        <aside className="blueprint-settings" aria-label="Projeto, camadas e exportação">
          <details>
            <summary>Atalhos e navegação</summary>
            <p>
              Arraste com o botão do meio ou direito para mover a visão. Espaço + arraste também
              funciona. + / −: zoom. Home: enquadrar. F: modo de foco. Escape: sair do foco ou
              cancelar. Passe sobre os ícones para ver os atalhos de ferramentas. Os atalhos
              funcionam com foco na planta; Tab continua navegando pelos controles.
            </p>
          </details>
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
