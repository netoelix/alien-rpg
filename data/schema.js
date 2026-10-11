export function createCampaignModel(data) {
  const { players, achievements, timelines } = data;
  const aliases = [['Trisha', 'Trisha M.'], ['Takeo'], ['Harper'], ['C.R.I.S.', 'CRIS'], ['Sean'], ['Carla'], ['Minsk']];
  const characters = players.flatMap((player, playerId) => player.characters.map(character => ({ ...character, playerId })))
    .map((character, id) => ({ ...character, id }));
  const playerAwards = playerId => achievements.filter(achievement => achievement.character.some(award => award.name === players[playerId]?.playerId));
  const awardDate = (achievement, playerId) => achievement.character.find(award => award.name === players[playerId]?.playerId)?.date || '';
  const mentions = (text, character) => (aliases[character.id] || [character.characterName])
    .some(name => text.toLocaleLowerCase('pt-BR').includes(name.toLocaleLowerCase('pt-BR')));
  const logMembers = log => characters.filter(character => mentions(log.esquad, character));
  const relatedTo = (log, character) => mentions(log.esquad + ' ' + log.descrition, character);
  return { players, achievements, timelines, characters, aliases, playerAwards, awardDate, logMembers, relatedTo };
}

export function validateCampaign(data) {
  const errors = [];
  if (!Array.isArray(data.players) || !Array.isArray(data.achievements) || !Array.isArray(data.timelines)) return ['Catálogos obrigatórios ausentes.'];
  const names = new Set(data.players.map(player => player.playerId));
  if (names.size !== data.players.length) errors.push('Jogadores repetidos.');
  const ids = new Set();
  for (const achievement of data.achievements) {
    if (!achievement.id || ids.has(achievement.id)) errors.push('Identificador de conquista ausente ou repetido: ' + achievement.id);
    ids.add(achievement.id);
    if (!achievement.medal || !achievement.category || !achievement.rank) errors.push('Medalha incompleta: ' + achievement.id);
    const awardedNames = new Set();
    for (const award of achievement.character) {
      if (!names.has(award.name)) errors.push('Jogador desconhecido: ' + award.name);
      if (awardedNames.has(award.name)) errors.push('Concessão duplicada: ' + achievement.id + '/' + award.name);
      awardedNames.add(award.name);
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(award.date)) { errors.push('Data inválida: ' + achievement.id); continue; }
      const [day, month, year] = award.date.split('/').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) errors.push('Data inexistente: ' + achievement.id);
    }
  }
  for (const log of data.timelines) if (!log.mission || !log.location || !log.dateTime || typeof log.descrition !== 'string') errors.push('Registro de missão incompleto.');
  return errors;
}
