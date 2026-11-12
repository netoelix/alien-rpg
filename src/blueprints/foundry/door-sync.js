// One active GM owns synchronization, avoiding duplicate updates across clients.
export async function syncDoorGroup(wall, change, options, game) {
  if (options?.blueprintDoorSync || ![0, 1, 2].includes(change.ds)) return;
  const gm = [...game.users]
    .filter((u) => u.active && u.isGM)
    .sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!gm || game.user.id !== gm.id) return;
  const group = wall.flags?.['alien-blueprint-importer']?.doorGroup;
  if (!group || !wall.parent) return;
  const updates = [...wall.parent.walls]
    .filter(
      (w) =>
        w.id !== wall.id &&
        w.door === 1 &&
        w.flags?.['alien-blueprint-importer']?.doorGroup === group &&
        w.ds !== change.ds,
    )
    .map((w) => ({ _id: w.id, ds: change.ds }));
  if (updates.length)
    await wall.parent.updateEmbeddedDocuments('Wall', updates, { blueprintDoorSync: true });
}
