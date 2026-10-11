// Identidades são vinculadas explicitamente; nomes iguais não unem pessoas automaticamente.
export function normalizePlayerProfiles(archive) {
  const legacyArchive = archive.playerProfiles === undefined;
  archive.playerProfiles ??= [];
  for (const campaign of archive.campaigns) {
    for (const member of campaign.players || []) {
      if (member.mascot) continue;
      const legacyMember = member.profileId === undefined;
      member.profileId ??= member.id;
      if (
        (legacyArchive || legacyMember) &&
        !archive.playerProfiles.some((profile) => profile.id === member.profileId)
      )
        archive.playerProfiles.push({ id: member.profileId, name: member.playerId, biography: '' });
    }
  }
  return archive;
}

export function applyPlayerProfile(archive, campaignId, value, selected) {
  const campaign = archive.campaigns.find((item) => item.id === campaignId);
  const previous = selected === 'new' ? null : campaign.players[Number(selected)];
  const profileId = previous?.profileId || value.profileId || value.id;
  if (
    !value.mascot &&
    campaign.players.some((member) => member !== previous && member.profileId === profileId)
  )
    throw new Error('Este jogador já participa desta campanha. Selecione seu registro existente.');
  if (!value.mascot) {
    let profile = archive.playerProfiles.find((item) => item.id === profileId);
    if (!profile) {
      profile = { id: profileId, name: value.playerId, biography: value.biography || '' };
      archive.playerProfiles.push(profile);
    } else if (previous) {
      profile.name = value.playerId;
      profile.biography = value.biography || '';
    }
    for (const entry of archive.campaigns) {
      for (const member of entry.players.filter((item) => item.profileId === profileId)) {
        const previousName = member.playerId;
        member.playerId = profile.name;
        for (const achievement of entry.achievements)
          for (const grant of achievement.character)
            if (grant.name === previousName) grant.name = profile.name;
      }
    }
    value = { ...value, playerId: profile.name, profileId };
  }
  // Personagens pertencem à participação na campanha, não ao cadastro pessoal.
  const member = {
    ...(previous || { id: value.id, characters: [] }),
    playerId: value.playerId,
    mascot: Boolean(value.mascot),
  };
  if (!value.mascot) member.profileId = profileId;
  else delete member.profileId;
  if (previous) campaign.players[Number(selected)] = member;
  else campaign.players.push(member);
}

export function profileAchievements(archive, profileId) {
  return archive.achievements.flatMap((definition) => {
    const occurrences = archive.campaigns.flatMap((campaign) => {
      const member = campaign.players.find((player) => player.profileId === profileId);
      if (!member) return [];
      const grant = campaign.achievements
        .find((item) => item.id === definition.id)
        ?.character.find((item) => item.name === member.playerId);
      return grant
        ? [{ campaignId: campaign.id, campaignTitle: campaign.title, date: grant.date }]
        : [];
    });
    return occurrences.length ? [{ ...definition, occurrences }] : [];
  });
}
