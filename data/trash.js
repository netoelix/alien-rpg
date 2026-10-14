import { normalizeArchive, validateArchive } from './archive-schema.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const protectedKeys = new Set(['__proto__', 'constructor', 'prototype']);

// Guarda somente as diferenças. IDs localizam os registros mesmo se outra
// campanha ou outro personagem tiver sido inserido desde a exclusão.
function differences(before, after, path = []) {
  if (same(before, after)) return [];
  if (Array.isArray(before) && Array.isArray(after)) {
    const key = ['id', 'mission', 'name'].find((field) =>
      [before, after].every(
        (rows) =>
          rows.every((row) => object(row) && typeof row[field] === 'string') &&
          new Set(rows.map((row) => row[field])).size === rows.length,
      ),
    );
    if (key) {
      const values = new Set([...before, ...after].map((row) => row[key]));
      return [...values].flatMap((value) => {
        const index = before.findIndex((row) => row[key] === value);
        return differences(
          before[index],
          after.find((row) => row[key] === value),
          [...path, { key, value, index }],
        );
      });
    }
  }
  if (object(before) && object(after)) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((key) =>
      differences(before[key], after[key], [...path, key]),
    );
  }
  return [{ path, hadBefore: before !== undefined, hadAfter: after !== undefined, before, after }];
}

function assertValid(archive) {
  const errors = validateArchive(archive);
  if (errors.length) throw new Error(errors.join('\n'));
}

export function moveToTrash(archive, request) {
  const before = normalizeArchive(archive);
  const next = structuredClone(before);
  const campaign = next.campaigns.find((item) => item.id === request.campaignId);
  const kind = request.kind;
  let label;
  if (kind === 'campaign') {
    if (!campaign) throw new Error('Campanha não encontrada.');
    if (next.campaigns.length === 1)
      throw new Error('Mantenha ao menos uma campanha. Crie outra antes de remover esta.');
    label = campaign.title;
    next.campaigns = next.campaigns.filter((item) => item.id !== campaign.id);
  } else if (kind === 'profile') {
    const profile = next.playerProfiles.find((item) => item.id === request.id);
    if (!profile) throw new Error('Cadastro não encontrado.');
    if (
      next.campaigns.some((item) => item.players.some((player) => player.profileId === profile.id))
    )
      throw new Error(
        'Remova primeiro as participações deste jogador nas campanhas. O cadastro global ainda está em uso.',
      );
    label = profile.name;
    next.playerProfiles = next.playerProfiles.filter((item) => item.id !== profile.id);
  } else if (kind === 'achievements') {
    const definition = next.achievements.find((item) => item.id === request.id);
    if (!definition) throw new Error('Conquista não encontrada.');
    label = definition.name;
    next.achievements = next.achievements.filter((item) => item.id !== definition.id);
    for (const entry of next.campaigns)
      entry.achievements = entry.achievements.filter((item) => item.id !== definition.id);
  } else {
    if (!campaign) throw new Error('Campanha não encontrada.');
    if (kind === 'players') {
      const player = campaign.players.find((item) => item.id === request.id);
      if (!player) throw new Error('Participação não encontrada.');
      label = player.playerId;
      campaign.players = campaign.players.filter((item) => item.id !== player.id);
      for (const award of campaign.achievements)
        award.character = award.character.filter((grant) => grant.name !== player.playerId);
    } else if (kind === 'characters' || kind === 'journal') {
      const owner = campaign.players.find((player) =>
        player.characters.some((item) => item.id === request.id),
      );
      const character = owner?.characters.find((item) => item.id === request.id);
      if (!character) throw new Error('Personagem não encontrado.');
      if (kind === 'journal') {
        const entry = character.journal?.find((item) => item.id === request.entryId);
        if (!entry) throw new Error('Entrada de diário não encontrada.');
        label = `${entry.title} · ${character.characterName}`;
        character.journal = character.journal.filter((item) => item.id !== entry.id);
      } else {
        label = character.characterName;
        owner.characters = owner.characters.filter((item) => item.id !== character.id);
        for (const award of campaign.achievements)
          for (const grant of award.character) {
            if (!grant.characterIds?.includes(character.id)) continue;
            grant.characterIds = grant.characterIds.filter((id) => id !== character.id);
            // O feito do jogador permanece, mesmo sem personagens ativos associados.
            if (!grant.characterIds.length) delete grant.characterIds;
          }
      }
    } else if (kind === 'timelines' || kind === 'logs') {
      const index = request.missionIndex;
      const mission = Number.isInteger(index) ? campaign.timelines[index] : null;
      if (!mission) throw new Error('Missão não encontrada.');
      if (kind === 'logs') {
        const record = mission.logs.find((item) => item.id === request.id);
        if (!record) throw new Error('Registro não encontrado.');
        label = `${record.title} · ${mission.mission}`;
        mission.logs = mission.logs.filter((item) => item.id !== record.id);
      } else {
        label = mission.mission;
        campaign.timelines.splice(index, 1);
        if (campaign.navigation?.route)
          campaign.navigation.route = campaign.navigation.route
            .filter((stop) => stop.missionIndex !== index)
            .map((stop) =>
              Number.isInteger(stop.missionIndex) && stop.missionIndex > index
                ? { ...stop, missionIndex: stop.missionIndex - 1 }
                : stop,
            );
      }
    } else throw new Error('Tipo de exclusão desconhecido.');
  }
  assertValid(next);
  const patches = ['campaigns', 'playerProfiles', 'achievements'].flatMap((key) =>
    differences(before[key], next[key], [key]),
  );
  next.trash = [
    ...(before.trash || []),
    {
      id: crypto.randomUUID(),
      label,
      kind,
      deletedAt: new Date().toISOString(),
      patches,
    },
  ];
  return next;
}

export function restoreFromTrash(archive, id) {
  const next = normalizeArchive(archive);
  const entry = next.trash?.find((item) => item.id === id);
  if (!entry) throw new Error('Item da lixeira não encontrado.');
  for (const patch of [...entry.patches].reverse()) {
    const path = patch.path;
    if (!Array.isArray(path) || !['campaigns', 'playerProfiles', 'achievements'].includes(path[0]))
      throw new Error('Registro da lixeira inválido.');
    let parent = next;
    for (const part of path.slice(0, -1)) {
      if (typeof part === 'string') {
        if (protectedKeys.has(part)) throw new Error('Caminho inválido.');
        parent = parent?.[part];
      } else
        parent = Array.isArray(parent) ? parent.find((row) => row[part.key] === part.value) : null;
      if (!parent) throw new Error('Restaure primeiro o registro ao qual este item pertence.');
    }
    const last = path.at(-1);
    if (typeof last === 'string' && protectedKeys.has(last)) throw new Error('Caminho inválido.');
    const arrayItem = object(last);
    if (arrayItem && !Array.isArray(parent)) throw new Error('Destino da restauração inválido.');
    const key = arrayItem ? parent.findIndex((row) => row[last.key] === last.value) : last;
    const current = arrayItem && key < 0 ? undefined : parent[key];
    if (!same(current, patch.hadAfter ? patch.after : undefined))
      throw new Error(
        'Este registro ou seus vínculos mudaram após a exclusão. A restauração foi cancelada para preservar as alterações. Exporte o backup para recuperar o conteúdo com segurança.',
      );
    if (arrayItem) {
      if (key >= 0) {
        if (patch.hadBefore) parent[key] = structuredClone(patch.before);
        else parent.splice(key, 1);
      } else if (patch.hadBefore)
        parent.splice(
          Math.max(0, Math.min(last.index, parent.length)),
          0,
          structuredClone(patch.before),
        );
    } else if (patch.hadBefore) parent[key] = structuredClone(patch.before);
    else delete parent[key];
  }
  next.trash = next.trash.filter((item) => item.id !== id);
  assertValid(next);
  return next;
}
