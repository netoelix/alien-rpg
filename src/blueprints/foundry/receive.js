import { importFoundryPackage, prepareFoundryImport } from './importer.js';

const MAX_FILE = 128 * 1024 * 1024;
const PNG_PREFIX = 'data:image/png;base64,';

export function parseFoundryArchive(text) {
  if (typeof text !== 'string' || text.length > MAX_FILE)
    throw Error('Arquivo excede o limite de 128 MB.');
  const bundle = JSON.parse(text);
  if (
    bundle?.stage !== 'image-package' ||
    !Array.isArray(bundle.images) ||
    !Array.isArray(bundle.scenes) ||
    bundle.scenes.length > 200 ||
    bundle.images.length !== bundle.scenes.length
  )
    throw Error('Pacote de imagens inválido.');
  const images = new Map();
  for (const image of bundle.images) {
    if (!image || images.has(image.sceneKey)) throw Error('Imagem duplicada ou inválida.');
    const scene = bundle.scenes.find((s) => s.key === image.sceneKey);
    if (
      !scene ||
      !Number.isInteger(image.width) ||
      !Number.isInteger(image.height) ||
      image.width <= 0 ||
      image.height <= 0 ||
      image.width > 8192 ||
      image.height > 8192 ||
      image.width * image.height > 32_000_000 ||
      image.width !== scene.width ||
      image.height !== scene.height
    )
      throw Error('Dimensões da imagem não correspondem ao pavimento.');
    if (typeof image.data !== 'string' || !image.data.startsWith(PNG_PREFIX))
      throw Error('A imagem precisa ser um PNG incorporado.');
    const encoded = image.data.slice(PNG_PREFIX.length);
    if (encoded.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw Error('PNG inválido.');
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    if (
      bytes.length < 33 ||
      signature.some((v, i) => bytes[i] !== v) ||
      String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR'
    )
      throw Error('Cabeçalho PNG inválido.');
    const header = new DataView(bytes.buffer);
    if (
      header.getUint32(8) !== 13 ||
      header.getUint32(16) !== image.width ||
      header.getUint32(20) !== image.height
    )
      throw Error('Resolução real do PNG não corresponde ao pavimento.');
    // File names and paths from the package are deliberately not used for upload.
    images.set(image.sceneKey, {
      blob: new Blob([bytes], { type: 'image/png' }),
      width: image.width,
      height: image.height,
    });
  }
  const plan = prepareFoundryImport(
    bundle,
    new Map([...images.keys()].map((key, i) => [key, `floor-${i + 1}.png`])),
  );
  return {
    bundle,
    images,
    summary: {
      scenes: plan.length,
      walls: plan.reduce((n, s) => n + s.walls.length, 0),
      accesses: bundle.accesses.length,
    },
  };
}

export async function receiveFoundryArchive(text, runtime, onProgress = () => {}) {
  if (!runtime.isGM || runtime.generation !== 14)
    throw Error('Importação exige um mestre no Foundry 14.');
  const { bundle, images } = parseFoundryArchive(text);
  if (bundle.accesses.length && !runtime.accessEnabled)
    throw Error('Ative os acessos da Suíte MÃE.');
  // Decode every image before uploading anything, so truncated/corrupt PNGs
  // cannot leave a partly imported scene set or a partly uploaded package.
  for (const image of images.values()) {
    const size = await runtime.decodeImage(image.blob);
    if (size.width !== image.width || size.height !== image.height)
      throw Error('PNG com dimensões inesperadas.');
  }
  let directory;
  try {
    directory = await runtime.createImportDirectory();
    const paths = new Map();
    for (const [key, image] of images) {
      const path = await runtime.uploadImage(directory, `floor-${paths.size + 1}.png`, image.blob);
      if (typeof path !== 'string' || !path.trim())
        throw Error('O Foundry não confirmou o envio da imagem.');
      paths.set(key, path);
      onProgress({ phase: 'upload', completed: paths.size, total: images.size });
    }
    const scenes = await importFoundryPackage(bundle, paths, runtime);
    return { scenes, directory };
  } catch (cause) {
    throw new Error(
      directory
        ? `${cause.message} A pasta desta tentativa é ${directory}; ela pode conter imagens para limpeza manual.`
        : cause.message,
      { cause },
    );
  }
}
