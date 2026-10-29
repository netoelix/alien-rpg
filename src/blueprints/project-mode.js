import { assetCategories } from './asset-categories.js';
export const projectModes = [
  ['construction', 'Construção'],
  ['colony', 'Colônia'],
];
const externalCategories = new Set([
  'mining-production',
  'settlement',
  'settlement-living',
  'settlement-care',
  'settlement-services',
  'exterior',
  'garden',
  'market',
  'transit',
  'rail-vehicles',
  'industrial-vehicles',
  'road-vehicles',
  'floor-signage',
]);
const externalAssets = new Set(
  assetCategories.filter((c) => externalCategories.has(c.id)).flatMap((c) => c.items),
);
export const isColony = (project) => project.mode === 'colony';
export const assetInMode = (project, id) =>
  isColony(project) ? externalAssets.has(id) : !id.startsWith('colony');
export const toolInMode = (project, tool) =>
  !isColony(project) || !['door', 'wall', 'vent', 'module'].includes(tool);
export const pathInMode = (project, id) =>
  isColony(project) ? !['corridor', 'vent'].includes(id) : !['talus', 'cliff'].includes(id);
export function normalizeProjectMode(mode) {
  if (mode === undefined) return 'construction';
  if (!projectModes.some(([id]) => id === mode)) throw new Error('Modo de projeto desconhecido.');
  return mode;
}
