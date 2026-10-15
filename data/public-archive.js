import { normalizeArchive, validateArchive } from './archive-schema.js';

// Lista explícita: campos privados e extensões futuras não são publicados por acidente.
const pick = (value, fields) =>
  Object.fromEntries(
    fields
      .split(' ')
      .filter((key) => value[key] !== undefined)
      .map((key) => [key, structuredClone(value[key])]),
  );
export function publicArchive(source) {
  const errors = validateArchive(source);
  if (errors.length) throw new Error(errors.join('\n'));
  const archive = normalizeArchive(source);
  return {
    version: 2,
    playerProfiles: archive.playerProfiles.map((p) => pick(p, 'id name biography')),
    achievements: archive.achievements.map((a) =>
      pick(a, 'id name description medal category rank'),
    ),
    campaigns: archive.campaigns.map((c) => ({
      ...pick(c, 'id title status author medalArtist unit division period summary description'),
      players: c.players.map((p) => ({
        ...pick(p, 'id playerId profileId mascot'),
        characters: p.characters.map((ch) => ({
          ...pick(ch, 'id characterName codname profession about images aliases lifeStatus'),
          ...(ch.journal
            ? { journal: ch.journal.map((j) => pick(j, 'id title dateTime text')) }
            : {}),
        })),
      })),
      achievements: c.achievements.map((a) => ({
        id: a.id,
        character: a.character.map((g) => pick(g, 'name date characterIds')),
      })),
      timelines: c.timelines.map((m) => ({
        ...pick(m, 'id mission location systemId dateTime esquad'),
        logs: m.logs.map((l) => pick(l, 'id title session dateTime esquad descrition')),
      })),
      ...(c.navigation
        ? {
            navigation: {
              systems: (c.navigation.systems || []).map((s) =>
                pick(s, 'id name x y installations'),
              ),
              territories: (c.navigation.territories || []).map((t) => ({
                ...pick(t, 'id name kind color shape x y radiusLy'),
                ...(t.points ? { points: t.points.map((p) => pick(p, 'x y')) } : {}),
                ...(t.islands
                  ? { islands: t.islands.map((ring) => ring.map((p) => pick(p, 'x y'))) }
                  : {}),
              })),
              hiddenTerritories: c.navigation.hiddenTerritories || [],
              route: (c.navigation.route || []).map((s) =>
                pick(s, 'id systemId arrival departure missionIndex note'),
              ),
            },
          }
        : {}),
    })),
  };
}

export function archiveAssets(archive) {
  return [
    ...new Set([
      ...archive.campaigns.flatMap((c) =>
        c.players.flatMap((p) => p.characters.map((ch) => ch.images)),
      ),
      ...archive.achievements.map((a) => a.medal),
    ]),
  ];
}
