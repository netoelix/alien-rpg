import { waterFinishes } from './water.js';
export const floorFinishes = {
  ...waterFinishes,
  plain: 'Liso',
  tread: 'Piso antiderrapante',
  service: 'Painéis técnicos',
  plates: 'Chapas metálicas',
  tiles: 'Placas modulares',
  grating: 'Piso gradeado',
};
export const floorKinds = ['room', 'ellipse', 'polygon', 'corridor', 'floorRegion'];
export function normalizeFloorFinish(value) {
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
  return { type: value.type, size, opacity };
}
