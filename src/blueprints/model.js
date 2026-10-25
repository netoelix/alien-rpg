import { validEndpoint } from './connections.js';
import { rotatePoint } from './orientation.js';
import { selectionBounds } from './selection.js';
export const wallTypes = {
  internal: 'Divisória interna',
  structural: 'Parede estrutural',
  hull: 'Casco externo',
  glass: 'Vidro',
  open: 'Abertura livre',
};
export function setWallArc(project, id, start, end, type) {
  const source = project.elements.find((element) => element.id === id);
  if (
    source?.kind !== 'ellipse' ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    start >= 360 ||
    end <= start ||
    end > start + 360
  )
    throw new Error('Informe um arco de até 360°, com fim maior que o início.');
  let result = project;
  const step = 360 / 64;
  for (let index = Math.floor(start / step); index < Math.ceil(end / step); index++) {
    result = setWallSection(result, id, {
      segment: index % 64,
      start: Math.max(0, (start - index * step) / step),
      end: Math.min(1, (end - index * step) / step),
      type,
    });
  }
  return result;
}
export function wallSections(element) {
  return (element.walls || [])
    .map((wall) => {
      const edge = wallSegments(element)[wall.segment];
      if (!edge) return null;
      const [a, b] = edge;
      const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      return { ...wall, a: at(wall.start), b: at(wall.end) };
    })
    .filter(Boolean);
}
export function setWallSection(project, id, section) {
  const source = project.elements.find((e) => e.id === id);
  const layer = project.layers.find((l) => l.id === 'structure');
  if (!source || !layer?.visible || layer.locked)
    throw new Error('Mostre e desbloqueie a estrutura para editar paredes.');
  if (
    !Number.isInteger(section.segment) ||
    !wallSegments(source)[section.segment] ||
    !Number.isFinite(section.start) ||
    !Number.isFinite(section.end) ||
    section.start < 0 ||
    section.end > 1 ||
    section.end <= section.start ||
    (section.type !== 'auto' && !Object.hasOwn(wallTypes, section.type))
  )
    throw new Error('Trecho de parede inválido.');
  // Paint only the requested interval, preserving both sides of existing sections.
  const walls = (source.walls || []).flatMap((wall) => {
    if (wall.segment !== section.segment || wall.end <= section.start || wall.start >= section.end)
      return [wall];
    const remaining = [];
    if (wall.start < section.start) remaining.push({ ...wall, end: section.start });
    if (wall.end > section.end) remaining.push({ ...wall, start: section.end });
    return remaining;
  });
  if (section.type !== 'auto') walls.push(section);
  walls.sort((a, b) => a.segment - b.segment || a.start - b.start);
  const merged = [];
  for (const wall of walls) {
    const previous = merged.at(-1);
    if (
      previous?.segment === wall.segment &&
      previous.type === wall.type &&
      previous.end === wall.start
    )
      previous.end = wall.end;
    else merged.push({ ...wall });
  }
  const next = { ...source };
  delete next.joinWalls;
  if (merged.length) next.walls = merged;
  else delete next.walls;
  return parseProject(
    JSON.stringify({ ...project, elements: project.elements.map((e) => (e.id === id ? next : e)) }),
  );
}
export const assetTypes = [
  'surveillanceCamera',
  'crtStation',
  'communicationsRadio',
  'reportPrinter',
  'dataTapeCabinet',
  'pottedPalm',
  'broadleafPot',
  'roundShrub',
  'gardenTree',
  'longPlanter',
  'roundPlanter',
  'hydroponicBed',
  'gardenRocks',
  'gardenPond',
  'parkBench',
  'picnicTable',
  'sunParasol',
  'safetyBollard',
  'floodlightStand',
  'outdoorCabinet',
  'solarPanelArray',
  'dishAntenna',
  'concreteBarrier',
  'drainGrate',
  'wovenRug',
  'floorLamp',
  'displayPlinth',
  'displayCase',
  'aquariumTank',
  'labIncubator',
  'sampleFreezer',
  'tubeRack',
  'securityMonitor',
  'securitySafe',
  'protectionShield',
  'weaponLocker',
  'gearStand',
  'inspectionBench',
  'labCentrifuge',
  'labMicroscope',
  'sampleAnalyzer',
  'dissectionTable',
  'loungeSofa',
  'loungeArmchair',
  'sideTable',
  'lowCabinet',
  'labSinkBench',
  'sampleFridge',
  'analysisCabinet',
  'securityLocker',
  'cargoContainer',
  'reinforcedCrate',
  'horizontalTank',
  'airCompressor',
  'cryoPodPlan',
  'surgeryTable',
  'medicalTrolley',
  'serverCabinet',
  'briefingTable',
  'sanitaryToilet',
  'washBasin',
  'showerTray',
  'galleySink',
  'galleyHob',
  'powerUnit',
  'pumpUnit',
  'verticalTank',
  'serviceBench',
  'cargoPallet',
  'storageShelf',
  'crewBed',
  'wallLocker',
  'crewBench',
  'diningTable',
  'examBed',
  'medicalCabinet',
  'commandBench',
  'deskTerminal',
  'operatorSeat',
  'stairs',
  'elevator',
  'console',
  'bed',
  'cryo',
  'table',
  'crate',
  'reactor',
  'chair',
  'medical',
  'locker',
  'hatch',
  'engine',
  'tank',
  'rack',
  'workbench',
  'kitchen',
  'sofa',
];
export const moduleNames = {
  bridge: 'Ponte de comando',
  medical: 'Enfermaria',
  quarters: 'Alojamento',
  cargo: 'Depósito de carga',
  engineering: 'Engenharia',
  mess: 'Refeitório',
};
export const layers = [
  { id: 'structure', name: 'Estrutura' },
  { id: 'doors', name: 'Portas e janelas' },
  { id: 'equipment', name: 'Equipamentos' },
  { id: 'vents', name: 'Ventilação' },
  { id: 'labels', name: 'Anotações' },
];
export const uid = () => crypto.randomUUID();
export function newProject() {
  return {
    version: 1,
    name: 'Planta sem título',
    width: 80,
    height: 60,
    grid: 1,
    theme: 'green',
    layers: layers.map((layer) => ({ ...layer, visible: true, locked: false, opacity: 1 })),
    elements: [],
  };
}
export const snap = (n, step) => Math.round(n / step) * step;
export const layerFor = (kind) =>
  ({
    partition: 'structure',
    room: 'structure',
    polygon: 'structure',
    ellipse: 'structure',
    corridor: 'structure',
    door: 'doors',
    asset: 'equipment',
    vent: 'vents',
    label: 'labels',
    dimension: 'labels',
  })[kind];
export function wallSegments(element) {
  if (element.kind === 'partition')
    return [[element.points[0], element.points[1]].map((p) => [p.x, p.y])];
  if (['room', 'ellipse'].includes(element.kind) && element.rotation) {
    return wallSegments({ ...element, rotation: 0 }).map((edge) =>
      edge.map(([x, y]) => {
        const p = rotatePoint(element, x, y);
        return [p.x, p.y];
      }),
    );
  }
  if (element.kind === 'polygon')
    return element.points.map((point, index) => {
      const next = element.points[(index + 1) % element.points.length];
      return [
        [point.x, point.y],
        [next.x, next.y],
      ];
    });
  if (element.kind === 'room') {
    const { x, y, w, h } = element;
    return [
      [
        [x, y],
        [x + w, y],
      ],
      [
        [x + w, y],
        [x + w, y + h],
      ],
      [
        [x + w, y + h],
        [x, y + h],
      ],
      [
        [x, y + h],
        [x, y],
      ],
    ];
  }
  if (element.kind === 'corridor') {
    const sides = element.points.slice(1).flatMap((b, i) => {
      const a = element.points[i],
        length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!length) return [];
      const dx = ((-(b.y - a.y) / length) * element.width) / 2,
        dy = (((b.x - a.x) / length) * element.width) / 2;
      return [
        [
          [a.x + dx, a.y + dy],
          [b.x + dx, b.y + dy],
        ],
        [
          [a.x - dx, a.y - dy],
          [b.x - dx, b.y - dy],
        ],
      ];
    });
    const ends = [];
    if (element.closedStart) ends.push([sides[1][0], sides[0][0]]);
    if (element.closedEnd) ends.push([sides.at(-2)[1], sides.at(-1)[1]]);
    return [...sides, ...ends];
  }
  // Paredes curvas são aproximadas por segmentos para ancoragem das portas.
  if (element.kind === 'ellipse') {
    return Array.from({ length: 64 }, (_, i) =>
      [i, i + 1].map((j) => [
        element.x + element.w / 2 + (Math.cos((j * Math.PI) / 32) * element.w) / 2,
        element.y + element.h / 2 + (Math.sin((j * Math.PI) / 32) * element.h) / 2,
      ]),
    );
  }
  return [];
}
export function doorPosition(door, elements) {
  const wall = elements.find((e) => e.id === door.wallId);
  const segment = wall && wallSegments(wall)[door.segment];
  if (!segment) return null;
  const [a, b] = segment;
  return {
    x: a[0] + (b[0] - a[0]) * door.t,
    y: a[1] + (b[1] - a[1]) * door.t,
    rotation: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
  };
}
export function fitOpenings(project) {
  return {
    ...project,
    elements: project.elements.map((opening) => {
      if (opening.kind !== 'door') return opening;
      const parent = project.elements.find((element) => element.id === opening.wallId);
      // Ellipse segments approximate a continuous curve, not physical corners.
      if (parent?.kind === 'ellipse') return opening;
      const edge = parent && wallSegments(parent)[opening.segment];
      if (!edge) return opening;
      const length = Math.hypot(edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]);
      const margin = (opening.width / 2 + 0.12) / length;
      if (margin > 0.5)
        throw new Error(
          'A porta ou janela não cabe nesta borda. Reduza a largura ou escolha outra parede.',
        );
      return { ...opening, t: Math.max(margin, Math.min(1 - margin, opening.t)) };
    }),
  };
}
export function nearestWall(elements, point, maxDistance = 2) {
  let best = null;
  elements.forEach((wall) =>
    wallSegments(wall).forEach(([a, b], segment) => {
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        length = dx * dx + dy * dy;
      if (!length) return;
      const t = Math.max(0, Math.min(1, ((point.x - a[0]) * dx + (point.y - a[1]) * dy) / length));
      const distance = Math.hypot(point.x - a[0] - t * dx, point.y - a[1] - t * dy);
      if (distance <= maxDistance && (!best || distance < best.distance))
        best = { wallId: wall.id, segment, t, distance };
    }),
  );
  return best;
}
export function openingHasWall(opening, elements) {
  if (elements.find((e) => e.id === opening.wallId)?.joinWalls)
    return joinedOpeningHasWall(opening, elements);
  const parent = elements.find((element) => element.id === opening.wallId);
  const edge = parent && wallSegments(parent)[opening.segment];
  if (!edge) return false;
  const [a, b] = edge,
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = Math.hypot(dx, dy);
  const count = Math.max(2, Math.ceil(opening.width / 0.025));
  for (let i = 0; i <= count; i++) {
    const t = opening.t + ((i / count - 0.5) * opening.width) / length;
    const explicit = parent.walls?.find(
      (wall) => wall.segment === opening.segment && t >= wall.start && t <= wall.end,
    );
    if (explicit?.type === 'open') return false;
  }
  return true;
}
function joinedOpeningHasWall(opening, elements) {
  const parent = elements.find((element) => element.id === opening.wallId);
  const edge = parent && wallSegments(parent)[opening.segment];
  if (!edge) return false;
  const contains = (shape, x, y) => {
    if (['room', 'ellipse'].includes(shape.kind) && shape.rotation) {
      const p = rotatePoint(shape, x, y, true);
      x = p.x;
      y = p.y;
    }
    if (shape.kind === 'room')
      return x > shape.x && x < shape.x + shape.w && y > shape.y && y < shape.y + shape.h;
    if (shape.kind === 'ellipse')
      return (
        ((x - shape.x - shape.w / 2) / (shape.w / 2)) ** 2 +
          ((y - shape.y - shape.h / 2) / (shape.h / 2)) ** 2 <
        1
      );
    if (shape.kind === 'polygon') {
      let inside = false;
      shape.points.forEach((a, index) => {
        const b = shape.points[(index + 1) % shape.points.length];
        if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x)
          inside = !inside;
      });
      return inside;
    }
    if (shape.kind === 'corridor')
      return shape.points.slice(1).some((b, index) => {
        const a = shape.points[index],
          dx = b.x - a.x,
          dy = b.y - a.y;
        const t = ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy);
        if ((index === 0 && t < 0) || (index === shape.points.length - 2 && t > 1)) return false;
        const clamped = Math.max(0, Math.min(1, t));
        return Math.hypot(x - a.x - clamped * dx, y - a.y - clamped * dy) < shape.width / 2;
      });
    return false;
  };
  const [a, b] = edge,
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = Math.hypot(dx, dy);
  const count = Math.max(2, Math.ceil(opening.width / 0.025));
  for (let i = 0; i <= count; i++) {
    const t = opening.t + ((i / count - 0.5) * opening.width) / length;
    const explicit = parent.walls?.find(
      (wall) => wall.segment === opening.segment && t >= wall.start && t <= wall.end,
    );
    if (explicit?.type === 'open') return false;
    if (explicit && !parent.joinWalls) continue;
    const x = a[0] + dx * t,
      y = a[1] + dy * t;
    const nx = (-dy / length) * 0.01,
      ny = (dx / length) * 0.01;
    if (
      (elements.some((shape) => shape.id !== parent.id && contains(shape, x + nx, y + ny)) &&
        elements.some((shape) => contains(shape, x - nx, y - ny))) ||
      (elements.some((shape) => shape.id !== parent.id && contains(shape, x - nx, y - ny)) &&
        elements.some((shape) => contains(shape, x + nx, y + ny)))
    )
      return false;
  }
  return true;
}
export function removeElement(project, id) {
  return { ...project, elements: project.elements.filter((e) => e.id !== id && e.wallId !== id) };
}
export function moveElement(element, dx, dy) {
  return element.points
    ? { ...element, points: element.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
    : { ...element, x: element.x + dx, y: element.y + dy };
}
export function duplicateRoomContents(project, id, dx, dy) {
  if (dx === 0 && dy === 0) throw new Error('Informe um deslocamento para posicionar a cópia.');
  return transformRoomContents(project, id, dx, dy, true);
}
export function moveRoomContents(project, id, dx, dy) {
  return transformRoomContents(project, id, dx, dy, false);
}
export function rotateRoomContents(project, id, direction = 1) {
  if (direction !== 1 && direction !== -1) throw new Error('Rotação inválida.');
  return transformRoomContents(project, id, 0, 0, false, direction);
}
function transformRoomContents(project, id, dx, dy, duplicate, rotation = 0) {
  const room = project.elements.find((element) => element.id === id);
  if (room?.kind !== 'room' || !Number.isFinite(dx) || !Number.isFinite(dy))
    throw new Error('Selecione uma sala retangular e informe um deslocamento válido.');
  const inside = (asset) => {
    const angle = ((asset.rotation || 0) * Math.PI) / 180;
    const cx = asset.x + asset.w / 2,
      cy = asset.y + asset.h / 2;
    return [-1, 1].every((sx) =>
      [-1, 1].every((sy) => {
        const x =
          cx + ((sx * asset.w) / 2) * Math.cos(angle) - ((sy * asset.h) / 2) * Math.sin(angle);
        const y =
          cy + ((sx * asset.w) / 2) * Math.sin(angle) + ((sy * asset.h) / 2) * Math.cos(angle);
        const local = rotatePoint(room, x, y, true);
        return (
          local.x >= room.x - 1e-8 &&
          local.x <= room.x + room.w + 1e-8 &&
          local.y >= room.y - 1e-8 &&
          local.y <= room.y + room.h + 1e-8
        );
      }),
    );
  };
  const members = project.elements.filter(
    (element) =>
      element.id === id || element.wallId === id || (element.kind === 'asset' && inside(element)),
  );
  if (
    members.some((element) => {
      const layer = project.layers.find((item) => item.id === layerFor(element.kind));
      return !layer?.visible || layer.locked;
    })
  )
    throw new Error('Mostre e desbloqueie as camadas da sala, equipamentos e aberturas.');
  const ids = new Set(members.map((element) => element.id));
  if (rotation) {
    const cx = room.x + room.w / 2,
      cy = room.y + room.h / 2;
    const segment = (value) => (value + (rotation === 1 ? 1 : 3)) % 4;
    return parseProject(
      JSON.stringify({
        ...project,
        elements: project.elements.map((element) => {
          if (!ids.has(element.id)) return element;
          if (element.kind === 'door') return { ...element, segment: segment(element.segment) };
          if (element.id === id)
            return {
              ...element,
              x: cx - room.h / 2,
              y: cy - room.w / 2,
              w: room.h,
              h: room.w,
              ...(element.walls
                ? {
                    walls: element.walls.map((wall) => ({
                      ...wall,
                      segment: segment(wall.segment),
                    })),
                  }
                : {}),
            };
          const ox = element.x + element.w / 2 - cx;
          const oy = element.y + element.h / 2 - cy;
          return {
            ...element,
            x: cx - rotation * oy - element.w / 2,
            y: cy + rotation * ox - element.h / 2,
            rotation: (((element.rotation + rotation * 90) % 360) + 360) % 360,
          };
        }),
      }),
    );
  }
  if (duplicate) {
    const copiedIds = new Map(members.map((element) => [element.id, uid()]));
    const copies = members.map((element) =>
      element.kind === 'door'
        ? { ...element, id: copiedIds.get(element.id), wallId: copiedIds.get(element.wallId) }
        : { ...moveElement(element, dx, dy), id: copiedIds.get(element.id) },
    );
    return {
      project: parseProject(
        JSON.stringify({ ...project, elements: [...project.elements, ...copies] }),
      ),
      selectedId: copiedIds.get(id),
    };
  }
  return parseProject(
    JSON.stringify({
      ...project,
      elements: project.elements.map((element) =>
        ids.has(element.id) && element.kind !== 'door' ? moveElement(element, dx, dy) : element,
      ),
    }),
  );
}
export function moveVertex(element, index, point) {
  if (!element.points || !Number.isInteger(index) || index < 0 || index >= element.points.length)
    throw new Error('Vértice inválido.');
  return {
    ...element,
    points: element.points.map((current, position) =>
      position === index ? { ...point } : current,
    ),
  };
}
// Mudanças na quantidade de pontos renumeram as bordas. Remapeamos as portas
// pela geometria, preservando as que continuam na mesma parede.
export function changeVertexCount(project, id, index, action) {
  const source = project.elements.find((element) => element.id === id);
  if (!source?.points || !Number.isInteger(index) || index < 0 || index >= source.points.length)
    throw new Error('Vértice inválido.');
  if (!['insert', 'remove'].includes(action)) throw new Error('Operação de vértice inválida.');
  const attachedDoors = project.elements.filter((element) => element.wallId === id);
  for (const element of [source, ...attachedDoors]) {
    const layer = project.layers.find((item) => item.id === layerFor(element.kind));
    if (!layer?.visible || layer.locked)
      throw new Error(
        'Mostre e desbloqueie a camada do traçado e de suas portas para alterar os vértices.',
      );
  }
  if (source.walls?.length)
    throw new Error(
      'Restaure as paredes automáticas antes de adicionar ou remover vértices. Mover vértices continua disponível.',
    );
  const points = [...source.points];
  const minimum = source.kind === 'polygon' ? 3 : 2;
  if (action === 'remove') {
    if (points.length <= minimum)
      throw new Error(`Este traçado precisa manter pelo menos ${minimum} vértices.`);
    points.splice(index, 1);
  } else {
    if (points.length >= 500) throw new Error('Limite de 500 vértices atingido.');
    if (source.kind !== 'polygon' && index === points.length - 1)
      throw new Error('Escolha um segmento anterior ao último ponto para inserir um vértice.');
    const a = points[index],
      b = points[(index + 1) % points.length];
    points.splice(index + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  const changed = { ...source, points };
  const previousSegments = wallSegments(source);
  const nextSegments = wallSegments(changed);
  const updatedDoors = new Map(
    attachedDoors.map((door) => {
      const previous = previousSegments[door.segment];
      const sameSegment = nextSegments.findIndex((segment) =>
        segment.every((point, endpoint) =>
          point.every((value, axis) => Math.abs(value - previous[endpoint][axis]) < 1e-8),
        ),
      );
      if (sameSegment >= 0) return [door.id, { ...door, segment: sameSegment }];
      const position = doorPosition(door, project.elements);
      let nearest = null;
      // Em corredores, a porta permanece no mesmo lado do percurso.
      nextSegments.forEach(([a, b], segment) => {
        if (source.kind === 'corridor' && segment % 2 !== door.segment % 2) return;
        const dx = b[0] - a[0],
          dy = b[1] - a[1],
          lengthSquared = dx * dx + dy * dy;
        if (!lengthSquared) return;
        const t = Math.max(
          0,
          Math.min(1, ((position.x - a[0]) * dx + (position.y - a[1]) * dy) / lengthSquared),
        );
        const distance = Math.hypot(position.x - a[0] - t * dx, position.y - a[1] - t * dy);
        if (!nearest || distance < nearest.distance) nearest = { segment, t, distance };
      });
      if (!nearest) throw new Error('Não foi possível manter uma porta vinculada ao traçado.');
      return [door.id, { ...door, segment: nearest.segment, t: nearest.t }];
    }),
  );
  return parseProject(
    JSON.stringify({
      ...project,
      elements: project.elements.map((element) =>
        element.id === id ? changed : updatedDoors.get(element.id) || element,
      ),
    }),
  );
}
// A cópia mantém suas próprias portas; nunca compartilha vínculos com a sala original.
export function duplicateElement(project, id) {
  const source = project.elements.find((element) => element.id === id);
  if (!source || source.kind === 'door')
    throw new Error('Para inserir outra porta, use a ferramenta Porta na parede desejada.');
  const attachedDoors = project.elements.filter((element) => element.wallId === id);
  const parts = [source, ...attachedDoors];
  if (
    parts.some((element) => {
      const layer = project.layers.find((item) => item.id === layerFor(element.kind));
      return !layer?.visible || layer.locked;
    })
  )
    throw new Error('Mostre e desbloqueie as camadas da peça e de suas portas para duplicar.');

  const step = project.grid;
  // Procura um deslocamento válido perto das bordas, sem alterar o tamanho da planta.
  for (const [dx, dy] of [
    [step, step],
    [-step, -step],
    [step, 0],
    [-step, 0],
    [0, step],
    [0, -step],
  ]) {
    const copy = { ...moveElement(source, dx, dy), id: uid() };
    const copies = [
      copy,
      ...attachedDoors.map((door) => ({ ...door, id: uid(), wallId: copy.id })),
    ];
    try {
      const next = parseProject(
        JSON.stringify({ ...project, elements: [...project.elements, ...copies] }),
      );
      return { project: next, selectedId: copy.id };
    } catch {
      // Tenta o próximo deslocamento; a validação também impõe o limite de objetos.
    }
  }
  throw new Error(
    'Não há espaço para a cópia ou o limite de objetos foi atingido. Amplie a planta ou remova peças.',
  );
}
export function makeModule(type, x, y) {
  if (!Object.hasOwn(moduleNames, type)) throw new Error('Módulo desconhecido.');
  const room = { id: uid(), kind: 'room', x, y, w: 10, h: 8 };
  const asset = (asset, xOffset, yOffset, w = 2, h = 1) => ({
    id: uid(),
    kind: 'asset',
    asset,
    x: x + xOffset,
    y: y + yOffset,
    w,
    h,
    rotation: 0,
  });
  const layouts = {
    medical: () => [
      asset('medical', 2, 2, 2, 3),
      asset('medical', 6, 2, 2, 3),
      asset('console', 7, 6),
    ],
    bridge: () => [
      asset('console', 1, 1, 8, 2),
      asset('chair', 3, 4, 1, 1),
      asset('chair', 6, 4, 1, 1),
    ],
    quarters: () => [
      asset('bed', 1, 1, 2, 3),
      asset('bed', 7, 1, 2, 3),
      asset('locker', 1, 6),
      asset('table', 5, 5, 2, 2),
    ],
    cargo: () => [asset('rack', 1, 1, 2, 5), asset('rack', 7, 1, 2, 5), asset('crate', 4, 1, 2, 2)],
    engineering: () => [
      asset('engine', 4, 1, 2, 3),
      asset('tank', 1, 1, 2, 3),
      asset('workbench', 7, 1, 2, 4),
      asset('console', 1, 6),
    ],
    mess: () => [
      asset('kitchen', 1, 1, 2, 4),
      asset('table', 5, 3, 3, 2),
      asset('sofa', 5, 1, 3, 1),
      asset('sofa', 5, 6, 3, 1),
    ],
  };
  const equipment = layouts[type]();
  return [
    room,
    ...equipment,
    { id: uid(), kind: 'door', wallId: room.id, segment: 2, t: 0.5, width: 1.5 },
  ];
}
// Projeta uma lista explícita de campos: um arquivo importado nunca vira HTML ou código.
export function parseProject(text) {
  if (text.length > 5_000_000) throw new Error('Projeto acima de 5 MB.');
  const raw = JSON.parse(text),
    result = newProject();
  const number = (n, min, max) => {
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max)
      throw new Error('Medida inválida no projeto.');
    return n;
  };
  const string = (s, max) => {
    if (typeof s !== 'string' || s.length > max) throw new Error('Texto inválido no projeto.');
    return s;
  };
  if (raw.version !== 1 || !Array.isArray(raw.elements) || raw.elements.length > 3000)
    throw new Error('Formato de projeto não suportado (máximo de 3000 objetos).');
  result.name = string(raw.name, 120);
  result.width = number(raw.width, 10, 2000);
  result.height = number(raw.height, 10, 2000);
  result.grid = number(raw.grid, 0.25, 50);
  result.theme = ['green', 'blue', 'print'].includes(raw.theme) ? raw.theme : 'green';
  if (!Array.isArray(raw.layers)) throw new Error('Camadas inválidas.');
  result.layers = result.layers.map((layer) => {
    const found = raw.layers.find((l) => l?.id === layer.id);
    return {
      ...layer,
      visible: found?.visible !== false,
      locked: found?.locked === true,
      opacity: number(found?.opacity ?? 1, 0.1, 1),
    };
  });
  const ids = new Set();
  result.elements = raw.elements.map((e) => {
    if (!e || !layerFor(e.kind)) throw new Error('Objeto desconhecido.');
    const id = string(e.id, 100);
    if (!id || ids.has(id)) throw new Error('Identificador repetido.');
    ids.add(id);
    const base = { id, kind: e.kind };
    for (const flag of ['hidden', 'locked']) {
      if (e[flag] !== undefined) {
        if (typeof e[flag] !== 'boolean') throw new Error('Estado de objeto inválido.');
        base[flag] = e[flag];
      }
    }
    if (e.name !== undefined) base.name = string(e.name, 80);
    if (e.groupId !== undefined) {
      base.groupId = string(e.groupId, 100);
      if (!base.groupId.trim()) throw new Error('Identificador de grupo inválido.');
    }
    if (layerFor(e.kind) === 'structure' && e.joinWalls === true) base.joinWalls = true;
    if (e.walls !== undefined) {
      if (layerFor(e.kind) !== 'structure' || !Array.isArray(e.walls) || e.walls.length > 1000)
        throw new Error('Trechos de parede inválidos.');
      base.walls = e.walls.map((wall) => {
        if (
          !wall ||
          !Object.hasOwn(wallTypes, wall.type) ||
          !Number.isInteger(wall.segment) ||
          wall.segment < 0
        )
          throw new Error('Tipo ou segmento de parede inválido.');
        const start = number(wall.start, 0, 1),
          end = number(wall.end, 0, 1);
        if (end <= start) throw new Error('O fim do trecho deve ser maior que o início.');
        return { segment: wall.segment, start, end, type: wall.type };
      });
      const ordered = [...base.walls].sort((a, b) => a.segment - b.segment || a.start - b.start);
      if (
        ordered.some(
          (wall, index) =>
            index > 0 &&
            ordered[index - 1].segment === wall.segment &&
            ordered[index - 1].end > wall.start,
        )
      )
        throw new Error('Trechos da mesma borda não podem se sobrepor.');
    }
    if (e.kind === 'door') {
      if (e.openingType !== undefined && !['door', 'window'].includes(e.openingType))
        throw new Error('Tipo de abertura inválido.');
      return {
        ...base,
        ...(e.openingType ? { openingType: e.openingType } : {}),
        wallId: string(e.wallId, 100),
        segment: number(e.segment, 0, 10000),
        t: number(e.t, 0, 1),
        width: number(e.width, 0.25, 20),
      };
    }
    if (e.kind === 'partition') {
      if (!Array.isArray(e.points) || e.points.length !== 2)
        throw new Error('A parede precisa de duas extremidades.');
      const points = e.points.map((p) => ({
        x: number(p.x, 0, result.width),
        y: number(p.y, 0, result.height),
      }));
      if (Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) < 0.25)
        throw new Error('Parede muito curta.');
      return { ...base, points };
    }
    if (e.kind === 'dimension') {
      if (!Array.isArray(e.points) || e.points.length !== 2)
        throw new Error('A cota precisa de dois pontos.');
      const points = e.points.map((p) => ({
        x: number(p.x, 0, result.width),
        y: number(p.y, 0, result.height),
      }));
      if (Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) < 0.25)
        throw new Error('A cota precisa medir pelo menos 0,25 m.');
      if (e.mode !== undefined && !['direct', 'horizontal', 'vertical'].includes(e.mode))
        throw new Error('Tipo de cota inválido.');
      return {
        ...base,
        points,
        ...(e.mode ? { mode: e.mode } : {}),
        ...(e.offset !== undefined ? { offset: number(e.offset, -2000, 2000) } : {}),
      };
    }
    if (['vent', 'corridor', 'polygon'].includes(e.kind)) {
      if (
        !Array.isArray(e.points) ||
        e.points.length < (e.kind === 'polygon' ? 3 : 2) ||
        e.points.length > 500
      )
        throw new Error('Traçado inválido.');
      if (
        e.kind === 'vent' &&
        e.accesses !== undefined &&
        (!Array.isArray(e.accesses) ||
          e.accesses.length !== 2 ||
          e.accesses.some((t) => !['auto', 'grille', 'hatch', 'open', 'cap'].includes(t)))
      )
        throw new Error('Acessos de ventilação inválidos.');
      const points = e.points.map((p) => ({
        x: number(p.x, 0, result.width),
        y: number(p.y, 0, result.height),
      }));
      if (e.kind === 'polygon') validatePolygon(points);
      else if (
        points
          .slice(1)
          .some(
            (point, index) =>
              Math.hypot(point.x - points[index].x, point.y - points[index].y) < 0.25,
          )
      )
        throw new Error(
          'Os pontos consecutivos do traçado precisam estar separados por pelo menos 0,25 m.',
        );
      return {
        ...base,
        ...(e.kind === 'vent' && e.accesses ? { accesses: [...e.accesses] } : {}),
        ...(e.kind === 'corridor'
          ? {
              ...(e.closedStart === true ? { closedStart: true } : {}),
              ...(e.closedEnd === true ? { closedEnd: true } : {}),
            }
          : {}),
        ...(e.kind === 'polygon' ? {} : { width: number(e.width, 0.25, 50) }),
        points,
      };
    }
    const position = { x: number(e.x, 0, result.width), y: number(e.y, 0, result.height) };
    if (e.kind === 'label') {
      if (e.align !== undefined && !['start', 'middle', 'end'].includes(e.align))
        throw new Error('Alinhamento inválido.');
      if (e.bold !== undefined && typeof e.bold !== 'boolean') throw new Error('Estilo inválido.');
      return {
        ...base,
        ...position,
        text: string(e.text, 1000),
        size: number(e.size, 0.25, 20),
        ...(e.align ? { align: e.align } : {}),
        ...(e.bold !== undefined ? { bold: e.bold } : {}),
      };
    }
    if (e.kind === 'asset' && !assetTypes.includes(e.asset))
      throw new Error('Equipamento desconhecido.');
    return {
      ...base,
      ...position,
      w: number(e.w, 0.25, 2000),
      h: number(e.h, 0.25, 2000),
      ...(e.kind === 'asset' ? { asset: e.asset, rotation: number(e.rotation, -360, 360) } : {}),
      ...(['room', 'ellipse'].includes(e.kind) && e.rotation !== undefined
        ? { rotation: number(e.rotation, -360, 360) }
        : {}),
    };
  });
  for (const e of result.elements) {
    const segments = wallSegments(e);
    if (e.walls?.some((wall) => !segments[wall.segment]))
      throw new Error('Trecho sem borda válida.');
    if (e.kind === 'door') {
      const parent = result.elements.find((wall) => wall.id === e.wallId);
      const edge = parent && wallSegments(parent)[e.segment];
      if (edge) {
        const length = Math.hypot(edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]);
        const half = e.width / (2 * length);
        if (
          parent.walls?.some(
            (wall) =>
              wall.type === 'open' &&
              wall.segment === e.segment &&
              e.t + half > wall.start &&
              e.t - half < wall.end,
          )
        )
          throw new Error(
            'Há uma porta neste trecho. Remova ou reposicione a porta antes de criar a abertura livre.',
          );
      }
    }
    if (e.kind === 'door' && (!Number.isInteger(e.segment) || !doorPosition(e, result.elements)))
      throw new Error('Porta sem parede válida.');
    if (['room', 'ellipse'].includes(e.kind) && e.rotation) {
      const box = selectionBounds(e);
      if (
        box.x < -1e-8 ||
        box.y < -1e-8 ||
        box.x + box.w > result.width + 1e-8 ||
        box.y + box.h > result.height + 1e-8
      )
        throw new Error('Objeto girado ultrapassa o tamanho da planta.');
    }
    if (e.w && (e.x + e.w > result.width || e.y + e.h > result.height))
      throw new Error('Objeto ultrapassa o tamanho da planta.');
  }
  if (raw.floors !== undefined) {
    if (!Array.isArray(raw.floors) || !raw.floors.length || raw.floors.length > 20)
      throw new Error('Lista de pavimentos inválida (máximo 20).');
    const floorIds = new Set();
    result.activeFloor = string(raw.activeFloor || raw.floors[0]?.id, 100);
    result.floors = raw.floors.map((floor) => {
      const id = string(floor?.id, 100);
      const name = string(floor?.name, 80).trim();
      if (!id || !name || floorIds.has(id)) throw new Error('Pavimento inválido ou repetido.');
      floorIds.add(id);
      if (id === result.activeFloor) return { id, name };
      const { floors, activeFloor, connections, ...base } = raw;
      const parsed = parseProject(JSON.stringify({ ...base, elements: floor.elements || [] }));
      return { id, name, elements: parsed.elements };
    });
    if (!floorIds.has(result.activeFloor)) throw new Error('Pavimento ativo não encontrado.');
  }
  if (raw.connections !== undefined) {
    if (!Array.isArray(raw.connections) || raw.connections.length > 3000)
      throw new Error('Conexões inválidas.');
    const linkIds = new Set();
    result.connections = raw.connections.map((link) => {
      const id = string(link?.id, 100);
      if (!id || linkIds.has(id)) throw new Error('Conexão repetida.');
      linkIds.add(id);
      const endpoint = (value) => ({
        floorId: string(value?.floorId, 100),
        elementId: string(value?.elementId, 100),
      });
      const from = endpoint(link.from),
        to = endpoint(link.to);
      if (from.floorId === to.floorId || !validEndpoint(result, from) || !validEndpoint(result, to))
        throw new Error('Conexão sem destino válido.');
      return { id, from, to };
    });
  }
  return result;
}
export function validatePolygon(points) {
  const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const onSegment = (a, b, p) =>
    Math.abs(cross(a, b, p)) < 1e-8 &&
    p.x >= Math.min(a.x, b.x) &&
    p.x <= Math.max(a.x, b.x) &&
    p.y >= Math.min(a.y, b.y) &&
    p.y <= Math.max(a.y, b.y);
  const intersects = (a, b, c, d) =>
    (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) ||
    onSegment(a, b, c) ||
    onSegment(a, b, d) ||
    onSegment(c, d, a) ||
    onSegment(c, d, b);
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 0.25)
      throw new Error('Cada parede da sala precisa ter pelo menos 0,25 m.');
    area += a.x * b.y - b.x * a.y;
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue;
      if (intersects(a, b, points[j], points[(j + 1) % points.length]))
        throw new Error(
          'O contorno da sala não pode cruzar ou tocar a si mesmo. Remova o último ponto e ajuste o traçado.',
        );
    }
  }
  if (Math.abs(area) < 0.125)
    throw new Error('A sala precisa fechar uma área de pelo menos 0,0625 m².');
}
export function exampleProject() {
  return {
    ...newProject(),
    name: 'Deck de demonstração',
    width: 40,
    height: 30,
    elements: [
      ...makeModule('bridge', 4, 4),
      ...makeModule('medical', 24, 4),
      {
        id: uid(),
        kind: 'corridor',
        width: 2,
        points: [
          { x: 9, y: 12 },
          { x: 9, y: 18 },
          { x: 29, y: 18 },
          { x: 29, y: 12 },
        ],
      },
      {
        id: uid(),
        kind: 'vent',
        width: 0.7,
        points: [
          { x: 5, y: 6 },
          { x: 5, y: 22 },
          { x: 33, y: 22 },
          { x: 33, y: 6 },
        ],
      },
      { id: uid(), kind: 'label', x: 4, y: 27, text: 'DECK 01 / DEMONSTRAÇÃO', size: 1 },
    ],
  };
}
