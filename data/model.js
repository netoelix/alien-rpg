import { createCampaignModel } from './schema.js';
import campaignData from './fragmentos-da-guerra.json';

const model = createCampaignModel(campaignData);
export const {
  players,
  achievements,
  timelines,
  characters,
  aliases,
  playerAwards,
  awardDate,
  logMembers,
  relatedTo,
} = model;
export const campaign = {
  id: 'fragmentos-da-guerra',
  title: 'Fragmentos da Guerra',
  status: 'encerrada',
  author: 'Elix Merlino Neto',
  medalArtist: 'André Luiz Brandão',
};
