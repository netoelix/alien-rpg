import sourceArchive from './archive.json';
import { normalizeArchive, campaignAchievements } from './archive-schema.js';
import { createCampaignModel } from './schema.js';

export const archive = normalizeArchive(sourceArchive);
export function modelsForArchive(archive) {
  return archive.campaigns.map((campaign) => ({
    ...createCampaignModel({ ...campaign, achievements: campaignAchievements(archive, campaign) }),
    campaign,
  }));
}
export const campaignModels = modelsForArchive(archive);
