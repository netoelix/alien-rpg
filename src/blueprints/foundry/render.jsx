import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Drawing, palettes } from '../Drawing.jsx';
import { VentilationNetwork } from '../Ventilation.jsx';
import { downloadBlob, prepareVentilationExport, projectFilename } from '../export.js';
import { createFoundryArchive } from './archive.js';

export async function downloadFoundryArchive(project, options = {}) {
  const archive = await createFoundryArchive(project, { ...options, renderFloor: renderFloorPNG });
  downloadBlob(
    new Blob([JSON.stringify(archive)], { type: 'application/json' }),
    projectFilename(archive.name) + '.alien-foundry',
  );
}

export function renderFloorSVG(project, width, height) {
  return renderToStaticMarkup(
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width,
        height,
        viewBox: `0 0 ${project.width} ${project.height}`,
        overflow: 'hidden',
      },
      project.foundrySceneKind === 'ventilation'
        ? createElement(
            'g',
            { stroke: palettes[project.theme].accent },
            createElement('rect', {
              width: project.width,
              height: project.height,
              fill: palettes[project.theme].background,
              stroke: 'none',
            }),
            createElement(VentilationNetwork, {
              elements: project.elements,
              floor: palettes[project.theme].floor,
            }),
          )
        : createElement(Drawing, { project }),
    ),
  );
}

export async function renderFloorPNG(project, width, height) {
  const doc = new DOMParser().parseFromString(
    renderFloorSVG(project, width, height),
    'image/svg+xml',
  );
  const svg = doc.documentElement;
  svg.querySelectorAll('[data-editor-only]').forEach((node) => node.remove());
  prepareVentilationExport(
    svg,
    project.layers.map((l) => l.id),
    false,
  );
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }),
  );
  const canvas = document.createElement('canvas');
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw Error('Não foi possível criar a imagem.');
    context.drawImage(image, 0, 0);
    const result = canvas.toDataURL('image/png');
    if (result === 'data:,') throw Error('Imagem muito grande para este navegador.');
    return result;
  } finally {
    URL.revokeObjectURL(url);
    canvas.width = canvas.height = 0;
  }
}
