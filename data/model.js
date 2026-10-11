import { createCampaignModel } from './schema.js';

const response = await fetch(new URL('./fragmentos-da-guerra.json', import.meta.url));
if (!response.ok) throw new Error('Não foi possível carregar os arquivos da campanha.');
const model = createCampaignModel(await response.json());
export const { players, achievements, timelines, characters, aliases, playerAwards, awardDate, logMembers, relatedTo } = model;
export const campaign = {
  id: 'fragmentos-da-guerra',
  title: 'Fragmentos da Guerra',
  status: 'encerrada',
  author: 'Elix Merlino Neto',
  medalArtist: 'André Luiz Brandão',
};
