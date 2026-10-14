import catalogue from './official-catalog.json' with { type: 'json' };
import contours from './territory-contours.json' with { type: 'json' };

// Levantamento da imagem local Stars of the Middle Heavens (2183).
// Os pixels identificam o centro da estrela, não a posição de seu rótulo.
// Coordenadas são cartográficas, não posições astronômicas tridimensionais.
export const mapReference = Object.freeze({
  width: 8000,
  height: 5167,
  originX: 4004,
  originY: 2587,
  pixelsPerParsec: 166,
});

export function positionFromReference(pixelX, pixelY) {
  return {
    x: Number(((pixelX - mapReference.originX) / mapReference.pixelsPerParsec).toFixed(2)),
    y: Number(((mapReference.originY - pixelY) / mapReference.pixelsPerParsec).toFixed(2)),
  };
}

export const officialSystems = Object.freeze(
  catalogue.map(({ id, name, pixelX, pixelY, installations }) =>
    Object.freeze({
      id,
      name,
      ...positionFromReference(pixelX, pixelY),
      installations: Object.freeze([...installations]),
      referencePixel: Object.freeze({ x: pixelX, y: pixelY }),
      official: true,
    }),
  ),
);

const freezeRing = (points) => Object.freeze(points.map((point) => Object.freeze({ ...point })));
// Contornos aproximados da referência de 2183, incluindo áreas descontínuas.
export const officialTerritories = Object.freeze(
  [
    {
      id: 'frontier',
      name: 'Fronteira',
      kind: 'geographic',
      color: '#ad387d',
    },
    {
      id: 'upp',
      name: 'União dos Povos Progressistas',
      kind: 'political',
      color: '#b36f2b',
    },
    {
      id: 'three-world-empire',
      name: 'Império dos Três Mundos',
      kind: 'political',
      color: '#238c75',
    },
    {
      id: 'united-americas',
      name: 'Américas Unidas',
      kind: 'political',
      color: '#536bd8',
    },
    {
      id: 'independent-core',
      name: 'Colônias Independentes dos Sistemas Centrais',
      kind: 'political',
      color: '#b8a63a',
    },
  ].map((territory) =>
    Object.freeze({
      ...territory,
      shape: 'polygon',
      official: true,
      points: freezeRing(contours[territory.id][0]),
      islands: Object.freeze(contours[territory.id].slice(1).map(freezeRing)),
    }),
  ),
);
