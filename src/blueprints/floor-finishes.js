import { waterFinishes } from './water.js';
export const terrainFinishes = { plateau: 'Área elevada', depression: 'Depressão' };
export const floorFinishes = {
  ...terrainFinishes,
  ...waterFinishes,
  plain: 'Liso',
  dance: 'Pista de dança',
  hive: 'Resina de colmeia',
  tread: 'Piso antiderrapante',
  service: 'Painéis técnicos',
  plates: 'Chapas metálicas',
  tiles: 'Placas modulares',
  grating: 'Piso gradeado',
};
export const floorKinds = ['room', 'ellipse', 'polygon', 'corridor', 'floorRegion'];
export function normalizeFloorFinish(value) {
  // Keep the boundary of regions saved during the rock/vegetation trial.
  if (['rockField', 'vegetation'].includes(value?.type)) value = { ...value, type: 'plain' };
  if (!value || typeof value !== 'object' || !Object.hasOwn(floorFinishes, value.type))
    throw new Error('Acabamento de piso inválido.');
  const size = value.size ?? 1,
    opacity = value.opacity ?? 0.2;
  if (
    typeof size !== 'number' ||
    !Number.isFinite(size) ||
    size < 0.25 ||
    size > 10 ||
    typeof opacity !== 'number' ||
    !Number.isFinite(opacity) ||
    opacity < 0 ||
    opacity > 0.6
  )
    throw new Error('Use módulos de 0,25 a 10 m e intensidade de 0 a 60%.');
  if (Object.hasOwn(terrainFinishes, value.type)) {
    const height = value.height ?? 3;
    if (!Number.isFinite(height) || height <= 0 || height > 10000)
      throw Error('Use uma altura entre 0 e 10.000 m, maior que zero.');
    return { type: value.type, size, opacity, height };
  }
  if (value.type === 'hive' && value.density !== undefined) {
    if (!Number.isFinite(value.density) || value.density < 0 || value.density > 1)
      throw new Error('Densidade de infestação inválida.');
    return { type: value.type, size, opacity, density: value.density };
  }
  return { type: value.type, size, opacity };
}
