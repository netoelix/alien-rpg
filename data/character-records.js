export function validateCharacterRecords(campaign) {
  const errors = [];
  for (const player of campaign.players || []) {
    for (const character of player.characters || []) {
      if (character.journal === undefined) continue;
      if (!Array.isArray(character.journal)) {
        errors.push('Diário deve ser uma lista de entradas.');
        continue;
      }
      const ids = new Set();
      for (const entry of character.journal) {
        if (
          !entry ||
          typeof entry.id !== 'string' ||
          !entry.id ||
          ids.has(entry.id) ||
          ['title', 'dateTime', 'text'].some(
            (field) => typeof entry[field] !== 'string' || !entry[field].trim(),
          )
        )
          errors.push('Entrada de diário incompleta ou repetida.');
        ids.add(entry?.id);
      }
    }
  }
  for (const achievement of campaign.achievements || []) {
    for (const grant of achievement?.character || []) {
      if (grant.characterIds === undefined) continue; // Concessões antigas continuam válidas.
      const owner = campaign.players.find((player) => player.playerId === grant.name);
      if (
        !Array.isArray(grant.characterIds) ||
        !grant.characterIds.length ||
        new Set(grant.characterIds).size !== grant.characterIds.length ||
        grant.characterIds.some((id) => !owner?.characters.some((character) => character.id === id))
      )
        errors.push('Selecione personagens deste jogador para a conquista.');
    }
  }
  return errors;
}

export function characterAchievements(campaign, definitions, characterId) {
  return definitions.flatMap((definition) => {
    const grant = campaign.achievements
      .find((item) => item.id === definition.id)
      ?.character.find((item) => item.characterIds?.includes(characterId));
    return grant ? [{ ...definition, date: grant.date }] : [];
  });
}
