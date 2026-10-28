export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function projectFilename(name) {
  return name.replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 70) || 'planta';
}
export async function exportDrawing(svg, project, { format, transparent, layers, pixels }) {
  if (!layers.length) throw new Error('Selecione pelo menos uma camada para exportar.');
  const copy = svg.cloneNode(true);
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('viewBox', `0 0 ${project.width} ${project.height}`);
  const width =
    project.width >= project.height
      ? pixels
      : Math.round((pixels * project.width) / project.height);
  const height =
    project.height >= project.width
      ? pixels
      : Math.round((pixels * project.height) / project.width);
  copy.setAttribute('overflow', 'hidden');
  copy.setAttribute('width', width);
  copy.setAttribute('height', height);
  copy.removeAttribute('style');
  copy.removeAttribute('class');
  copy.querySelectorAll('[data-editor-only]').forEach((e) => e.remove());
  copy.querySelectorAll('[data-layer]').forEach((e) => {
    if (!layers.includes(e.dataset.layer)) e.remove();
  });
  prepareVentilationExport(copy, layers, transparent);
  const blob = new Blob([new XMLSerializer().serializeToString(copy)], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const floor = project.floors?.find((item) => item.id === project.activeFloor);
  const name = projectFilename(project.name + (floor ? ' - ' + floor.name : ''));
  if (format === 'svg') {
    downloadBlob(blob, name + '.svg');
    return;
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!png) throw new Error('Não foi possível gerar a imagem. Tente uma resolução menor.');
    downloadBlob(png, name + '.png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function prepareVentilationExport(copy, layers, transparent) {
  const ventilationOnly = layers.length === 1 && layers[0] === 'vents';
  copy.querySelectorAll('[data-vent-presentation]').forEach((e) => {
    if (e.dataset.ventPresentation === (ventilationOnly ? 'full' : 'contextual'))
      e.removeAttribute('display');
    else e.remove();
  });
  if (transparent && !ventilationOnly) copy.querySelector('[data-background]')?.remove();
}
