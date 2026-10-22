import { layerFor } from './model.js';

export function selectionBounds(element) {
  if (element.kind === 'door') return null;
  if (element.points) {
    const padding = element.kind === 'polygon' ? 0 : (element.width || 0) / 2;
    const xs = element.points.map((p) => p.x),
      ys = element.points.map((p) => p.y);
    return {
      x: Math.min(...xs) - padding,
      y: Math.min(...ys) - padding,
      w: Math.max(...xs) - Math.min(...xs) + padding * 2,
      h: Math.max(...ys) - Math.min(...ys) + padding * 2,
    };
  }
  const w = element.w || 0,
    h = element.h || 0;
  const angle = ((element.rotation || 0) * Math.PI) / 180;
  const width =
    element.kind === 'ellipse'
      ? Math.hypot(w * Math.cos(angle), h * Math.sin(angle))
      : Math.abs(w * Math.cos(angle)) + Math.abs(h * Math.sin(angle));
  const height =
    element.kind === 'ellipse'
      ? Math.hypot(w * Math.sin(angle), h * Math.cos(angle))
      : Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));
  return { x: element.x + (w - width) / 2, y: element.y + (h - height) / 2, w: width, h: height };
}

export function selectInBox(project, start, end) {
  const left = Math.min(start.x, end.x),
    top = Math.min(start.y, end.y);
  const right = Math.max(start.x, end.x),
    bottom = Math.max(start.y, end.y);
  if (right - left < 0.05 || bottom - top < 0.05) return [];
  return project.elements
    .filter((element) => {
      const layer = project.layers.find((item) => item.id === layerFor(element.kind));
      const box = selectionBounds(element);
      return (
        layer?.visible &&
        !layer.locked &&
        box &&
        box.x >= left &&
        box.y >= top &&
        box.x + box.w <= right &&
        box.y + box.h <= bottom
      );
    })
    .map((element) => element.id);
}
