import { parseFoundryArchive, receiveFoundryArchive } from './receive.js';
import { createFoundryRuntime } from './runtime.js';
import { syncDoorGroup } from './door-sync.js';

const ID = 'alien-blueprint-importer';
let busy = false;
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

async function openImporter() {
  if (busy) return ui.notifications.warn('Uma importação já está em andamento.');
  if (!game.user.isGM) return ui.notifications.warn('Somente o mestre pode importar mapas.');
  busy = true;
  try {
    const file = await foundry.applications.api.DialogV2.prompt({
      window: { title: 'Importar mapa Blueprint' },
      content:
        '<label>Arquivo .alien-foundry<input type="file" name="blueprint" accept=".alien-foundry,application/json" required></label>',
      ok: {
        label: 'Verificar arquivo',
        callback: (_event, button) => button.form.querySelector('input[type=file]').files[0],
      },
    });
    if (!file) return;
    if (file.size > 128 * 1024 * 1024) throw Error('Arquivo excede o limite de 128 MB.');
    const text = await file.text();
    const { bundle, summary } = parseFoundryArchive(text);
    const accepted = await foundry.applications.api.DialogV2.confirm({
      window: { title: 'Conferir importação' },
      yes: { label: 'Criar cenas' },
      no: { label: 'Cancelar' },
      content: `<p><strong>${escape(bundle.name || 'Mapa')}</strong></p>
        <p>${summary.scenes} cena(s), ${summary.walls} barreira(s), ${summary.accesses} acesso(s).</p>
        <p>Serão criadas cenas novas, fora da navegação. Revise a chegada dos tokens antes de liberar aos jogadores.</p>
        <p>Mantenha este módulo ativo para sincronizar portas curvas. Redes de ventilação são importadas em cenas exclusivas.</p>
        <p>Importador experimental: ainda requer validação em jogo.</p>`,
    });
    if (!accepted) return;
    const result = await receiveFoundryArchive(
      text,
      createFoundryRuntime({ game, CONFIG, foundry, Scene }),
    );
    ui.notifications.info(
      `${result.scenes.length} cena(s) importada(s). Revise-as na lista de cenas.`,
    );
    return result;
  } catch (error) {
    console.error('Blueprint import:', error);
    ui.notifications.error(error.message, { permanent: true });
  } finally {
    busy = false;
  }
}

Hooks.once('init', () => {
  Hooks.on('getSceneControlButtons', (controls) => {
    if (!game.user.isGM || !controls.tokens?.tools) return;
    controls.tokens.tools.blueprintImport = {
      name: 'blueprintImport',
      title: 'Importar mapa Blueprint',
      icon: 'fa-solid fa-file-import',
      order: Object.keys(controls.tokens.tools).length,
      button: true,
      onChange: () => openImporter(),
    };
  });
  // The Scenes tab also works before the world has an active scene/canvas.
  Hooks.on('renderSceneDirectory', (_app, html) => {
    if (!game.user.isGM || html.querySelector('[data-blueprint-import]')) return;
    const header = html.querySelector('.header-actions');
    if (!header) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.blueprintImport = '';
    button.title = 'Importar mapa Blueprint (.alien-foundry)';
    button.setAttribute('aria-label', button.title);
    button.innerHTML = '<i class="fa-solid fa-file-import" aria-hidden="true"></i> Blueprint';
    button.addEventListener('click', () => openImporter());
    header.append(button);
  });
  Hooks.on('updateWall', (wall, change, options) => {
    syncDoorGroup(wall, change, options, game).catch((error) => {
      console.error('Blueprint door synchronization:', error);
      ui.notifications.error('Não foi possível sincronizar os trechos desta porta.');
    });
  });
  class ImportMenu extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {
      id: 'blueprint-import-menu',
      window: { title: 'Importar Blueprint' },
      position: { width: 420 },
    };
    async _renderHTML() {
      const content = document.createElement('div');
      const description = document.createElement('p');
      description.textContent =
        'Importe um arquivo .alien-foundry para criar cenas, paredes e conexões. Versão experimental.';
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Escolher arquivo';
      button.addEventListener('click', () => openImporter());
      content.append(description, button);
      return content;
    }
    _replaceHTML(result, content) {
      content.replaceChildren(result);
    }
  }
  game.settings.registerMenu(ID, 'import', {
    name: 'Importar mapa Blueprint',
    label: 'Importar arquivo',
    icon: 'fas fa-file-import',
    hint: 'Cria cenas novas a partir de um pacote .alien-foundry.',
    restricted: true,
    type: ImportMenu,
  });
  game.modules.get(ID).api = { openImporter };
});
