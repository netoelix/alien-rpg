import { officialSystems, officialTerritories } from './official-cartography.js';
import { validateLocations } from './system-profiles.js';
export { officialSystems, officialTerritories } from './official-cartography.js';

export const lightYearsPerParsec = 3.26156;
export const emptyNavigation = () => ({
  systems: [],
  territories: [],
  hiddenTerritories: [],
  route: [],
});

export const normalizeSystemName = (name) =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');

export function campaignSystems(campaign) {
  return [
    ...officialSystems.map((system) => ({
      ...system,
      locations: campaign.systemProfiles?.[system.id] ?? system.locations,
    })),
    ...(campaign.navigation?.systems || []),
  ];
}

export function validateSystemProfiles(profiles) {
  if (profiles === undefined) return [];
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles))
    return ['Fichas do catálogo oficial inválidas.'];
  return Object.entries(profiles).flatMap(([id, locations]) =>
    officialSystems.some((system) => system.id === id)
      ? validateLocations(locations === undefined ? null : locations)
      : ['Sistema oficial desconhecido: ' + id],
  );
}

export function campaignTerritories(campaign) {
  const hidden = new Set(campaign.navigation?.hiddenTerritories || []);
  return [
    ...officialTerritories.filter((entry) => !hidden.has(entry.id)),
    ...(campaign.navigation?.territories || []),
  ];
}

const validId = (id) => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
const validPoint = (point) =>
  point &&
  Number.isFinite(point.x) &&
  Number.isFinite(point.y) &&
  Math.abs(point.x) <= 10000 &&
  Math.abs(point.y) <= 10000;
const validText = (text) => typeof text === 'string' && Boolean(text.trim());

function validPolygon(points) {
  if (
    !Array.isArray(points) ||
    points.length < 3 ||
    points.length > 500 ||
    points.some((point) => !validPoint(point))
  )
    return false;
  const area = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  return Math.abs(area) > 1e-8;
}

export function validateNavigation(campaign) {
  const navigation = campaign.navigation === undefined ? {} : campaign.navigation;
  if (!navigation || typeof navigation !== 'object' || Array.isArray(navigation))
    return ['Cartografia da campanha inválida.'];
  const systems = navigation.systems === undefined ? [] : navigation.systems;
  const territories = navigation.territories === undefined ? [] : navigation.territories;
  const route = navigation.route === undefined ? [] : navigation.route;
  const hidden = navigation.hiddenTerritories === undefined ? [] : navigation.hiddenTerritories;
  if (![systems, territories, route, hidden].every(Array.isArray))
    return ['As listas de cartografia são inválidas.'];
  const ids = new Set(officialSystems.map((system) => system.id));
  const names = new Set(officialSystems.map((system) => normalizeSystemName(system.name)));
  const errors = [];
  for (const system of systems) {
    errors.push(...validateLocations(system?.locations));
    if (
      !system ||
      !validId(system.id) ||
      ids.has(system.id) ||
      !validText(system.name) ||
      names.has(normalizeSystemName(system.name)) ||
      system.official === true ||
      !validPoint(system) ||
      !Array.isArray(system.installations) ||
      system.installations.some((name) => !validText(name))
    ) {
      errors.push('Sistema inválido ou repetido no mapa da campanha.');
    }
    ids.add(system?.id);
    names.add(typeof system?.name === 'string' ? normalizeSystemName(system.name) : '');
  }
  const territoryIds = new Set(officialTerritories.map((entry) => entry.id));
  for (const territory of territories) {
    if (
      !territory ||
      !validId(territory.id) ||
      territoryIds.has(territory.id) ||
      !validText(territory.name) ||
      !['political', 'geographic'].includes(territory.kind) ||
      territory.official === true ||
      !/^#[0-9a-f]{6}$/i.test(territory.color || '') ||
      !['circle', 'polygon'].includes(territory.shape) ||
      (territory.shape === 'circle' &&
        (!validPoint(territory) ||
          !Number.isFinite(territory.radiusLy) ||
          territory.radiusLy <= 0 ||
          territory.radiusLy > 10000)) ||
      (territory.shape === 'polygon' &&
        (!validPolygon(territory.points) ||
          (territory.islands !== undefined &&
            (!Array.isArray(territory.islands) ||
              territory.islands.some((ring) => !validPolygon(ring))))))
    ) {
      errors.push('Território inválido: confira nome, cor e contorno.');
    }
    territoryIds.add(territory?.id);
  }
  if (
    new Set(hidden).size !== hidden.length ||
    hidden.some((id) => !officialTerritories.some((entry) => entry.id === id))
  )
    errors.push('Região-base desconhecida ou repetida.');
  const stopIds = new Set();
  for (const mission of campaign.timelines || []) {
    if (mission.systemId !== undefined && mission.systemId !== '' && !ids.has(mission.systemId))
      errors.push('Sistema da missão não existe nesta campanha.');
  }
  for (const stop of route) {
    if (
      !stop ||
      !validId(stop.id) ||
      stopIds.has(stop.id) ||
      !ids.has(stop.systemId) ||
      !validText(stop.arrival) ||
      (stop.departure !== undefined && typeof stop.departure !== 'string') ||
      (stop.note !== undefined && typeof stop.note !== 'string') ||
      (stop.missionIndex !== undefined &&
        stop.missionIndex !== null &&
        (!Number.isInteger(stop.missionIndex) ||
          stop.missionIndex < 0 ||
          stop.missionIndex >= (campaign.timelines?.length || 0)))
    ) {
      errors.push('Parada inválida: confira sistema, data e missão associada.');
    }
    stopIds.add(stop?.id);
  }
  return errors;
}

// Sem rota manual, apenas nomes que correspondem ao catálogo são associados.
// Uma parada sem posição interrompe a linha: não ligar pontos através da lacuna.
export function campaignRoute(campaign) {
  const systems = campaignSystems(campaign);
  const byId = new Map(systems.map((system) => [system.id, system]));
  if (campaign.navigation?.route?.length)
    return campaign.navigation.route.map((stop) => ({ ...stop, system: byId.get(stop.systemId) }));
  return (campaign.timelines || []).map((mission, index) => ({
    id: mission.id || 'mission-' + index,
    system:
      mission.systemId === undefined
        ? systemForLocation(systems, mission.location)
        : byId.get(mission.systemId),
    arrival: mission.dateTime,
    departure: '',
    missionIndex: index,
    note: mission.location,
    inferred: true,
  }));
}

// Designações repetidas na própria referência exigem seleção explícita por ID.
export function systemForLocation(systems, location = '') {
  const matches = systems.filter(
    (entry) => normalizeSystemName(entry.name) === normalizeSystemName(location),
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function routeSegments(stops) {
  return stops.slice(1).flatMap((to, index) => {
    const from = stops[index];
    return from.system && to.system ? [{ from, to }] : [];
  });
}

export function positionInSector(x, y) {
  const sectorX = Math.floor(x);
  const sectorY = Math.floor(y);
  const column = Math.min(9, Math.floor((x - sectorX) * 10 + 1e-8));
  const row = Math.min(9, Math.floor((y - sectorY) * 10 + 1e-8));
  return { sectorX, sectorY, column, row };
}

export function positionFromSector(sectorX, sectorY, column, row) {
  return {
    x: Number((sectorX + column / 10).toFixed(2)),
    y: Number((sectorY + row / 10).toFixed(2)),
  };
}
