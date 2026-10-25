import { rotateGroup } from './groups.js';
import { newProject, parseProject } from './model.js';
import { copyBlueprint, pasteBlueprint } from './clipboard.js';
import { selectionBounds } from './selection.js';
export function moduleBounds(module) {
  const boxes = module.elements.filter((element) => element.kind !== 'door').map(selectionBounds);
  if (!boxes.length) throw new Error('Módulo sem peças.');
  const x = Math.min(...boxes.map((box) => box.x)),
    y = Math.min(...boxes.map((box) => box.y));
  return {
    x,
    y,
    w: Math.max(...boxes.map((box) => box.x + box.w)) - x,
    h: Math.max(...boxes.map((box) => box.y + box.h)) - y,
  };
}
export function parseModule(text) {
  if (text.length > 5000000) throw new Error('Módulo acima de 5 MB.');
  const raw = JSON.parse(text);
  if (
    raw.type !== 'alien-blueprint-module' ||
    raw.version !== 1 ||
    typeof raw.name !== 'string' ||
    !raw.name.trim() ||
    raw.name.length > 80
  )
    throw new Error('Arquivo de módulo inválido.');
  const project = parseProject(
    JSON.stringify({ ...newProject(), width: 2000, height: 2000, elements: raw.elements }),
  );
  const root = project.elements.find(
    (element) => element.id === raw.selectedId && element.kind !== 'door',
  );
  if (!root || project.elements.some((element) => element.hidden || element.locked))
    throw new Error('Módulo sem seleção válida ou com peças ocultas/bloqueadas.');
  const result = {
    type: raw.type,
    version: 1,
    name: raw.name.trim(),
    selectedId: root.id,
    elements: project.elements,
  };
  moduleBounds(result);
  return result;
}
export function createModule(project, ids, name) {
  const copied = copyBlueprint(project, ids);
  return parseModule(
    JSON.stringify({ type: 'alien-blueprint-module', version: 1, name, ...copied }),
  );
}
export function placeModule(project, module, x, y) {
  const bounds = moduleBounds(module);
  return pasteBlueprint(project, module, x - bounds.x, y - bounds.y);
}

export function parseModuleLibrary(text) {
  if (text.length > 20000000) throw new Error('Biblioteca acima de 20 MB.');
  const raw = JSON.parse(text);
  if (raw?.type === 'alien-blueprint-module') return [parseModule(text)];
  if (
    raw?.type !== 'alien-blueprint-library' ||
    raw.version !== 1 ||
    !Array.isArray(raw.modules) ||
    raw.modules.length > 100
  )
    throw new Error('Biblioteca inválida (máximo de 100 módulos).');
  return raw.modules.map((module) => parseModule(JSON.stringify(module)));
}
export function mergeModuleLibrary(current, incoming) {
  const seen = new Set(current.map((module) => JSON.stringify(module)));
  const added = incoming.filter((module) => {
    const key = JSON.stringify(module);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (current.length + added.length > 100)
    throw new Error('A biblioteca comporta até 100 módulos.');
  return [...current, ...added];
}
export function serializeModuleLibrary(modules) {
  const text = JSON.stringify({ type: 'alien-blueprint-library', version: 1, modules });
  parseModuleLibrary(text);
  return text;
}

export function rotateModule(module, direction) {
  const empty = { ...newProject(), width: 2000, height: 2000 };
  const bounds = moduleBounds(module);
  const centered = placeModule(empty, module, 1000 - bounds.w / 2, 1000 - bounds.h / 2);
  const rotated = rotateGroup(centered.project, centered.ids, direction);
  return parseModule(
    JSON.stringify({ ...module, selectedId: centered.selectedId, elements: rotated.elements }),
  );
}

export function moduleGrid(module, { rows = 1, columns = 1, gap = 0 } = {}) {
  if (
    ![rows, columns].every((value) => Number.isInteger(value) && value >= 1 && value <= 10) ||
    !Number.isFinite(gap) ||
    gap < 0 ||
    gap > 100
  )
    throw new Error('Use de 1 a 10 linhas/colunas e espaçamento de 0 a 100 m.');
  const box = moduleBounds(module);
  const positions = [];
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++)
      positions.push({ x: column * (box.w + gap), y: row * (box.h + gap) });
  return {
    positions,
    w: columns * box.w + (columns - 1) * gap,
    h: rows * box.h + (rows - 1) * gap,
  };
}
export function placeModuleGrid(project, module, x, y, options) {
  const grid = moduleGrid(module, options);
  if (project.elements.length + grid.positions.length * module.elements.length > 3000)
    throw new Error('A repetição ultrapassa o limite de 3000 objetos do pavimento.');
  if (
    ![x, y].every(Number.isFinite) ||
    x < 0 ||
    y < 0 ||
    x + grid.w > project.width ||
    y + grid.h > project.height
  )
    throw new Error('A grade de módulos ultrapassa os limites da planta.');
  let result = { project, ids: [], selectedId: null };
  for (const point of grid.positions) {
    const copy = placeModule(result.project, module, x + point.x, y + point.y);
    result = {
      project: copy.project,
      ids: [...result.ids, ...copy.ids],
      selectedId: result.selectedId || copy.selectedId,
    };
  }
  return result;
}
