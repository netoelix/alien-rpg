export function createCampaignModel(data) {
  const { players, achievements, timelines } = data;
  const characters = players
    .flatMap((player, playerId) =>
      player.characters.map((character) => ({ ...character, playerId })),
    )
    .map((character, index) => ({ ...character, id: character.id ?? String(index) }));
  const playerAwards = (playerId) =>
    achievements.filter((achievement) =>
      achievement.character.some((award) => award.name === players[playerId]?.playerId),
    );
  const awardDate = (achievement, playerId) =>
    achievement.character.find((award) => award.name === players[playerId]?.playerId)?.date || '';
  const mentions = (text, character) =>
    (character.aliases?.length ? character.aliases : [character.characterName]).some((name) =>
      text.toLocaleLowerCase('pt-BR').includes(name.toLocaleLowerCase('pt-BR')),
    );
  const logMembers = (log) => characters.filter((character) => mentions(log.esquad, character));
  const relatedTo = (log, character) => mentions(log.esquad + ' ' + log.descrition, character);
  return {
    players,
    achievements,
    timelines,
    characters,
    playerAwards,
    awardDate,
    logMembers,
    relatedTo,
  };
}

export function validateCampaign(data) {
  const errors = [];
  if (
    !data ||
    !Array.isArray(data.players) ||
    !Array.isArray(data.achievements) ||
    !Array.isArray(data.timelines)
  )
    return ['Catálogos obrigatórios ausentes.'];
  const text = (value) => typeof value === 'string';
  const localResource = (value) => text(value) && /^assets\/[^/\\]+\.(png|jpg|svg)$/i.test(value);
  for (const player of data.players) {
    if (
      !player ||
      !text(player.playerId) ||
      !player.playerId.trim() ||
      !Array.isArray(player.characters)
    )
      return ['Jogador incompleto.'];
    if (player.mascot !== undefined && typeof player.mascot !== 'boolean')
      return ['Tipo de jogador inválido.'];
    for (const character of player.characters) {
      if (
        !character ||
        !text(character.characterName) ||
        !character.characterName.trim() ||
        !text(character.about) ||
        !text(character.codname) ||
        !text(character.profession) ||
        !localResource(character.images) ||
        (character.aliases !== undefined &&
          (!Array.isArray(character.aliases) ||
            character.aliases.some((alias) => !text(alias) || !alias.trim())))
      )
        return ['Personagem incompleto ou retrato inválido.'];
    }
  }
  for (const achievement of data.achievements) {
    if (
      !achievement ||
      !text(achievement.id) ||
      !text(achievement.name) ||
      !text(achievement.description) ||
      !localResource(achievement.medal) ||
      !text(achievement.category) ||
      !text(achievement.rank) ||
      !Array.isArray(achievement.character) ||
      achievement.character.some((award) => !award || !text(award.name) || !text(award.date))
    )
      return ['Conquista incompleta ou concessão inválida.'];
  }
  if (
    data.timelines.some(
      (log) =>
        !log ||
        ['mission', 'location', 'dateTime', 'esquad', 'descrition'].some(
          (field) => !text(log[field]),
        ),
    )
  )
    return ['Registro de missão incompleto.'];
  const names = new Set(data.players.map((player) => player.playerId));
  if (names.size !== data.players.length) errors.push('Jogadores repetidos.');
  const ids = new Set();
  for (const achievement of data.achievements) {
    if (!achievement.id || ids.has(achievement.id))
      errors.push('Identificador de conquista ausente ou repetido: ' + achievement.id);
    ids.add(achievement.id);
    if (!achievement.medal || !achievement.category || !achievement.rank)
      errors.push('Medalha incompleta: ' + achievement.id);
    const awardedNames = new Set();
    for (const award of achievement.character) {
      if (!names.has(award.name)) errors.push('Jogador desconhecido: ' + award.name);
      if (awardedNames.has(award.name))
        errors.push('Concessão duplicada: ' + achievement.id + '/' + award.name);
      awardedNames.add(award.name);
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(award.date)) {
        errors.push('Data inválida: ' + achievement.id);
        continue;
      }
      const [day, month, year] = award.date.split('/').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
      )
        errors.push('Data inexistente: ' + achievement.id);
    }
  }
  for (const log of data.timelines)
    if (!log.mission || !log.location || !log.dateTime || typeof log.descrition !== 'string')
      errors.push('Registro de missão incompleto.');
  return errors;
}
