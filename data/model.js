import archive from './archive.json';
import { createCampaignModel } from './schema.js';

export { archive };
export const campaignModels = archive.campaigns.map((campaign) => ({
  ...createCampaignModel(campaign),
  campaign,
}));
