export const layerFor = (kind) =>
  ({
    floorRegion: 'structure',
    partition: 'structure',
    room: 'structure',
    polygon: 'structure',
    ellipse: 'structure',
    corridor: 'structure',
    door: 'doors',
    asset: 'equipment',
    trace: 'equipment',
    vent: 'vents',
    label: 'labels',
    dimension: 'labels',
  })[kind];
