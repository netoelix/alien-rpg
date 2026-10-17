import sourceArchive from './archive.json' with { type: 'json' };
import { normalizeArchive, campaignAchievements } from './archive-schema.js';
import { profileAchievements } from './player-profiles.js';
import { createCampaignModel } from './schema.js';

export const archive = normalizeArchive(sourceArchive);
export function modelsForArchive(archive) {
  return archive.campaigns.map((campaign) => ({
    ...createCampaignModel({ ...campaign, achievements: campaignAchievements(archive, campaign) }),
    campaign: { ...campaign, systemProfiles: archive.systemProfiles },
    playerProfile: (index) =>
      archive.playerProfiles.find((profile) => profile.id === campaign.players[index]?.profileId),
    profileAwards: (index) => profileAchievements(archive, campaign.players[index]?.profileId),
    playerCampaigns: (index) =>
      archive.campaigns.flatMap((entry) => {
        const playerIndex = entry.players.findIndex(
          (player) => player.profileId === campaign.players[index]?.profileId && !player.mascot,
        );
        return playerIndex < 0 ? [] : [{ campaign: entry, playerIndex }];
      }),
  }));
}
export const campaignModels = modelsForArchive(archive);
