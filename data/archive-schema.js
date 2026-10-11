import { validateCampaign } from './schema.js';

export function validateArchive(archive) {
  if (!archive || archive.version !== 1 || !Array.isArray(archive.campaigns)) {
    return ['Formato de arquivo não reconhecido.'];
  }
  if (!archive.campaigns.length) return ['Mantenha pelo menos uma campanha no arquivo.'];
  const ids = new Set();
  const errors = [];
  for (const campaign of archive.campaigns) {
    if (
      !campaign ||
      typeof campaign.id !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(campaign.id)
    ) {
      errors.push('Identificador de campanha inválido. Use letras minúsculas, números e hífens.');
      continue;
    }
    if (ids.has(campaign.id)) errors.push('Campanha repetida: ' + campaign.id);
    ids.add(campaign.id);
    if (campaign.title !== undefined && typeof campaign.title !== 'string')
      errors.push('Nome de campanha inválido.');
    for (const field of [
      'author',
      'medalArtist',
      'unit',
      'division',
      'period',
      'summary',
      'description',
    ]) {
      if (campaign[field] !== undefined && typeof campaign[field] !== 'string')
        errors.push('Campo de apresentação inválido: ' + field);
    }
    if (!['encerrada', 'em-andamento', 'planejada'].includes(campaign.status))
      errors.push('Estado de campanha inválido.');
    const campaignErrors = validateCampaign(campaign);
    errors.push(...campaignErrors.map((error) => `${campaign.title}: ${error}`));
    if (campaignErrors.length) continue;
    const characterIds = new Set();
    const playerIds = new Set();
    for (const player of campaign.players || []) {
      if (
        typeof player.id !== 'string' ||
        !/^[a-zA-Z0-9-]+$/.test(player.id) ||
        playerIds.has(player.id)
      )
        errors.push('Identificador de jogador ausente ou repetido.');
      playerIds.add(player.id);
      for (const character of player.characters || []) {
        if (
          typeof character.id !== 'string' ||
          !/^[a-zA-Z0-9-]+$/.test(character.id) ||
          characterIds.has(character.id)
        )
          errors.push('Identificador de personagem ausente ou repetido.');
        characterIds.add(character.id);
      }
    }
  }
  return errors;
}

export function automaticCampaignTitle(campaigns, campaignId) {
  let number = campaignId
    ? campaigns.findIndex((campaign) => campaign.id === campaignId) + 1
    : campaigns.length + 1;
  number = Math.max(number, 1);
  const used = new Set(
    campaigns.filter((campaign) => campaign.id !== campaignId).map((campaign) => campaign.title),
  );
  while (used.has(`Campanha ${number}`)) number += 1;
  return `Campanha ${number}`;
}

export function normalizeArchive(archive) {
  const normalized = structuredClone(archive);
  for (const campaign of normalized.campaigns) {
    campaign.title =
      campaign.title?.trim() || automaticCampaignTitle(normalized.campaigns, campaign.id);
    for (const field of [
      'author',
      'medalArtist',
      'unit',
      'division',
      'period',
      'summary',
      'description',
    ])
      campaign[field] ??= '';
  }
  return normalized;
}

export function newCampaign(title, campaigns = []) {
  return {
    id: `campanha-${crypto.randomUUID()}`,
    title: title?.trim() || automaticCampaignTitle(campaigns),
    status: 'planejada',
    author: '',
    medalArtist: '',
    unit: '',
    division: '',
    period: '',
    summary: '',
    description: '',
    players: [],
    achievements: [],
    timelines: [],
  };
}
