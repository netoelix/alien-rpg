// Coordenadas em parsecs, com Sol na origem. O catálogo oficial não é editável.
export const officialSystems = [{ id: 'sol', name: 'Sol', x: 0, y: 0, installations: [] }];

export function campaignSystems(campaign) {
  return [...officialSystems, ...(campaign.navigation?.systems || [])];
}

export function validateNavigation(campaign) {
  const systems = campaign.navigation?.systems;
  if (systems === undefined) return [];
  if (!Array.isArray(systems)) return ['Cadastro de sistemas inválido.'];
  const ids = new Set(officialSystems.map((system) => system.id));
  const names = new Set(officialSystems.map((system) => system.name.toLowerCase()));
  const errors = [];
  for (const system of systems) {
    if (
      !system ||
      typeof system.id !== 'string' ||
      ids.has(system.id) ||
      typeof system.name !== 'string' ||
      !system.name.trim() ||
      names.has(system.name.trim().toLowerCase()) ||
      !Number.isFinite(system.x) ||
      !Number.isFinite(system.y) ||
      !Array.isArray(system.installations) ||
      system.installations.some((name) => typeof name !== 'string' || !name.trim())
    ) {
      errors.push('Sistema inválido ou repetido no mapa da campanha.');
    }
    ids.add(system?.id);
    names.add(typeof system?.name === 'string' ? system.name.trim().toLowerCase() : '');
  }
  return errors;
}
