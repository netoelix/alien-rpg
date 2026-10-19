export const assetTypes = [
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
  { id: 'doors', name: 'Portas' },
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
    room: 'structure',
    polygon: 'structure',
    ellipse: 'structure',
    corridor: 'structure',
    door: 'doors',
    asset: 'equipment',
    vent: 'vents',
    label: 'labels',
  })[kind];
export function wallSegments(element) {
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
    return element.points.slice(1).flatMap((b, i) => {
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
export function removeElement(project, id) {
  return { ...project, elements: project.elements.filter((e) => e.id !== id && e.wallId !== id) };
}
export function moveElement(element, dx, dy) {
  return element.points
    ? { ...element, points: element.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
    : { ...element, x: element.x + dx, y: element.y + dy };
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
    if (e.kind === 'door')
      return {
        ...base,
        wallId: string(e.wallId, 100),
        segment: number(e.segment, 0, 10000),
        t: number(e.t, 0, 1),
        width: number(e.width, 0.25, 20),
      };
    if (['vent', 'corridor', 'polygon'].includes(e.kind)) {
      if (
        !Array.isArray(e.points) ||
        e.points.length < (e.kind === 'polygon' ? 3 : 2) ||
        e.points.length > 500
      )
        throw new Error('Traçado inválido.');
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
        ...(e.kind === 'polygon' ? {} : { width: number(e.width, 0.25, 50) }),
        points,
      };
    }
    const position = { x: number(e.x, 0, result.width), y: number(e.y, 0, result.height) };
    if (e.kind === 'label')
      return { ...base, ...position, text: string(e.text, 200), size: number(e.size, 0.25, 20) };
    if (e.kind === 'asset' && !assetTypes.includes(e.asset))
      throw new Error('Equipamento desconhecido.');
    return {
      ...base,
      ...position,
      w: number(e.w, 0.25, 2000),
      h: number(e.h, 0.25, 2000),
      ...(e.kind === 'asset' ? { asset: e.asset, rotation: number(e.rotation, -360, 360) } : {}),
    };
  });
  for (const e of result.elements) {
    if (e.kind === 'door' && (!Number.isInteger(e.segment) || !doorPosition(e, result.elements)))
      throw new Error('Porta sem parede válida.');
    if (e.w && (e.x + e.w > result.width || e.y + e.h > result.height))
      throw new Error('Objeto ultrapassa o tamanho da planta.');
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
