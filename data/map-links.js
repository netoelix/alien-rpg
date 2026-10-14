import { campaignRoute, campaignSystems, systemForLocation } from './star-map.js';

export function missionMapLink(campaign, missionIndex) {
  const mission = campaign.timelines[missionIndex];
  if (!mission) return null;
  const systems = campaignSystems(campaign);
  const system =
    mission.systemId === undefined
      ? systemForLocation(systems, mission.location)
      : systems.find((item) => item.id === mission.systemId);
  if (!system) return null;
  const stop = campaignRoute(campaign).find(
    (item) => item.missionIndex === missionIndex && item.system?.id === system.id,
  );
  return stop ? `map/stop/${stop.id}` : `map/system/${system.id}`;
}

export function resolveMapLink(campaign, kind, id) {
  const stops = campaignRoute(campaign);
  const index = kind === 'stop' ? stops.findIndex((stop) => stop.id === id) : -1;
  const system =
    index >= 0
      ? stops[index].system
      : kind === 'system'
        ? campaignSystems(campaign).find((item) => item.id === id)
        : null;
  return { index, system, invalid: Boolean(kind && !system) };
}
