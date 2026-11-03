import { floorMarkings } from './floor-markings.js';
import { isPlatform } from './level-assets.js';
import { colonyAssets } from './colony-assets.js';

export const visualLayers = {
  underground: 'Sob o piso',
  floor: 'Piso',
  objects: 'Objetos',
  walls: 'Paredes',
  openings: 'Portas e janelas',
  mounted: 'Fixados à parede',
  ceiling: 'Teto',
  overhead: 'Acima do teto',
  annotations: 'Anotações',
};
const mountedAssets = new Set([
  'surveillanceCamera',
  'bulkheadAccessReader',
  'wallResinWeb',
  'wallFountain',
  'wallArtwork',
  'wallLocker',
]);
export function defaultVisualLayer(e) {
  switch (e.kind) {
    case 'asset':
      if (mountedAssets.has(e.asset)) return 'mounted';
      if (
        floorMarkings[e.asset] ||
        isPlatform(e.asset) ||
        colonyAssets[e.asset]?.category === 'floor-technical'
      )
        return 'floor';
      return 'objects';
    case 'door':
      return 'openings';
    case 'vent':
      return 'overhead';
    case 'floorRegion':
      return 'floor';
    case 'trace':
      return e.traceType === 'pipe' ? 'underground' : 'floor';
    case 'label':
    case 'dimension':
      return 'annotations';
    default:
      return 'walls';
  }
}
export const visualLayer = (e) => e.visualLayer ?? defaultVisualLayer(e);
