// Called inside Foundry only. Importing this module has no side effects.
export function createFoundryRuntime({ game, CONFIG, foundry, Scene }, browser = globalThis) {
  const picker = CONFIG.ux.FilePicker;
  return {
    isGM: !!game.user?.isGM,
    generation: game.release.generation,
    accessEnabled:
      !!game.modules.get('alien-suite-mae')?.active &&
      !!game.settings.get('alien-suite-mae', 'feature.alien-acessos') &&
      !game.modules.get('alien-acessos')?.active,
    createScene: (data) => Scene.create(data),
    async decodeImage(blob) {
      const bitmap = await browser.createImageBitmap(blob);
      try {
        return { width: bitmap.width, height: bitmap.height };
      } finally {
        bitmap.close();
      }
    },
    async createImportDirectory() {
      const directory = `worlds/${game.world.id}/blueprint-${foundry.utils.randomID()}`;
      await picker.createDirectory('data', directory);
      return directory;
    },
    async uploadImage(directory, name, blob) {
      const result = await picker.upload(
        'data',
        directory,
        new browser.File([blob], name, { type: 'image/png' }),
        {},
        { notify: false },
      );
      if (!result?.path) throw Error('Falha ao enviar ' + name);
      return result.path;
    },
  };
}
