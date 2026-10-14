import { emptyNavigation, campaignSystems, systemForLocation } from './star-map.js';

// Localizações confirmadas pelo autor. Acheron Prime foi estimado na imagem enviada.
export function addFragmentosNavigation(archive) {
  const campaign = archive.campaigns.find((entry) => entry.id === 'fragmentos-da-guerra');
  if (!campaign) return archive;
  campaign.navigation ??= emptyNavigation();
  campaign.navigation.systems ??= [];
  const discoveries = [
    { id: 'sea-delta', name: 'Sea Δ', x: 0, y: -60, installations: [] },
    { id: 'acheron-prime', name: 'Acheron Prime', x: 10.5, y: 6.2, installations: [] },
  ];
  for (const system of discoveries) {
    if (
      !campaignSystems(campaign).some(
        (entry) => entry.id === system.id || entry.name === system.name,
      )
    )
      campaign.navigation.systems.push(system);
  }
  const systems = campaignSystems(campaign);
  for (const mission of campaign.timelines) {
    if (mission.systemId !== undefined) continue;
    const system =
      mission.location === 'QG Provisorio – AU'
        ? systems.find((entry) => entry.id === 'zkh-341')
        : systemForLocation(systems, mission.location);
    if (system) mission.systemId = system.id;
  }
  return archive;
}
