import { NumberField } from './NumberField.jsx';
import { projectModes, isColony, assetInMode, toolInMode, pathInMode } from './project-mode.js';
import { OptionButtons } from './OptionButtons.jsx';
import { pathTools, pathChoices, pathPreset } from './path-tools.js';
import { areaTools, areaElement } from './area-tools.js';
import { VisualChoices } from './VisualChoices.jsx';
import { legacyAssets } from './legacy-assets.js';
import { moveDestinationLabel } from './destination-labels.js';
import { beginObjectDrag, objectDragStarted } from './object-drag.js';
import { switchFloor as switchVentFloor } from './floors.js';
import { VentPortControls } from './VentPortControls.jsx';
import { nearestVentPort } from './vent-ports.js';
import { TraceControls } from './TraceControls.jsx';
import { reorderAsset } from './asset-order.js';
import { levelAssets } from './level-assets.js';
import { FloorFinishControls } from './FloorFinishControls.jsx';
import { floorKinds } from './floor-finishes.js';
import { ventAccessTypes, followVentWalls } from './ventilation.js';
import { PlacementPreview } from './PlacementPreview.jsx';
import { openingCandidate } from './placement.js';
import { AssetCatalog } from './AssetCatalog.jsx';
import { assetFootprint, furniture } from './furniture.js';
import { snapToObjects } from './snapping.js';
import { setCorridorEnd } from './corridor-ends.js';
import { DimensionControls } from './DimensionControls.jsx';
import { dimensionOffset } from './dimensions.js';
import { Dimension } from './Dimension.jsx';
import { TextControls } from './TextControls.jsx';
import { LabelText } from './LabelText.jsx';
import { ModuleSketch, ModulePlacementPreview } from './ModulePreview.jsx';
import { ModuleLibrary } from './ModuleLibrary.jsx';
import { placeModuleGrid, rotateModule } from './modules.js';
import { arrangements, arrangeEquipment, objectView } from './arrange.js';
import { activeFloor, floorList } from './floors.js';
import { ObjectsPanel } from './ObjectsPanel.jsx';
import { objectEditable, assertObjectChanges } from './objects.js';
import { pruneConnections, addConnections } from './connections.js';
import { DeckReference, DeckConnections } from './DeckConnections.jsx';
import { FloorControls } from './FloorControls.jsx';
import { useEffect, useRef, useState } from 'react';
import { ToolIcon } from './ToolIcon.jsx';
import { Drawing } from './Drawing.jsx';
import { resizeElement, rotateAsset } from './resize.js';
import {
  expandGroups,
  setSelectionGroup,
  rotateGroup,
  freeRotationFrame,
  rotationDragAngle,
  convertRoomsToPolygons,
} from './groups.js';
import { selectInBox, selectionBounds } from './selection.js';
import {
  copyBlueprint,
  pasteBlueprint,
  movePastedGroup,
  removeSelection,
  duplicateSelection,
} from './clipboard.js';
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
const emptyDrawingPreview = [];
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
  trace: 'Traçados',
  floorRegion: 'Região de piso / água',
  asset: 'Equipamento',
  module: 'Módulo pronto',
  label: 'Texto',
  dimension: 'Cota de distância',
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
  floorRegion: 'Marque os vértices; Enter conclui e Escape cancela. Sem paredes.',
  wall: 'Clique na borda de uma sala ou corredor. Ajuste o trecho e o tipo no painel.',
  select:
    'Arraste para mover. Ctrl+C/Ctrl+V copia e cola; Ctrl+D duplica; setas movem (Shift: 10 passos).',
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
  dimension: 'Clique no início e no fim da medida. Arraste os pontos para ajustar; Escape cancela.',
  label: 'Escreva a anotação no painel e clique onde deseja inseri-la.',
};
export default function BlueprintEditor() {
  const clipboard = useRef(null);
  const [objectSnap, setObjectSnap] = useState(true);
  const [snapGuides, setSnapGuides] = useState([]);
  const pendingGuides = useRef([]);
  const [pastedGroup, setPastedGroup] = useState(null);
  const [manualWall, setManualWall] = useState(false);
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
  const [portPlacement, setPortPlacement] = useState(null);
  const [areaPurpose, setAreaPurpose] = useState('room');
  const [regionFinish, setRegionFinish] = useState({ type: 'plates', size: 1, opacity: 0.3 });
  const [traceStyle, setTraceStyle] = useState({ traceType: 'rail', rounded: true, side: 1 });
  const [project, setProject] = useState(() => sessionProject || newProject());
  const [referenceFloors, setReferenceFloors] = useState([]);
  const [connectionPlacement, setConnectionPlacement] = useState(null);
  const [assetRotation, setAssetRotation] = useState(0);
  const [modulePlacement, setModulePlacement] = useState(null);
  const [repeatModule, setRepeatModule] = useState(false);
  const [moduleGridOptions, setModuleGridOptions] = useState({ rows: 1, columns: 1, gap: 0 });
  const visibleReferences = floorList(project).filter(
    (floor) => floor.id !== activeFloor(project) && referenceFloors.includes(floor.id),
  );
  const [past, setPast] = useState([]),
    [future, setFuture] = useState([]);
  const [tool, setTool] = useState('room'),
    [selected, setSelected] = useState(null);
  const [asset, setAsset] = useState('commandBench'),
    [moduleType, setModuleType] = useState('bridge');
  const [assetSearch, setAssetSearch] = useState('');
  const [dimensionStyle, setDimensionStyle] = useState({ mode: 'direct', offset: 0 });
  const [labelStyle, setLabelStyle] = useState({ size: 1, align: 'start', bold: false });
  const [selectionAngle, setSelectionAngle] = useState(15);
  const [arrangement, setArrangement] = useState('left');
  const [rotationPivot, setRotationPivot] = useState(null);
  const matchingAssets = Object.entries(assetNames).filter(
    ([id, name]) =>
      !Object.hasOwn(legacyAssets, id) &&
      assetInMode(project, id) &&
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
  useEffect(() => {
    setTool('select');
    setPoints([]);
    setGesture(null);
    setCursor(null);
    setModulePlacement(null);
    setConnectionPlacement(null);
    setPortPlacement(null);
    setAreaPurpose(project.mode === 'colony' ? 'floor' : 'room');
  }, [project.mode]);
  function commit(next) {
    try {
      const valid = parseProject(
        JSON.stringify(pruneConnections(fitOpenings(followVentWalls(project, next)))),
      );
      assertObjectChanges(project, valid);
      for (const opening of valid.elements.filter((element) => element.kind === 'door')) {
        const previous = project.elements.find((element) => element.id === opening.id);
        if (
          JSON.stringify(previous) !== JSON.stringify(opening) &&
          !openingHasWall(opening, valid.elements)
        )
          throw new Error(
            'Este trecho está aberto. Restaure a parede em Editar paredes antes de colocar uma porta ou janela.',
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
    setReferenceFloors([]);
    setConnectionPlacement(null);
    setModulePlacement(null);
    setPastedGroup(null);
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
    setConnectionPlacement(null);
    setModulePlacement(null);
    setGesture(null);
    setRotationPivot(null);
    setPastedGroup(null);
    if (!past.length) return;
    setFuture((f) => [project, ...f]);
    setProject(past.at(-1));
    setPast((p) => p.slice(0, -1));
    setSelected(null);
    setPoints([]);
    setDirty(true);
  }
  function redo() {
    setConnectionPlacement(null);
    setModulePlacement(null);
    setGesture(null);
    setPastedGroup(null);
    setRotationPivot(null);
    setPoints([]);
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
    if (areaTools.includes(tool))
      elements = elements.map((e) => areaElement(e, areaPurpose, regionFinish));
    if (elements.some((e) => !allowed(e.kind))) {
      setMessage('Mostre e desbloqueie as camadas usadas por esta ferramenta.');
      return false;
    }
    const created = elements.map((element) =>
      ['room', 'ellipse', 'polygon', 'corridor'].includes(element.kind) && creationWall !== 'auto'
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
        ? { ...element, joinWalls: false }
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
    const enabled = align && !event.altKey;
    const overflow =
      isColony(project) &&
      (tool === 'asset' ||
        (tool === 'select' &&
          (gesture?.element?.kind === 'asset' || selectedElement?.kind === 'asset')));
    const low = overflow ? -2000 : 0;
    const raw = {
      x: Math.max(low, Math.min(project.width, p.x)),
      y: Math.max(low, Math.min(project.height, p.y)),
    };
    const result = {
      x: enabled && magnet ? snap(raw.x, project.grid) : raw.x,
      y: enabled && magnet ? snap(raw.y, project.grid) : raw.y,
    };
    pendingGuides.current = [];
    const eligible = gesture
      ? ['move', 'vertex', 'room', 'ellipse'].includes(gesture.kind)
      : [
          'room',
          'ellipse',
          'polygon',
          'corridor',
          'wall',
          'dimension',
          'asset',
          'label',
          'vent',
          'trace',
          'floorRegion',
        ].includes(tool);
    if (enabled && objectSnap && eligible && !spaceHeld) {
      const excluded = gesture?.element ? pastedGroup?.ids || [gesture.element.id] : [];
      const moving =
        gesture?.kind === 'move' ? project.elements.filter((e) => excluded.includes(e.id)) : [];
      const scale = Math.hypot(svgRef.current.getScreenCTM().a, svgRef.current.getScreenCTM().b);
      const match = snapToObjects(project, raw, {
        threshold: 8 / scale,
        excluded,
        moving,
        start: gesture?.start || raw,
      });
      for (const guide of match.guides) result[guide.axis] = match[guide.axis];
      pendingGuides.current = match.guides;
    }
    return {
      x: Math.max(low, Math.min(project.width, result.x)),
      y: Math.max(low, Math.min(project.height, result.y)),
    };
  }
  function down(event) {
    if (![0, 1, 2].includes(event.button) || gesture) return;
    event.preventDefault();
    svgRef.current.focus({ preventScroll: true });
    const p = location(event);
    const destination = event.target.closest('[data-destination-object]');
    if (destination && tool === 'select' && event.button === 0 && !spaceHeld) {
      const element = project.elements.find((e) => e.id === destination.dataset.destinationObject);
      if (!element || element.locked || !allowed(element.kind)) return;
      const point = location(event, false);
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({
        ...beginObjectDrag(element, point, event),
        kind: 'destinationLabel',
        labelKey: destination.dataset.destinationKey,
      });
      return;
    }
    if (portPlacement) {
      const vent = project.elements.find((e) => e.id === portPlacement && e.kind === 'vent');
      if (!vent || !allowed('vent')) {
        setPortPlacement(null);
        return;
      }
      const hit = nearestVentPort(vent.points, p);
      if (!hit || hit.distance > Math.max(0.4, vent.width / 2)) {
        setMessage('Clique sobre o duto selecionado para criar o acesso.');
        return;
      }
      if ((vent.ports || []).length >= 100) {
        setPortPlacement(null);
        return;
      }
      const port = {
        id: uid(),
        segment: hit.segment,
        t: hit.t,
        type: 'grille',
        side: 1,
        label: '',
      };
      if (
        commit({
          ...project,
          elements: project.elements.map((e) =>
            e.id === vent.id ? { ...e, ports: [...(e.ports || []), port] } : e,
          ),
        })
      ) {
        setPortPlacement(null);
        setMessage('Acesso criado. Ajuste tipo, lado e destino nas propriedades.');
      }
      return;
    }

    setCursor(p);
    if (tool === 'pan' || event.button === 1 || event.button === 2 || spaceHeld) {
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({ kind: 'pan', clientX: event.clientX, clientY: event.clientY, view });
      return;
    }
    if (modulePlacement) {
      try {
        const result = placeModuleGrid(project, modulePlacement, p.x, p.y, moduleGridOptions);
        if (commit(result.project)) {
          const keepPlacing = repeatModule || event.shiftKey;
          setSelected(keepPlacing ? null : result.selectedId);
          setPastedGroup(keepPlacing ? null : { selectedId: result.selectedId, ids: result.ids });
          if (!keepPlacing) setModulePlacement(null);
          setMessage(
            keepPlacing
              ? 'Cópia inserida. Clique para inserir outra; Escape encerra.'
              : 'Módulo inserido. As peças continuam selecionadas para mover o conjunto.',
          );
        }
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    if (connectionPlacement) {
      try {
        if (
          commit(
            addConnections(
              project,
              connectionPlacement.targetIds,
              connectionPlacement.type,
              p.x,
              p.y,
            ),
          )
        ) {
          setConnectionPlacement(null);
          setModulePlacement(null);
          setMessage('Conexão criada nos pavimentos selecionados.');
        }
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    if (tool === 'select' && event.target.closest('[data-rotation-pivot]') && rotationFrame) {
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({ kind: 'rotationPivot', start: p, end: p, key: rotationKey });
      return;
    }
    if (tool === 'select' && event.target.closest('[data-rotate-group]') && rotationFrame) {
      const point = location(event, false);
      svgRef.current.setPointerCapture(event.pointerId);
      setGesture({
        kind: 'rotateGroup',
        frame: rotationFrame,
        start: point,
        end: point,
        step: event.shiftKey ? 15 : 1,
      });
      return;
    }
    if (tool === 'wall' && manualWall) {
      if (!allowed('partition')) {
        setMessage('Mostre e desbloqueie a estrutura.');
        return;
      }
      if (!points.length) setPoints([p]);
      else if (Math.hypot(p.x - points[0].x, p.y - points[0].y) >= 0.25) {
        if (
          add([
            {
              id: uid(),
              kind: 'partition',
              points: [points[0], p],
              walls: [
                { segment: 0, start: 0, end: 1, type: wallType === 'open' ? 'internal' : wallType },
              ],
            },
          ])
        )
          setPoints([]);
      }
      return;
    }
    if (tool === 'wall') {
      const hit = nearestWall(
        project.elements.filter((item) => objectEditable(project, item)),
        location(event, false),
        Math.max(0.75, 2 / view.zoom),
      );
      if (!hit) {
        setMessage('Clique próximo a uma borda.');
        return;
      }
      if (
        !allowed('room') ||
        !objectEditable(
          project,
          project.elements.find((item) => item.id === hit.wallId),
        )
      ) {
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
        svgRef.current.setPointerCapture(event.pointerId);
        setGesture({ kind: 'marquee', start: p, end: p, additive: event.shiftKey });
        return;
      }
      if (!objectEditable(project, element)) {
        setMessage('Esta camada está bloqueada.');
        return;
      }
      setSelected(id);
      if (element.groupId && !event.shiftKey) {
        const ids = expandGroups(project, [id]);
        const primary =
          element.kind === 'door'
            ? project.elements.find((item) => ids.includes(item.id) && item.kind !== 'door') ||
              element
            : element;
        setSelected(primary.id);
        setPastedGroup({ selectedId: primary.id, ids });
        svgRef.current.setPointerCapture(event.pointerId);
        setGesture(beginObjectDrag(primary, p, event));
        return;
      }
      if (event.shiftKey && element.kind !== 'door') {
        const ids = new Set(pastedGroup?.ids || (selected ? [selected] : []));
        const members = expandGroups(project, [id]);
        if (ids.has(id)) members.forEach((member) => ids.delete(member));
        else members.forEach((member) => ids.add(member));
        const selectedId =
          [...ids].find(
            (key) => project.elements.find((item) => item.id === key)?.kind !== 'door',
          ) || null;
        setSelected(selectedId);
        setPastedGroup(selectedId ? { selectedId, ids: [...ids] } : null);
        return;
      }
      if (pastedGroup?.ids.includes(id) && element.kind !== 'door') {
        setPastedGroup({ ...pastedGroup, selectedId: id });
      } else setPastedGroup(null);
      const action = event.target.closest('[data-transform]')?.dataset.transform;
      if (action === 'rotate') {
        const point = location(event, false);
        svgRef.current.setPointerCapture(event.pointerId);
        setGesture({
          kind: 'rotate',
          element,
          start: point,
          end: point,
          step: event.shiftKey ? 15 : 1,
        });
        return;
      }
      svgRef.current.setPointerCapture(event.pointerId);
      if (action === 'resize') {
        setGesture({
          kind: 'resize',
          element,
          handle: event.target.closest('[data-resize-handle]')?.dataset.resizeHandle || 'se',
          proportional: event.shiftKey,
          start: p,
          end: p,
        });
        return;
      }
      if (element.kind === 'dimension' && event.target.closest('[data-dimension-offset]')) {
        setGesture({ kind: 'dimensionOffset', element, start: p, end: p });
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
      setGesture(beginObjectDrag(element, p, event));
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
    if (tool === 'dimension') {
      if (!points.length) setPoints([p]);
      else if (Math.hypot(p.x - points[0].x, p.y - points[0].y) >= 0.25) {
        add([{ id: uid(), kind: 'dimension', points: [points[0], p], ...dimensionStyle }]);
        setPoints([]);
      }
      return;
    }
    if (['corridor', 'vent', 'polygon', 'trace', 'floorRegion'].includes(tool)) {
      setPoints((old) =>
        old.length && old.at(-1).x === p.x && old.at(-1).y === p.y ? old : [...old, p],
      );
      return;
    }
    if (tool === 'door') {
      const candidate = openingCandidate(
        project,
        p,
        doorWidth,
        openingType,
        Math.max(0.75, 2 / view.zoom),
      );
      if (candidate.error) {
        setMessage(candidate.error);
        return;
      }
      add([{ ...candidate.element, id: uid() }]);
      return;
    }
    if (tool === 'asset')
      add([
        {
          id: uid(),
          kind: 'asset',
          asset,
          x: p.x,
          y: p.y,
          ...assetFootprint(asset),
          rotation: assetRotation,
        },
      ]);
    if (tool === 'label' && label.trim())
      add([{ id: uid(), kind: 'label', x: p.x, y: p.y, text: label, ...labelStyle }]);
  }
  function move(event) {
    if (['move', 'destinationLabel'].includes(gesture?.kind) && !objectDragStarted(gesture, event))
      return;
    const p = location(event);
    setSnapGuides(pendingGuides.current);
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
    setGesture({
      ...gesture,
      dragging: ['move', 'destinationLabel'].includes(gesture.kind) ? true : gesture.dragging,
      end: ['rotate', 'rotateGroup', 'destinationLabel'].includes(gesture.kind)
        ? location(event, false)
        : p,
      step: event.shiftKey ? 15 : 1,
      proportional: event.shiftKey,
    });
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
    setSnapGuides([]);
    if (!gesture) return;
    if (svgRef.current.hasPointerCapture(event.pointerId))
      svgRef.current.releasePointerCapture(event.pointerId);
    if (['move', 'destinationLabel'].includes(gesture.kind) && !objectDragStarted(gesture, event)) {
      setGesture(null);
      return;
    }
    const g = {
      ...gesture,
      end: location(event, !['rotate', 'rotateGroup', 'destinationLabel'].includes(gesture.kind)),
      step: event.shiftKey ? 15 : 1,
      proportional: event.shiftKey,
    };
    setGesture(null);
    if (g.kind === 'destinationLabel') {
      commit({
        ...project,
        elements: project.elements.map((e) =>
          e.id === g.element.id
            ? moveDestinationLabel(e, g.labelKey, g.end.x - g.start.x, g.end.y - g.start.y)
            : e,
        ),
      });
      return;
    }
    if (g.kind === 'dimensionOffset') {
      commit({
        ...project,
        elements: project.elements.map((e) =>
          e.id === g.element.id ? { ...e, offset: dimensionOffset(e, g.end) } : e,
        ),
      });
      return;
    }
    if (g.kind === 'rotationPivot') {
      setRotationPivot({ key: g.key, cx: g.end.x, cy: g.end.y });
      return;
    }
    if (g.kind === 'rotateGroup') {
      try {
        const angle = rotationDragAngle(g.frame, g.start, g.end, g.step);
        if (angle !== 0) commit(rotateGroup(project, g.frame.ids, 1, angle, g.frame));
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    if (g.kind === 'marquee') {
      const ids = [
        ...new Set([
          ...(g.additive ? pastedGroup?.ids || (selected ? [selected] : []) : []),
          ...selectInBox(project, g.start, g.end),
        ]),
      ];
      const expanded = expandGroups(project, ids);
      setSelected(expanded[0] || null);
      setPastedGroup(expanded.length ? { selectedId: expanded[0], ids: expanded } : null);
      setMessage(
        `${ids.length} peças selecionadas. Arraste uma peça ou use as setas; Ctrl+C copia.`,
      );
      return;
    }
    if (g.kind === 'resize' || g.kind === 'rotate') {
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
      if (pastedGroup?.selectedId === g.element.id) {
        try {
          commit(
            movePastedGroup(project, pastedGroup.ids, g.end.x - g.start.x, g.end.y - g.start.y),
          );
        } catch (error) {
          setMessage(error.message);
        }
        return;
      }
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
    if (points.length < (['polygon', 'floorRegion'].includes(tool) ? 3 : 2)) return;
    if (
      add([
        {
          id: uid(),
          kind: tool,
          points,
          width: lineWidth,
          ...(tool === 'trace' ? traceStyle : {}),
          ...(tool === 'floorRegion' ? { floorFinish: regionFinish } : {}),
        },
      ])
    )
      setPoints([]);
  }
  function resized(g) {
    if (g.kind === 'rotate') return rotateAsset(g.element, g.start, g.end, project, g.step);
    return resizeElement(
      g.element,
      g.handle,
      g.end.x - g.start.x,
      g.end.y - g.start.y,
      project,
      g.proportional,
    );
  }
  function changeTool(next) {
    if (!toolInMode(project, next)) return;
    if (isColony(project) && next === 'corridor') {
      next = 'trace';
      setTraceStyle(pathPreset('path').style);
      setLineWidth(3);
    }
    if (isColony(project) && areaTools.includes(next) && areaPurpose === 'room')
      setAreaPurpose('floor');
    if (next === 'asset' && !assetInMode(project, asset) && matchingAssets.length)
      setAsset(matchingAssets[0][0]);
    setPortPlacement(null);
    setCursor(null);
    setSnapGuides([]);
    setConnectionPlacement(null);
    setModulePlacement(null);
    if (next === 'floorRegion') setAreaPurpose('floor');
    setTool(next);
    setPoints([]);
    setGesture(null);
  }
  function remove() {
    if (gesture || points.length) return;
    if (pastedGroup?.ids.length) {
      try {
        if (commit(removeSelection(project, pastedGroup.ids))) {
          setSelected(null);
          setPastedGroup(null);
          setMessage('Seleção removida. Ctrl+Z restaura o conjunto.');
        }
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
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
  const editable = selectedElement && objectEditable(project, selectedElement);
  function groupSelection(ungroup = false) {
    if (gesture || points.length) return;
    try {
      const ids = expandGroups(project, pastedGroup?.ids || (selected ? [selected] : []));
      if (commit(setSelectionGroup(project, ids, ungroup))) {
        setPastedGroup(ids.length ? { selectedId: selected || ids[0], ids } : null);
        setMessage(
          ungroup
            ? 'Grupo desfeito; peças continuam selecionadas.'
            : 'Grupo criado. Será preservado ao salvar o projeto.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  function copySelection() {
    if (gesture || points.length) return;
    try {
      clipboard.current = { ...copyBlueprint(project, pastedGroup?.ids || selected), count: 0 };
      setMessage('Cópia guardada nesta aba. Use Ctrl+V na planta para colar.');
    } catch (error) {
      setMessage(error.message);
    }
  }
  function pasteSelection() {
    if (gesture || points.length) return;
    try {
      const offset = project.grid * ((clipboard.current?.count || 0) + 1);
      const result = pasteBlueprint(project, clipboard.current, offset, offset);
      if (commit(result.project)) {
        clipboard.current.count++;
        setSelected(result.selectedId);
        setPastedGroup({ selectedId: result.selectedId, ids: result.ids });
        setTool('select');
        setMessage(
          'Cópia selecionada. Arraste a estrutura para mover o conjunto; Escape libera as peças.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  function duplicate() {
    if (!editable || gesture || points.length) return;
    try {
      const copy = pastedGroup?.ids.length
        ? duplicateSelection(project, pastedGroup.ids)
        : duplicateElement(project, selected);
      if (commit(copy.project)) {
        setSelected(copy.selectedId);
        setPastedGroup(copy.ids ? { selectedId: copy.selectedId, ids: copy.ids } : null);
        setTool('select');
        setMessage(
          copy.ids
            ? 'Conjunto duplicado e selecionado. Arraste para posicionar.'
            : 'Cópia selecionada. Arraste para posicionar; equipamentos internos são peças independentes.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  function convertSelectedRooms() {
    if (!editable || gesture || points.length) return;
    try {
      if (commit(convertRoomsToPolygons(project, pastedGroup?.ids || [selected]))) {
        setMessage(
          'Sala convertida em vértices. Paredes e aberturas preservadas; Ctrl+Z restaura o retângulo.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  function rotateFreely() {
    if (!editable || gesture || points.length) return;
    try {
      const ids = pastedGroup?.ids || [selected];
      commit(rotateGroup(project, ids, 1, Number(selectionAngle), rotationFrame));
    } catch (error) {
      setMessage(error.message);
    }
    svgRef.current?.focus();
  }
  function rotatePendingModule(direction) {
    if (!modulePlacement || gesture) return;
    try {
      setModulePlacement(rotateModule(modulePlacement, direction));
    } catch (error) {
      setMessage(error.message);
    }
    svgRef.current?.focus({ preventScroll: true });
  }
  function rotateSelection(delta) {
    if (pastedGroup?.ids.length && !gesture && !points.length) {
      try {
        commit(rotateGroup(project, pastedGroup.ids, delta > 0 ? 1 : -1));
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    if (selectedElement && selectedElement.kind !== 'door' && !gesture && !points.length) {
      if (selectedElement.kind !== 'asset') {
        try {
          commit(rotateGroup(project, [selected], delta > 0 ? 1 : -1));
        } catch (error) {
          setMessage(error.message);
        }
        return;
      }

      property('rotation', (((selectedElement.rotation + delta) % 360) + 360) % 360);
    }
  }
  function nudge(dx, dy) {
    if (!editable || selectedElement.kind === 'door' || gesture || points.length) return;
    if (pastedGroup?.selectedId === selected) {
      try {
        commit(movePastedGroup(project, pastedGroup.ids, dx, dy));
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
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
      const z = Math.max(0.5, Math.min(isColony(project) ? 1024 : 12, v.zoom * factor));
      return {
        zoom: z,
        x: v.x + project.width / v.zoom / 2 - project.width / z / 2,
        y: v.y + project.height / v.zoom / 2 - project.height / z / 2,
      };
    });
  }
  let drawn = project,
    preview = emptyDrawingPreview;
  if (gesture?.kind === 'dimensionOffset')
    drawn = {
      ...project,
      elements: project.elements.map((e) =>
        e.id === gesture.element.id ? { ...e, offset: dimensionOffset(e, gesture.end) } : e,
      ),
    };
  if (gesture?.kind === 'vertex')
    drawn = {
      ...project,
      elements: project.elements.map((element) =>
        element.id === gesture.element.id
          ? moveVertex(element, gesture.index, gesture.end)
          : element,
      ),
    };
  if (gesture && ['room', 'ellipse'].includes(gesture.kind))
    preview = [areaElement(rectangle(gesture), areaPurpose, regionFinish)];
  if (points.length && !['dimension', 'wall'].includes(tool))
    preview = [
      {
        id: 'preview',
        kind: tool,
        ...(tool === 'trace' ? traceStyle : {}),
        ...(tool === 'floorRegion' ? { floorFinish: regionFinish } : {}),
        width: lineWidth,
        points: cursor ? [...points, cursor] : points,
      },
    ];
  if (areaTools.includes(tool))
    preview = preview.map((e) => areaElement(e, areaPurpose, regionFinish));
  if (gesture?.kind === 'move' && gesture.element.kind !== 'door')
    drawn = {
      ...project,
      elements: project.elements.map((e) =>
        (
          pastedGroup?.selectedId === gesture.element.id
            ? pastedGroup.ids.includes(e.id) && e.kind !== 'door'
            : e.id === gesture.element.id
        )
          ? moveElement(e, gesture.end.x - gesture.start.x, gesture.end.y - gesture.start.y)
          : e,
      ),
    };
  if (gesture?.kind === 'move' && gesture.element.kind === 'door') {
    const wall = nearestWall(project.elements, gesture.end);
    if (wall)
      drawn = {
        ...project,
        elements: project.elements.map((element) =>
          element.id === gesture.element.id
            ? { ...element, wallId: wall.wallId, segment: wall.segment, t: wall.t }
            : element,
        ),
      };
  }
  // Mantém a grade legível em plantas grandes sem mudar a medida de encaixe.
  if (gesture?.kind === 'resize' || gesture?.kind === 'rotate')
    drawn = {
      ...project,
      elements: project.elements.map((element) =>
        element.id === gesture.element.id ? resized(gesture) : element,
      ),
    };
  const baseRotationFrame = freeRotationFrame(
    project,
    pastedGroup?.ids || (selected ? [selected] : []),
  );
  const rotationKey = JSON.stringify(baseRotationFrame?.ids.slice().sort() || []);
  const customPivot =
    gesture?.kind === 'rotationPivot'
      ? { cx: gesture.end.x, cy: gesture.end.y }
      : rotationPivot?.key === rotationKey
        ? rotationPivot
        : null;
  const rotationFrame = baseRotationFrame ? { ...baseRotationFrame, ...customPivot } : null;
  const groupHandleRadius = Math.max(0.2, project.width / view.zoom / 90);
  let groupRotationError = '';
  const groupAngle =
    gesture?.kind === 'rotateGroup'
      ? rotationDragAngle(gesture.frame, gesture.start, gesture.end, gesture.step)
      : 0;
  if (gesture?.kind === 'rotateGroup') {
    try {
      drawn = rotateGroup(project, gesture.frame.ids, 1, groupAngle, gesture.frame);
    } catch (error) {
      groupRotationError = error.message;
    }
  }
  if (gesture?.kind === 'destinationLabel')
    drawn = {
      ...project,
      elements: project.elements.map((e) =>
        e.id === gesture.element.id
          ? moveDestinationLabel(
              e,
              gesture.labelKey,
              gesture.end.x - gesture.start.x,
              gesture.end.y - gesture.start.y,
            )
          : e,
      ),
    };
  drawn = followVentWalls(project, drawn);
  const gridStep =
    project.grid * Math.max(1, Math.ceil(project.width / view.zoom / project.grid / 100));
  return (
    <div
      className={`blueprint-editor ${focusMode ? 'blueprint-focus' : ''} ${!panelsOpen ? 'blueprint-panels-hidden' : ''}`}
    >
      <div className="blueprint-heading">
        <div>
          <div className="eyebrow">OFICINA CARTOGRÁFICA</div>
          <h1>Editor de mapas</h1>
          <p className="blueprint-project-caption">
            {project.name}{' '}
            <span title="Os mapas são editados neste navegador e não são enviados ao servidor.">
              · Local
            </span>
          </p>
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

        <span>
          {project.elements.length} objetos · {dirty ? 'alterações nesta sessão' : 'projeto pronto'}
        </span>
      </div>
      <nav className="blueprint-global-controls" aria-label="Configurações do projeto">
        <details name="blueprint-global" className="blueprint-global-panel">
          <summary>Projeto e escala</summary>
          <OptionButtons
            label="Tipo de mapa"
            value={project.mode || 'construction'}
            options={projectModes}
            onChange={(mode) => {
              changeTool('select');
              setSelected(null);
              setPastedGroup(null);
              setAreaPurpose(mode === 'colony' ? 'floor' : 'room');
              commit({ ...project, mode });
            }}
          />
          <p className="muted">
            {isColony(project)
              ? 'Colônia: áreas externas e infraestrutura.'
              : 'Construção: interiores, salas e pavimentos.'}{' '}
            Trocar o modo preserva o mapa e suas medidas.
          </p>
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
              <NumberField
                type="number"
                min="10"
                max={isColony(project) ? 10000 : 2000}
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
        <details name="blueprint-global" className="blueprint-global-panel">
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
        <details name="blueprint-global" className="blueprint-global-panel">
          <summary>Exportar imagem</summary>
          <p className="muted">
            A exportação usa somente o pavimento ativo e mantém o mesmo alinhamento entre camadas. A
            grade não é exportada.
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
          {exportLayers.length === 1 && exportLayers[0] === 'vents' && (
            <small>
              A exportação exclusiva da ventilação mostra os dutos completos sobre fundo opaco,
              mantendo o alinhamento do pavimento.
            </small>
          )}
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
        <details name="blueprint-global" className="blueprint-global-panel">
          <summary>Atalhos e navegação</summary>
          <p>
            Arraste com o botão do meio ou direito para mover a visão. Espaço + arraste também
            funciona. + / −: zoom. Home: enquadrar. F: modo de foco. Escape: sair do foco ou
            cancelar. Passe sobre os ícones para ver os atalhos de ferramentas. Os atalhos funcionam
            com foco na planta; Tab continua navegando pelos controles.
          </p>
        </details>
      </nav>
      <FloorControls
        project={project}
        disabled={!!gesture || !!points.length || exporting}
        onError={setMessage}
        onChange={(next) => {
          if (commit(next)) {
            setConnectionPlacement(null);
            setModulePlacement(null);
            setSelected(null);
            setPastedGroup(null);
            setRotationPivot(null);
            setCursor(null);
          }
        }}
      />
      {!isColony(project) && (
        <DeckConnections
          placing={!!connectionPlacement}
          onCancelPlacement={() => setConnectionPlacement(null)}
          onPlace={(placement) => {
            setModulePlacement(null);
            setConnectionPlacement(placement);
            setTool('select');
            setSelected(null);
            setPastedGroup(null);
            setCursor(null);
            setMessage('Clique no mapa para posicionar a conexão. Escape cancela.');
            svgRef.current?.focus({ preventScroll: true });
          }}
          project={project}
          disabled={!!gesture || !!points.length || exporting}
          referenceFloors={referenceFloors}
          setReferenceFloors={setReferenceFloors}
          onError={setMessage}
          onChange={(next) => {
            if (commit(next)) {
              setSelected(null);
              setPastedGroup(null);
              setRotationPivot(null);
            }
          }}
        />
      )}
      <p
        role="status"
        className={`blueprint-status ${message === 'Alteração aplicada somente neste navegador.' ? 'blueprint-status-routine' : ''}`}
      >
        {message}
      </p>
      <div className="blueprint-layout">
        <aside className="blueprint-tools" aria-label="Ferramentas de desenho">
          <small className="blueprint-panel-context">Criar / desenhar</small>
          <h2>
            {areaTools.includes(tool)
              ? 'Áreas'
              : pathTools.includes(tool)
                ? 'Percursos'
                : toolNames[tool]}
          </h2>
          {pathTools.includes(tool) && (
            <VisualChoices
              label="Desenhar percurso"
              kind="trace"
              value={tool === 'trace' ? traceStyle.traceType : tool}
              options={pathChoices.filter(([id]) => pathInMode(project, id))}
              onChange={(value) => {
                const preset = pathPreset(value);
                changeTool(preset.tool);
                setLineWidth(preset.width);
                if (preset.tool === 'trace') setTraceStyle(preset.style);
              }}
            />
          )}
          {pathTools.includes(tool) && (
            <label>
              Largura (m)
              <NumberField
                type="number"
                min=".25"
                max="50"
                step=".25"
                value={lineWidth}
                onChange={(e) => setLineWidth(Math.max(0.25, Math.min(50, Number(e.target.value))))}
              />
            </label>
          )}
          {areaTools.includes(tool) && (
            <>
              <VisualChoices
                label="Criar"
                kind="purpose"
                value={areaPurpose}
                options={[
                  ...(!isColony(project) ? [['room', 'Sala']] : []),
                  ['floor', 'Piso'],
                  ['pool', 'Piscina'],
                  ['lake', 'Lago'],
                ]}
                onChange={(purpose) => {
                  setAreaPurpose(purpose);
                  if (tool === 'floorRegion') changeTool('polygon');
                  setPoints([]);
                }}
              />
              <VisualChoices
                label="Forma"
                kind="shape"
                value={tool === 'floorRegion' ? 'polygon' : tool}
                options={[
                  ['room', 'Retângulo'],
                  ['ellipse', 'Elipse'],
                  ['polygon', 'Vértices'],
                ]}
                onChange={changeTool}
              />
            </>
          )}
          {['room', 'ellipse', 'polygon', 'corridor'].includes(tool) &&
            (areaPurpose === 'room' || tool === 'corridor') && (
              <VisualChoices
                label="Parede ao desenhar"
                kind="wall"
                value={creationWall}
                onChange={setCreationWall}
                options={[
                  ['auto', 'Automática'],
                  ...Object.entries(wallTypes).filter(([k]) => k !== 'open'),
                ]}
              />
            )}
          {areaTools.includes(tool) && areaPurpose !== 'room' && (
            <>
              <p>
                Área sem paredes. Arraste para definir retângulos e elipses; por vértices, Enter
                conclui.
              </p>
              <FloorFinishControls
                value={{
                  ...regionFinish,
                  type: areaPurpose === 'floor' ? regionFinish.type : areaPurpose,
                }}
                allowWater={areaPurpose !== 'floor'}
                onChange={(finish) => {
                  setRegionFinish(finish);
                  if (['pool', 'lake'].includes(finish.type)) setAreaPurpose(finish.type);
                  else setAreaPurpose('floor');
                }}
              />
            </>
          )}
          {tool === 'trace' && (
            <TraceControls
              colony={isColony(project)}
              showType={false}
              value={traceStyle}
              onChange={(key, value) => {
                setTraceStyle({ ...traceStyle, [key]: value });
                if (key === 'traceType' && ['channel', 'gratedChannel'].includes(value))
                  setLineWidth(0.4);
                if (key === 'traceType' && ['path', 'sidewalk', 'road'].includes(value)) {
                  setLineWidth(value === 'road' ? 6 : value === 'sidewalk' ? 2 : 1.5);
                  setTraceStyle({ traceType: value, rounded: true, side: 1 });
                }
                if (key === 'traceType' && ['hazardLine', 'walkwayLine'].includes(value)) {
                  setLineWidth(value === 'hazardLine' ? 0.3 : 1.2);
                  setTraceStyle({ traceType: value, rounded: true, side: 1 });
                }
                if (key === 'traceType' && value === 'river') {
                  setLineWidth(3);
                  setTraceStyle({ ...traceStyle, traceType: value, rounded: true });
                }
              }}
            />
          )}
          {['corridor', 'vent', 'polygon', 'trace', 'floorRegion'].includes(tool) && (
            <>
              {points.length > 0 && (
                <div className="blueprint-path-actions">
                  <button
                    disabled={points.length < (['polygon', 'floorRegion'].includes(tool) ? 3 : 2)}
                    onClick={finish}
                  >
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
                </div>
              )}
            </>
          )}
          {tool === 'door' && (
            <>
              <VisualChoices
                label="Abertura"
                kind="opening"
                value={openingType}
                onChange={setOpeningType}
                options={[
                  ['door', 'Porta'],
                  ['window', 'Janela'],
                ]}
              />
              <label>
                Largura da abertura (m)
                <NumberField
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
                {matchingAssets.length} peça(s) encontrada(s). Selecionada: {assetNames[asset]}.{' '}
                {furniture[asset] &&
                  `${furniture[asset].w} × ${furniture[asset].h} m · Peça física em vista superior.`}
              </p>
              <label>
                Rotação antes de inserir (°)
                <NumberField
                  type="number"
                  step="15"
                  value={assetRotation}
                  onChange={(e) => setAssetRotation(Number(e.target.value) || 0)}
                />
              </label>
              <small>Na viewport: R gira 90°; Shift+R gira no sentido contrário.</small>
              <AssetCatalog
                items={matchingAssets}
                search={assetSearch}
                selected={asset}
                onSelect={setAsset}
              />
              {!matchingAssets.length && <p>Nenhum equipamento encontrado. Tente outro nome.</p>}
            </>
          )}
          {tool === 'module' && (
            <OptionButtons
              label="Módulo pronto · 10 × 8 m"
              value={moduleType}
              onChange={setModuleType}
              options={Object.entries(moduleNames)}
            />
          )}
          {tool === 'wall' && (
            <div>
              <OptionButtons
                label="Modo"
                value={manualWall ? 'draw' : 'edit'}
                options={[
                  ['edit', 'Editar existente'],
                  ['draw', 'Desenhar parede'],
                ]}
                onChange={(mode) => {
                  setManualWall(mode === 'draw');
                  setPoints([]);
                }}
              />
              {manualWall && (
                <>
                  <VisualChoices
                    label="Parede avulsa"
                    kind="wall"
                    value={wallType === 'open' ? 'internal' : wallType}
                    onChange={setWallType}
                    options={Object.entries(wallTypes).filter(([k]) => k !== 'open')}
                  />
                  <p>Clique no início e no fim. Escape cancela.</p>
                </>
              )}
            </div>
          )}
          {tool === 'wall' &&
            !manualWall &&
            selectedElement &&
            wallSegments(selectedElement).length > 0 && (
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
                <VisualChoices
                  label="Tipo de parede"
                  kind="wall"
                  value={wallType}
                  onChange={setWallType}
                  options={[['auto', 'Automática (unir ambientes)'], ...Object.entries(wallTypes)]}
                />
                <label>
                  Início do trecho (%)
                  <NumberField
                    type="number"
                    min="0"
                    max="100"
                    value={wallStart}
                    onChange={(event) => setWallStart(Number(event.target.value))}
                  />
                </label>
                <label>
                  Fim do trecho (%)
                  <NumberField
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
                <details className="blueprint-inline-help">
                  <summary>Como funciona o trecho</summary>
                  <p>
                    Aplicar altera somente o intervalo escolhido, preservando os demais trechos.
                    Automática restaura a união dos ambientes apenas nesse intervalo. Portas e
                    janelas recortam a parede; remova a peça antes de transformar seu trecho em
                    abertura livre.
                  </p>
                </details>
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
                      <NumberField
                        type="number"
                        min="0"
                        max="359.99"
                        value={arcStart}
                        onChange={(event) => setArcStart(Number(event.target.value))}
                      />
                    </label>
                    <label>
                      Fim do arco (°)
                      <NumberField
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
                <section
                  className="blueprint-wall-presets"
                  aria-label="Aplicar em todas as paredes"
                >
                  <h3>Ambiente inteiro</h3>
                  <p>Aplica a todas as paredes.</p>
                  <div className="blueprint-wall-preset-actions">
                    {[
                      ['internal', 'Divisórias'],
                      ['hull', 'Casco'],
                      ['structural', 'Estrutural'],
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
                    <button
                      title="Restaurar paredes automáticas em todo o ambiente"
                      onClick={() => property('walls', [])}
                    >
                      Automáticas
                    </button>
                  </div>
                </section>
              </fieldset>
            )}
          {tool === 'dimension' && (
            <DimensionControls
              {...dimensionStyle}
              onChange={(key, value) => setDimensionStyle({ ...dimensionStyle, [key]: value })}
            />
          )}
          {tool === 'label' && (
            <TextControls
              text={label}
              {...labelStyle}
              onChange={(key, value) =>
                key === 'text'
                  ? setLabel(value)
                  : setLabelStyle((style) => ({ ...style, [key]: value }))
              }
            />
          )}

          {!isColony(project) && (
            <ModuleLibrary
              project={project}
              ids={pastedGroup?.ids || (selected ? [selected] : [])}
              disabled={!!gesture || !!points.length || !!connectionPlacement || !!modulePlacement}
              onError={setMessage}
              onPlace={(module) => {
                setModuleGridOptions({ rows: 1, columns: 1, gap: 0 });
                setModulePlacement(module);
                setConnectionPlacement(null);
                setTool('select');
                setSelected(null);
                setPastedGroup(null);
                setRotationPivot(null);
                setCursor(null);
                setMessage('Clique no mapa para posicionar o módulo. Escape cancela.');
                svgRef.current?.focus({ preventScroll: true });
              }}
            />
          )}
        </aside>
        <section className="blueprint-workspace" aria-label="Área de desenho">
          <div className="blueprint-tool-grid" role="toolbar" aria-label="Ferramentas da viewport">
            {Object.entries(toolNames)
              .filter(
                ([id]) =>
                  toolInMode(project, id) &&
                  !['ellipse', 'polygon', 'floorRegion', 'vent', 'trace'].includes(id),
              )
              .map(([id, originalName]) => {
                const name =
                  id === 'room'
                    ? isColony(project)
                      ? 'Áreas: superfícies e água'
                      : 'Áreas: salas, pisos e água'
                    : id === 'corridor'
                      ? isColony(project)
                        ? 'Percursos externos'
                        : 'Percursos: corredores, dutos e traçados'
                      : originalName;
                const shortcut = Object.keys(toolKeys)
                  .find((key) => toolKeys[key] === id)
                  ?.toUpperCase();
                return (
                  <button
                    key={id}
                    aria-label={name}
                    title={shortcut ? name + ' (' + shortcut + ')' : name}
                    aria-keyshortcuts={shortcut}
                    aria-pressed={
                      id === 'room'
                        ? areaTools.includes(tool)
                        : id === 'corridor'
                          ? pathTools.includes(tool)
                          : tool === id
                    }
                    onClick={() => {
                      if (id === 'corridor') {
                        if (!pathTools.includes(tool)) {
                          changeTool(id);
                          setLineWidth(2);
                        }
                      } else changeTool(id);
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
          <div className="blueprint-canvas-toolbar">
            <button
              type="button"
              title="Desfazer (Ctrl+Z)"
              aria-label="Desfazer"
              disabled={!past.length || !!gesture || !!points.length}
              onClick={() => {
                undo();
                svgRef.current?.focus();
              }}
            >
              <ToolIcon name="undo" />
            </button>
            <button
              type="button"
              title="Refazer (Ctrl+Shift+Z)"
              aria-label="Refazer"
              disabled={!future.length || !!gesture || !!points.length}
              onClick={() => {
                redo();
                svgRef.current?.focus();
              }}
            >
              <ToolIcon name="redo" />
            </button>
            <button
              title="Copiar peça ou sala com equipamentos (Ctrl+C)"
              aria-label="Copiar seleção"
              disabled={!editable || selectedElement?.kind === 'door'}
              onClick={copySelection}
            >
              ⧉
            </button>
            <button
              title="Colar cópia (Ctrl+V)"
              aria-label="Colar cópia"
              disabled={!clipboard.current}
              onClick={pasteSelection}
            >
              ▣
            </button>

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
            <label title="Alinha quinas, centros e extremidades. Alt suspende os encaixes.">
              <input
                type="checkbox"
                checked={objectSnap}
                onChange={(e) => {
                  setObjectSnap(e.target.checked);
                  setSnapGuides([]);
                }}
              />
              Guias
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
          {modulePlacement && (
            <div
              className="blueprint-selection-toolbar blueprint-module-placement"
              role="group"
              aria-label="Posicionamento do módulo"
            >
              <span>{modulePlacement.name}</span>
              <button
                disabled={!!gesture}
                title="Girar módulo −90° (Shift+R)"
                aria-label="Girar módulo −90°"
                onClick={() => rotatePendingModule(-1)}
              >
                <ToolIcon name="rotateLeft" />
              </button>
              <button
                disabled={!!gesture}
                title="Girar módulo +90° (R)"
                aria-label="Girar módulo +90°"
                onClick={() => rotatePendingModule(1)}
              >
                <ToolIcon name="rotateRight" />
              </button>
              <button
                className="blueprint-pivot-reset"
                onClick={() => {
                  setModulePlacement(null);
                  svgRef.current?.focus();
                }}
              >
                Cancelar
              </button>
              <details className="blueprint-module-grid">
                <summary>
                  Repetir em grade ({moduleGridOptions.rows * moduleGridOptions.columns})
                </summary>
                <div>
                  {[
                    ['rows', 'Linhas'],
                    ['columns', 'Colunas'],
                    ['gap', 'Espaço entre módulos (m)'],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <NumberField
                        type="number"
                        min={key === 'gap' ? 0 : 1}
                        max={key === 'gap' ? 100 : 10}
                        step={key === 'gap' ? 0.25 : 1}
                        value={moduleGridOptions[key]}
                        onChange={(event) => {
                          const value = event.target.valueAsNumber;
                          if (
                            Number.isFinite(value) &&
                            value >= (key === 'gap' ? 0 : 1) &&
                            value <= (key === 'gap' ? 100 : 10) &&
                            (key === 'gap' || Number.isInteger(value))
                          )
                            setModuleGridOptions((options) => ({ ...options, [key]: value }));
                        }}
                      />
                    </label>
                  ))}
                  <button onClick={() => setModuleGridOptions({ rows: 1, columns: 1, gap: 0 })}>
                    Uma cópia
                  </button>
                </div>
              </details>
              <label className="blueprint-repeat-module">
                <input
                  type="checkbox"
                  checked={repeatModule}
                  onChange={(event) => {
                    setRepeatModule(event.target.checked);
                    svgRef.current?.focus({ preventScroll: true });
                  }}
                />
                Inserção contínua
              </label>
              <small>Shift+clique repete · Esc encerra</small>
            </div>
          )}
          {tool === 'select' && selectedElement && (
            <div className="blueprint-selection-toolbar" role="group" aria-label="Ações da seleção">
              {selectedElement.kind !== 'door' && (
                <form
                  className="blueprint-angle-control"
                  onSubmit={(event) => {
                    event.preventDefault();
                    rotateFreely();
                  }}
                >
                  <NumberField
                    type="number"
                    min="-360"
                    max="360"
                    step="1"
                    required
                    aria-label="Ângulo de rotação da seleção em graus"
                    title="Girar a seleção por este ângulo"
                    value={selectionAngle}
                    onChange={(event) => setSelectionAngle(event.target.value)}
                  />
                  <button
                    type="submit"
                    aria-label="Aplicar rotação da seleção"
                    title="Aplicar ângulo à seleção"
                    disabled={!editable || !!gesture || !!points.length}
                  >
                    Aplicar ângulo
                  </button>
                </form>
              )}
              {pastedGroup?.ids.length >= 2 &&
                pastedGroup.ids.every(
                  (id) => project.elements.find((item) => item.id === id)?.kind === 'asset',
                ) && (
                  <form
                    className="blueprint-arrange-control"
                    onSubmit={(event) => {
                      event.preventDefault();
                      try {
                        if (commit(arrangeEquipment(project, pastedGroup.ids, arrangement))) {
                          setRotationPivot(null);
                          svgRef.current?.focus();
                        }
                      } catch (error) {
                        setMessage(error.message);
                      }
                    }}
                  >
                    <select
                      aria-label="Alinhamento dos equipamentos"
                      value={arrangement}
                      onChange={(event) => setArrangement(event.target.value)}
                    >
                      {Object.entries(arrangements).map(([value, title]) => (
                        <option
                          key={value}
                          value={value}
                          disabled={value.startsWith('distribute') && pastedGroup.ids.length < 3}
                        >
                          {title}
                        </option>
                      ))}
                    </select>
                    <button disabled={!!gesture || !!points.length}>Alinhar</button>
                  </form>
                )}
              {rotationFrame && (
                <button
                  type="button"
                  className="blueprint-pivot-reset"
                  title="Restaurar o centro da seleção como pivô"
                  disabled={!!gesture}
                  onClick={() => {
                    setRotationPivot(null);
                    svgRef.current?.focus();
                  }}
                >
                  Centralizar pivô
                </button>
              )}
              {[
                {
                  icon: 'rotateLeft',
                  label: 'Girar −90° (Shift+R)',
                  action: () => rotateSelection(-90),
                  disabled: selectedElement.kind === 'door',
                },
                {
                  icon: 'rotateRight',
                  label: 'Girar +90° (R)',
                  action: () => rotateSelection(90),
                  disabled: selectedElement.kind === 'door',
                },
                {
                  icon: 'copy',
                  label: 'Duplicar seleção (Ctrl+D)',
                  action: duplicate,
                  disabled: selectedElement.kind === 'door',
                },
                {
                  icon: 'group',
                  label: 'Agrupar seleção (Ctrl+G)',
                  action: () => groupSelection(false),
                  disabled: !pastedGroup || pastedGroup.ids.length < 2,
                },
                {
                  icon: 'ungroup',
                  label: 'Desagrupar (Ctrl+Shift+G)',
                  action: () => groupSelection(true),
                  disabled: !selectedElement.groupId,
                },
                { icon: 'delete', label: 'Remover seleção (Delete)', action: remove },
              ].map(({ icon, label, action, disabled }) => (
                <button
                  key={icon}
                  type="button"
                  title={label}
                  aria-label={label}
                  disabled={!editable || !!gesture || !!points.length || disabled}
                  onClick={() => {
                    action();
                    svgRef.current?.focus();
                  }}
                >
                  <ToolIcon name={icon} />
                </button>
              ))}
            </div>
          )}
          <svg
            ref={svgRef}
            className={`blueprint-canvas ${gesture?.kind === 'pan' ? 'is-panning' : tool === 'pan' || spaceHeld ? 'can-pan' : ''}`}
            viewBox={`${view.x} ${view.y} ${project.width / view.zoom} ${project.height / view.zoom}`}
            role="application"
            aria-label="Planta editável. Escolha uma ferramenta e desenhe. Enter conclui traçado, Escape cancela, Delete remove seleção."
            tabIndex="0"
            onPointerLeave={() => {
              if (!gesture) setCursor(null);
            }}
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
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                if (!e.repeat) groupSelection(e.shiftKey);
                return;
              }
              if ((e.ctrlKey || e.metaKey) && ['c', 'v'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                if (!e.repeat) e.key.toLowerCase() === 'c' ? copySelection() : pasteSelection();
                return;
              }
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
                if (modulePlacement) {
                  if (!e.repeat) rotatePendingModule(e.shiftKey ? -1 : 1);
                } else if (tool === 'asset') {
                  if (!e.repeat) setAssetRotation((v) => (v + (e.shiftKey ? 270 : 90)) % 360);
                } else rotateSelection(e.shiftKey ? -90 : 90);
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
              if (
                e.key === 'Enter' &&
                ['corridor', 'vent', 'polygon', 'trace', 'floorRegion'].includes(tool)
              ) {
                e.preventDefault();
                finish();
              }
              if (e.key === 'Escape') {
                setPortPlacement(null);
                setConnectionPlacement(null);
                setModulePlacement(null);
                setPastedGroup(null);
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
              editVertices={
                tool === 'select' && !!editable && (!rotationFrame || rotationFrame.rootCount === 1)
              }
              handleRadius={Math.max(0.15, project.width / view.zoom / 100)}
              project={drawn}
              grid={grid}
              gridStep={gridStep}
              selected={editable ? selected : null}
              preview={preview}
              interactive={tool === 'select'}
            />
            {tool === 'wall' && manualWall && points.length === 1 && cursor && (
              <line
                data-editor-only="true"
                pointerEvents="none"
                x1={points[0].x}
                y1={points[0].y}
                x2={cursor.x}
                y2={cursor.y}
                stroke="#f1c46c"
                strokeWidth=".2"
              />
            )}
            {tool === 'dimension' && points.length === 1 && cursor && (
              <g data-editor-only="true" pointerEvents="none" color="#f1c46c">
                <Dimension element={{ points: [points[0], cursor], ...dimensionStyle }} />
              </g>
            )}
            {!!snapGuides.length && (
              <g
                data-editor-only="true"
                pointerEvents="none"
                stroke="#f1c46c"
                strokeWidth=".06"
                strokeDasharray=".25 .2"
              >
                {snapGuides.map((g) => (
                  <line
                    key={g.axis}
                    x1={g.axis === 'x' ? g.value : 0}
                    x2={g.axis === 'x' ? g.value : project.width}
                    y1={g.axis === 'y' ? g.value : 0}
                    y2={g.axis === 'y' ? g.value : project.height}
                  />
                ))}
              </g>
            )}
            {cursor &&
              !gesture &&
              !modulePlacement &&
              !connectionPlacement &&
              ['asset', 'door'].includes(tool) && (
                <PlacementPreview
                  project={project}
                  point={cursor}
                  tool={tool}
                  asset={asset}
                  rotation={assetRotation}
                  width={doorWidth}
                  openingType={openingType}
                  zoom={view.zoom}
                />
              )}
            {cursor && !gesture && !modulePlacement && tool === 'module' && (
              <g data-editor-only="true" pointerEvents="none" opacity=".65" color="#f1c46c">
                <ModuleSketch module={{ elements: makeModule(moduleType, cursor.x, cursor.y) }} />
              </g>
            )}
            {cursor && !gesture && tool === 'label' && label.trim() && (
              <LabelText
                data-editor-only="true"
                pointerEvents="none"
                fill="#f1c46c"
                opacity=".7"
                element={{ x: cursor.x, y: cursor.y, text: label, ...labelStyle }}
              />
            )}
            {modulePlacement && cursor && (
              <ModulePlacementPreview
                module={modulePlacement}
                point={cursor}
                project={project}
                options={moduleGridOptions}
              />
            )}
            {connectionPlacement && cursor && (
              <g data-editor-only="true" pointerEvents="none">
                <rect
                  x={cursor.x}
                  y={cursor.y}
                  width="2"
                  height="2"
                  fill="#f1c46c"
                  fillOpacity=".2"
                  stroke="#f1c46c"
                  strokeWidth=".12"
                  strokeDasharray=".2 .1"
                />
              </g>
            )}
            {visibleReferences.map((floor) => (
              <DeckReference
                key={floor.id}
                project={project}
                floorId={floor.id}
                opacity={0.35 / Math.sqrt(visibleReferences.length)}
              />
            ))}
            {tool === 'select' && pastedGroup && (
              <g
                data-editor-only="true"
                pointerEvents="none"
                fill="none"
                stroke="white"
                strokeWidth=".06"
                strokeDasharray=".2 .15"
              >
                {drawn.elements
                  .filter((element) => pastedGroup.ids.includes(element.id))
                  .map((element) => {
                    const box = selectionBounds(element);
                    return box ? (
                      <rect key={element.id} x={box.x} y={box.y} width={box.w} height={box.h} />
                    ) : null;
                  })}
              </g>
            )}
            {tool === 'select' && rotationFrame && (
              <g data-editor-only="true">
                <g data-rotation-pivot="true" style={{ cursor: 'move' }}>
                  <circle
                    cx={rotationFrame.cx}
                    cy={rotationFrame.cy}
                    r={groupHandleRadius}
                    fill="#081b13"
                    stroke="#fff"
                    strokeWidth=".1"
                  />
                  <path
                    d={`M ${rotationFrame.cx - groupHandleRadius} ${rotationFrame.cy} h ${groupHandleRadius * 2} M ${rotationFrame.cx} ${rotationFrame.cy - groupHandleRadius} v ${groupHandleRadius * 2}`}
                    stroke="#fff"
                    strokeWidth=".1"
                  />
                  <title>Arraste o pivô para escolher o centro de rotação. Escape cancela.</title>
                </g>
                <g data-rotate-group="true" style={{ cursor: 'grab' }}>
                  <circle
                    cx={rotationFrame.cx}
                    cy={Math.max(groupHandleRadius * 2, rotationFrame.top - groupHandleRadius * 4)}
                    r={groupHandleRadius * 1.5}
                    fill="#081b13"
                    stroke="#e6c668"
                    strokeWidth=".1"
                  />
                  <text
                    x={rotationFrame.cx}
                    y={Math.max(groupHandleRadius * 2, rotationFrame.top - groupHandleRadius * 4)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#e6c668"
                    fontSize={groupHandleRadius * 2}
                  >
                    ↻
                  </text>
                  <title>Arraste para girar a seleção. Shift: passos de 15°. Escape cancela.</title>
                </g>
              </g>
            )}
            {gesture?.kind === 'marquee' && (
              <rect
                data-editor-only="true"
                pointerEvents="none"
                x={Math.min(gesture.start.x, gesture.end.x)}
                y={Math.min(gesture.start.y, gesture.end.y)}
                width={Math.abs(gesture.end.x - gesture.start.x)}
                height={Math.abs(gesture.end.y - gesture.start.y)}
                fill="white"
                fillOpacity=".08"
                stroke="white"
                strokeWidth=".08"
                strokeDasharray=".3 .2"
              />
            )}
          </svg>
          {gesture?.kind === 'rotateGroup' && (
            <output className="blueprint-transform-feedback">
              {groupRotationError || `Rotação da seleção: ${groupAngle}° · Shift: passos de 15°`} ·
              Escape cancela
            </output>
          )}
          {['resize', 'rotate'].includes(gesture?.kind) && (
            <output className="blueprint-transform-feedback" aria-live="off">
              {gesture.kind === 'rotate'
                ? `Rotação: ${resized(gesture).rotation}° · Shift: passos de 15°`
                : `${resized(gesture).w.toFixed(2)} × ${resized(gesture).h.toFixed(2)} m`}
              {gesture.kind === 'resize' &&
                gesture.handle.length === 2 &&
                (gesture.proportional ? ' · Proporção mantida' : ' · Shift: manter proporção')}
              {' · Escape cancela'}
            </output>
          )}
          <p className="blueprint-coordinates muted">
            {project.width} × {project.height} m · encaixe de {project.grid} m ·{' '}
            {cursor
              ? `X ${cursor.x.toFixed(2)} / Y ${cursor.y.toFixed(2)} m`
              : 'Arraste salas; clique para posicionar peças.'}
          </p>
        </section>
        <aside className="blueprint-settings" aria-label="Seleção, objetos e camadas">
          <details open className="blueprint-selection-panel">
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
                {levelAssets[selectedElement.asset] && (
                  <small>
                    Desnível visual: não conecta pavimentos. A seta indica subida; os traços da
                    borda indicam o lado baixo.
                  </small>
                )}
                <fieldset disabled={!editable}>
                  {selectedElement.asset === 'stairs' && (
                    <details>
                      <summary>Legenda de destino</summary>
                      <small>Usa o nome da sala que contém o centro da saída conectada.</small>
                      <label>
                        <input
                          type="checkbox"
                          checked={!selectedElement.connectionLabel?.hidden}
                          onChange={(e) =>
                            property('connectionLabel', {
                              ...selectedElement.connectionLabel,
                              hidden: !e.target.checked,
                            })
                          }
                        />
                        Mostrar destino
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedElement.connectionLabel?.export !== false}
                          onChange={(e) =>
                            property('connectionLabel', {
                              ...selectedElement.connectionLabel,
                              export: e.target.checked,
                            })
                          }
                        />
                        Incluir na exportação
                      </label>
                      {['dx', 'dy'].map((key) => (
                        <label key={key}>
                          Deslocamento {key === 'dx' ? 'X' : 'Y'} (m)
                          <NumberField
                            type="number"
                            step=".25"
                            value={selectedElement.connectionLabel?.[key] || 0}
                            onChange={(e) =>
                              property('connectionLabel', {
                                ...selectedElement.connectionLabel,
                                [key]: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      ))}
                    </details>
                  )}
                  {selectedElement.kind === 'asset' && (
                    <section className="blueprint-order-panel" aria-label="Ordem de sobreposição">
                      <span className="blueprint-choice-heading">Sobreposição</span>
                      <div className="blueprint-stack-actions">
                        {[
                          ['front', '⇈', 'Trazer para frente'],
                          ['forward', '↑', 'Avançar um nível'],
                          ['backward', '↓', 'Recuar um nível'],
                          ['back', '⇊', 'Enviar para trás'],
                        ].map(([action, icon, title]) => (
                          <button
                            key={action}
                            title={title}
                            aria-label={title}
                            onClick={() =>
                              commit(reorderAsset(project, selectedElement.id, action))
                            }
                          >
                            <span aria-hidden="true">{icon}</span>
                            <span>
                              {
                                {
                                  front: 'Frente',
                                  forward: '+1 nível',
                                  backward: '−1 nível',
                                  back: 'Fundo',
                                }[action]
                              }
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  <div className="blueprint-measure-grid">
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
                          <NumberField
                            type="number"
                            step={key === 'rotation' ? 15 : 0.25}
                            value={selectedElement[key]}
                            onChange={(e) => property(key, Number(e.target.value))}
                          />
                        </label>
                      ))}
                  </div>
                  {floorKinds.includes(selectedElement.kind) && (
                    <FloorFinishControls
                      allowWater={selectedElement.kind === 'floorRegion'}
                      value={selectedElement.floorFinish}
                      onChange={(value) => property('floorFinish', value)}
                    />
                  )}
                  {selectedElement.kind === 'trace' && (
                    <TraceControls
                      colony={isColony(project)}
                      value={selectedElement}
                      onChange={property}
                    />
                  )}
                  {selectedElement.kind === 'dimension' && (
                    <DimensionControls {...selectedElement} onChange={property} />
                  )}
                  {selectedElement.kind === 'corridor' && (
                    <fieldset>
                      <legend>Extremidades</legend>
                      {[
                        ['closedStart', 'Fechar início'],
                        ['closedEnd', 'Fechar fim'],
                      ].map(([key, title]) => (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={!!selectedElement[key]}
                            onChange={(e) => {
                              const next = setCorridorEnd(
                                project,
                                selectedElement.id,
                                key,
                                e.target.checked,
                              );
                              const removed =
                                project.elements.filter((x) => x.kind === 'door').length -
                                next.elements.filter((x) => x.kind === 'door').length;
                              if (
                                removed &&
                                !window.confirm(
                                  'Reabrir esta extremidade removerá ' +
                                    removed +
                                    ' porta(s)/janela(s). Continuar?',
                                )
                              )
                                return;
                              commit(next);
                            }}
                          />
                          {title}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  {selectedElement.kind === 'vent' && (
                    <fieldset>
                      <legend>Acessos do duto</legend>
                      {[0, 1].map((i) => (
                        <label key={i}>
                          {i ? 'Fim' : 'Início'}
                          <select
                            value={selectedElement.accesses?.[i] || 'auto'}
                            onChange={(e) => {
                              const values = [...(selectedElement.accesses || ['auto', 'auto'])];
                              values[i] = e.target.value;
                              property('accesses', values);
                            }}
                          >
                            {Object.entries(ventAccessTypes).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                      <small>
                        Automático conecta pontas a outros dutos, sugere grelha nas paredes e
                        escotilha dentro de salas. Escolha outro acesso para manter a ponta
                        independente.
                      </small>
                    </fieldset>
                  )}
                  {selectedElement.kind === 'vent' && (
                    <VentPortControls
                      project={project}
                      onProjectChange={commit}
                      onNavigate={(endpoint) => {
                        if (commit(switchVentFloor(project, endpoint.floorId))) {
                          setSelected(endpoint.elementId);
                          setPortPlacement(null);
                        }
                      }}
                      element={selectedElement}
                      onChange={(ports) => property('ports', ports)}
                      placing={portPlacement === selectedElement.id}
                      onPlace={() => {
                        setPortPlacement(
                          portPlacement === selectedElement.id ? null : selectedElement.id,
                        );
                        setMessage('Clique sobre o duto para posicionar o acesso; Escape cancela.');
                      }}
                    />
                  )}
                  {selectedElement.kind === 'label' && (
                    <TextControls {...selectedElement} onChange={property} />
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
                                <NumberField
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
                                  ['dimension', 'partition'].includes(selectedElement.kind) ||
                                  selectedElement.points.length >= 500 ||
                                  (!['polygon', 'floorRegion'].includes(selectedElement.kind) &&
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
                                  (['polygon', 'floorRegion'].includes(selectedElement.kind)
                                    ? 3
                                    : 2)
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
                    <button onClick={duplicate}>
                      <ToolIcon name="copy" /> Duplicar
                    </button>
                  )}
                  {wallSegments(selectedElement).length > 0 && (
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedElement.joinWalls === true}
                        onChange={(event) => property('joinWalls', event.target.checked)}
                      />
                      Unir ao encostar
                    </label>
                  )}
                  {selectedElement.kind === 'room' && (
                    <details>
                      <summary>Sala com equipamentos</summary>
                      <div className="blueprint-stacked-actions">
                        {[-1, 1].map((direction) => (
                          <button
                            key={direction}
                            aria-label={`Girar conjunto ${direction === 1 ? '+90°' : '−90°'}`}
                            title={`Girar sala e equipamentos ${direction === 1 ? '+90°' : '−90°'}`}
                            onClick={() => {
                              try {
                                commit(rotateRoomContents(project, selected, direction));
                              } catch (error) {
                                setMessage(error.message);
                              }
                            }}
                          >
                            <ToolIcon name={direction === 1 ? 'rotateRight' : 'rotateLeft'} />
                            {direction === 1 ? '+90°' : '−90°'} conjunto
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
                          <NumberField
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
                        <ToolIcon name="pan" /> Mover conjunto
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
                        <ToolIcon name="copy" /> Duplicar conjunto
                      </button>
                    </details>
                  )}
                  {project.elements.some(
                    (e) => (pastedGroup?.ids || [selected]).includes(e.id) && e.kind === 'room',
                  ) && (
                    <button
                      type="button"
                      onClick={convertSelectedRooms}
                      disabled={!!gesture}
                      title="Converte as salas retangulares em polígonos para editar os cantos individualmente. Ctrl+Z desfaz."
                    >
                      <ToolIcon name="polygon" /> Converter salas em vértices
                    </button>
                  )}
                  {(selectedElement.kind === 'asset' || pastedGroup?.ids.length) && (
                    <div className="blueprint-quick-actions">
                      <button
                        onClick={() => rotateSelection(-90)}
                        aria-label="Girar −90°"
                        title="Girar −90° (Shift+R)"
                      >
                        <ToolIcon name="rotateLeft" /> −90°
                      </button>
                      <button
                        onClick={() => rotateSelection(90)}
                        aria-label="Girar +90°"
                        title="Girar +90° (R)"
                      >
                        <ToolIcon name="rotateRight" /> +90°
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => groupSelection(false)}
                    disabled={!pastedGroup || pastedGroup.ids.length < 2}
                    title="Agrupar seleção (Ctrl+G)"
                  >
                    <ToolIcon name="group" /> Agrupar
                  </button>
                  <button
                    onClick={() => groupSelection(true)}
                    disabled={!selectedElement.groupId}
                    title="Desagrupar (Ctrl+Shift+G)"
                  >
                    <ToolIcon name="ungroup" /> Desagrupar
                  </button>
                  <button
                    onClick={remove}
                    title={
                      pastedGroup?.ids.length
                        ? 'Remover seleção (Delete)'
                        : 'Remover objeto (Delete)'
                    }
                  >
                    <ToolIcon name="delete" /> Remover
                  </button>
                </fieldset>
              </>
            ) : (
              <p className="muted">Selecione um objeto para editar.</p>
            )}
          </details>

          <ObjectsPanel
            project={project}
            selected={selected}
            disabled={!!gesture || !!points.length || !!connectionPlacement || !!modulePlacement}
            onChange={(next) => {
              if (commit(next)) {
                setSelected(null);
                setPastedGroup(null);
                setRotationPivot(null);
              }
            }}
            onLocate={(id) => {
              try {
                setView(objectView(project, id));
                setTool('select');
                setSelected(id);
                setPastedGroup(null);
                setRotationPivot(null);
                svgRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                svgRef.current?.focus({ preventScroll: true });
              } catch (error) {
                setMessage(error.message);
              }
            }}
            onSelect={(id) => {
              setTool('select');
              setSelected(id);
              setPastedGroup(null);
              setRotationPivot(null);
              setPanelsOpen(true);
            }}
          />

          <details>
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
        </aside>
      </div>
    </div>
  );
}
