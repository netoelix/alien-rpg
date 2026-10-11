import sourceArchive from './archive.json';
import { normalizeArchive } from './archive-schema.js';
import { createCampaignModel } from './schema.js';

export const archive = normalizeArchive(sourceArchive);
export const campaignModels = archive.campaigns.map((campaign) => ({
  ...createCampaignModel(campaign),
  campaign,
}));
