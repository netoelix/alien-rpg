import { FOUNDRY_PACKAGE_FORMAT, resolveAccessFlags } from './package.js';

// Foundry 14 document schema. Image paths must already exist in Foundry storage.
// The runtime is injected so importing this file never touches a live world.
export function prepareFoundryImport(bundle, imagePaths) {
  if (bundle?.format !== FOUNDRY_PACKAGE_FORMAT || bundle.version !== 1)
    throw Error('Pacote incompatível.');
  if (!Array.isArray(bundle.scenes) || !bundle.scenes.length || !Array.isArray(bundle.accesses))
    throw Error('Pacote sem cenas ou acessos válidos.');
  const keys = new Set();
  const scenes = bundle.scenes.map((scene) => {
    if (!scene.key || keys.has(scene.key)) throw Error('Pavimento duplicado.');
    keys.add(scene.key);
    if (scene.geometry?.ready !== true || !Array.isArray(scene.geometry.barriers))
      throw Error(
        'Não é possível exportar ' +
          scene.name +
          ': ' +
          (scene.geometry?.warnings?.join(' ') || 'geometria incompleta.'),
      );
    if (
      ![scene.width, scene.height, scene.grid?.size, scene.grid?.distance].every(
        (v) => Number.isFinite(v) && v > 0,
      )
    )
      throw Error('Dimensões inválidas: ' + scene.name);
    if (Math.round(scene.grid.size) < 20)
      throw Error('A grade do Foundry exige pelo menos 20 pixels.');
    const image = imagePaths.get(scene.key);
    if (typeof image !== 'string' || !image.trim()) throw Error('Imagem ausente: ' + scene.name);
    const walls = scene.geometry.barriers
      .map((barrier) => {
        if (
          !Array.isArray(barrier.coordinates) ||
          barrier.coordinates.length !== 4 ||
          !barrier.coordinates.every(Number.isFinite)
        )
          throw Error('Coordenadas de parede inválidas.');
        if (
          !['wall', 'door', 'window'].includes(barrier.kind) ||
          !barrier.blocks ||
          !['movement', 'sight', 'light', 'sound'].every(
            (k) => typeof barrier.blocks[k] === 'boolean',
          )
        )
          throw Error('Barreira inválida.');
        const c = barrier.coordinates.map(Math.round);
        // Quantization contracts this edge to one vertex. Adjacent edges use the
        // same rounding, so removing the zero-length wall cannot introduce a gap.
        // Do not silently remove interactive openings that have become too small.
        if (c[0] === c[2] && c[1] === c[3]) {
          if (barrier.kind === 'wall') return null;
          throw Error(
            'Abertura pequena demais para esta escala em ' + scene.name + '. Aumente a resolução.',
          );
        }
        return {
          c,
          move: barrier.blocks.movement ? 20 : 0,
          sight: barrier.blocks.sight ? 20 : 0,
          light: barrier.blocks.light ? 20 : 0,
          sound: barrier.blocks.sound ? 20 : 0,
          dir: 0,
          door: barrier.kind === 'door' ? 1 : 0,
          ds: 0,
          ...(barrier.kind === 'door' && typeof barrier.doorGroup === 'string'
            ? { flags: { 'alien-blueprint-importer': { doorGroup: barrier.doorGroup } } }
            : {}),
        };
      })
      .filter(Boolean);
    return {
      key: scene.key,
      image,
      walls,
      data: {
        name: scene.name,
        width: Math.round(scene.width),
        height: Math.round(scene.height),
        padding: 0,
        active: false,
        navigation: false,
        grid: {
          type: 1,
          size: Math.round(scene.grid.size),
          distance: scene.grid.distance,
          units: 'm',
        },
      },
    };
  });
  for (const access of bundle.accesses) {
    const scene = bundle.scenes.find((s) => s.key === access.sceneKey);
    if (
      !scene ||
      !Array.isArray(access.polygon) ||
      access.polygon.length < 3 ||
      access.polygon.some(
        (p) =>
          !Number.isFinite(p.x) ||
          !Number.isFinite(p.y) ||
          p.x < 0 ||
          p.y < 0 ||
          p.x > scene.width ||
          p.y > scene.height,
      )
    )
      throw Error('Região inválida: ' + access.key);
    if (access.kind === 'vent' && scene.kind !== 'ventilation')
      throw Error('O acesso de ventilação exige uma cena exclusiva de dutos.');
    if (!Array.isArray(access.targets) || !access.targets.length)
      throw Error('Acesso sem destino.');
  }
  // Validate all links before the first write, using disposable validation UUIDs.
  resolveAccessFlags(
    bundle,
    new Map(bundle.accesses.map((a, i) => [a.key, `Scene.validation.Region.region${i}`])),
  );
  return scenes;
}

export async function importFoundryPackage(bundle, imagePaths, runtime) {
  if (!runtime.isGM || runtime.generation !== 14)
    throw Error('Importação exige um mestre no Foundry 14.');
  if (bundle.accesses?.length && !runtime.accessEnabled)
    throw Error('Ative os acessos da Suíte MÃE.');
  const plan = prepareFoundryImport(bundle, imagePaths);
  const created = [],
    regions = new Map();
  try {
    for (const item of plan) {
      // Supplying the level during Scene creation prevents Foundry 14 from
      // inserting its own empty default level (localized as "Andar").
      const scene = await runtime.createScene({
        ...item.data,
        levels: [{ name: item.data.name, background: { src: item.image } }],
      });
      created.push(scene);
      const levels = scene.levels?.contents;
      if (levels?.length !== 1 || !levels[0]?.id)
        throw Error('O Foundry não retornou um único nível para a cena.');
      const level = levels[0];
      await scene.update({ initialLevel: level.id });
      await scene.createEmbeddedDocuments(
        'Wall',
        item.walls.map((w) => ({ ...w, levels: [level.id] })),
      );
      for (const access of bundle.accesses.filter((a) => a.sceneKey === item.key)) {
        const [region] = await scene.createEmbeddedDocuments('Region', [
          {
            name: access.name,
            levels: [level.id],
            color: '#8ee69e',
            shapes: [
              { type: 'polygon', points: access.polygon.flatMap((p) => [p.x, p.y]), hole: false },
            ],
            ownership: { default: 2 },
            visibility: 3,
            flags: { 'alien-suite-mae': { access: { enabled: false, auto: false, targets: [] } } },
          },
        ]);
        if (!region?.uuid) throw Error('O Foundry não retornou a região criada.');
        regions.set(access.key, region);
      }
    }
    const flags = resolveAccessFlags(
      bundle,
      new Map([...regions].map(([key, r]) => [key, r.uuid])),
    );
    const byUUID = new Map([...regions.values()].map((r) => [r.uuid, r]));
    for (const entry of flags) await byUUID.get(entry.uuid).update({ flags: entry.flags });
    return created;
  } catch (cause) {
    // Only documents returned by this operation are eligible for rollback.
    const failures = [];
    for (const scene of [...created].reverse()) {
      try {
        await scene.delete();
      } catch {
        failures.push(scene.id);
      }
    }
    throw new Error(
      failures.length
        ? 'Importação interrompida. Remova as cenas incompletas: ' + failures.join(', ')
        : 'Importação interrompida; cenas criadas foram removidas.',
      { cause },
    );
  }
}
