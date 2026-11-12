import { buildFoundryPackage } from './package.js';
import { prepareFoundryImport } from './importer.js';
import { parseProject } from '../model.js';

// A single JSON file embeds PNGs; no archive dependency or external asset URLs.
export async function createFoundryArchive(
  input,
  { pixelsPerMeter = 100, renderFloor, onProgress = () => {} } = {},
) {
  const project = parseProject(JSON.stringify(input));
  const bundle = buildFoundryPackage(project, { pixelsPerMeter });
  if (bundle.scenes.length > 200)
    throw Error('Limite de 200 cenas, incluindo redes de ventilação.');
  const paths = new Map(bundle.scenes.map((s) => [s.key, `images/${s.key}.png`]));
  prepareFoundryImport(bundle, paths);
  for (const scene of bundle.scenes) {
    if (!Number.isInteger(scene.width) || !Number.isInteger(scene.height))
      throw Error('Escolha uma escala que produza dimensões inteiras em pixels.');
    if (scene.width > 8192 || scene.height > 8192 || scene.width * scene.height > 32_000_000)
      throw Error('Imagem muito grande. Reduza os pixels por metro.');
  }
  const images = [];
  for (const scene of bundle.scenes) {
    // Layer visibility is editor state. Export all layers at full opacity,
    // while individually hidden objects remain hidden in image and geometry.
    const snapshot = {
      ...project,
      activeFloor: scene.sourceFloorId,
      foundrySceneKind: scene.kind,
      elements: structuredClone(scene.elements),
      layers: project.layers.map((l) => ({ ...l, visible: true, opacity: 1 })),
    };
    const data = await renderFloor(snapshot, scene.width, scene.height);
    if (typeof data !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(data))
      throw Error('Não foi possível gerar o PNG de ' + scene.name);
    images.push({
      sceneKey: scene.key,
      path: paths.get(scene.key),
      width: scene.width,
      height: scene.height,
      data,
    });
    onProgress({ completed: images.length, total: bundle.scenes.length, name: scene.name });
  }
  const result = {
    ...bundle,
    stage: 'image-package',
    scenes: bundle.scenes.map(({ elements, ...scene }) => scene),
    images,
  };
  if (JSON.stringify(result).length > 128 * 1024 * 1024)
    throw Error('Pacote excede 128 MB. Reduza a resolução.');
  return result;
}
