import { selectionBounds } from './selection.js';
export const resizeHandles = [
  { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize', label: 'Canto superior esquerdo' },
  { id: 'n', x: 0.5, y: 0, cursor: 'ns-resize', label: 'Lado superior' },
  { id: 'ne', x: 1, y: 0, cursor: 'nesw-resize', label: 'Canto superior direito' },
  { id: 'e', x: 1, y: 0.5, cursor: 'ew-resize', label: 'Lado direito' },
  { id: 'se', x: 1, y: 1, cursor: 'nwse-resize', label: 'Canto inferior direito' },
  { id: 's', x: 0.5, y: 1, cursor: 'ns-resize', label: 'Lado inferior' },
  { id: 'sw', x: 0, y: 1, cursor: 'nesw-resize', label: 'Canto inferior esquerdo' },
  { id: 'w', x: 0, y: 0.5, cursor: 'ew-resize', label: 'Lado esquerdo' },
];

// O deslocamento parte do clique, evitando um salto ao pegar a borda da alça.
// A borda oposta permanece fixa; o arraste não inverte nem espelha a peça.
export function resizeElement(element, handle, dx, dy, bounds, proportional = false) {
  if (proportional && handle.length === 2) {
    return resizeProportionally(element, handle, dx, dy, bounds);
  }
  if (element.rotation && element.rotation % 360 !== 0) {
    const angle = (element.rotation * Math.PI) / 180;
    const c = Math.cos(angle),
      s = Math.sin(angle);
    const localX = dx * c + dy * s,
      localY = -dx * s + dy * c;
    const w = Math.max(
      0.25,
      element.w + (handle.includes('w') ? -localX : handle.includes('e') ? localX : 0),
    );
    const h = Math.max(
      0.25,
      element.h + (handle.includes('n') ? -localY : handle.includes('s') ? localY : 0),
    );
    const shiftX = ((w - element.w) / 2) * (handle.includes('w') ? -1 : 1);
    const shiftY = ((h - element.h) / 2) * (handle.includes('n') ? -1 : 1);
    const next = {
      ...element,
      w,
      h,
      x: element.x + element.w / 2 + shiftX * c - shiftY * s - w / 2,
      y: element.y + element.h / 2 + shiftX * s + shiftY * c - h / 2,
    };
    return assetFits(next, bounds) ? next : element;
  }
  const overflow = bounds.mode === 'colony' && element.kind === 'asset';
  const minimum = 0.25;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let left = element.x;
  let top = element.y;
  let right = left + element.w;
  let bottom = top + element.h;
  if (handle.includes('w')) left = clamp(left + dx, overflow ? -2000 : 0, right - minimum);
  if (handle.includes('e'))
    right = clamp(right + dx, left + minimum, overflow ? bounds.width + 2000 : bounds.width);
  if (handle.includes('n')) top = clamp(top + dy, overflow ? -2000 : 0, bottom - minimum);
  if (handle.includes('s'))
    bottom = clamp(bottom + dy, top + minimum, overflow ? bounds.height + 2000 : bounds.height);
  return { ...element, x: left, y: top, w: right - left, h: bottom - top };
}

export function assetFits(element, bounds) {
  if (bounds.mode === 'colony' && element.kind === 'asset')
    return (
      element.x >= -2000 &&
      element.y >= -2000 &&
      element.x <= bounds.width &&
      element.y <= bounds.height &&
      element.w <= 2000 &&
      element.h <= 2000
    );
  const box = selectionBounds(element);
  return (
    element.x >= 0 &&
    element.y >= 0 &&
    element.x + element.w <= bounds.width &&
    element.y + element.h <= bounds.height &&
    box.x >= -1e-8 &&
    box.y >= -1e-8 &&
    box.x + box.w <= bounds.width + 1e-8 &&
    box.y + box.h <= bounds.height + 1e-8
  );
}

export function rotateAsset(element, start, end, bounds, step = 1) {
  const cx = element.x + element.w / 2,
    cy = element.y + element.h / 2;
  if (Math.hypot(end.x - cx, end.y - cy) < 0.01) return element;
  const delta = Math.atan2(end.y - cy, end.x - cx) - Math.atan2(start.y - cy, start.x - cx);
  const rotation =
    (((Math.round(((element.rotation || 0) + (delta * 180) / Math.PI) / step) * step) % 360) +
      360) %
    360;
  const next = { ...element, rotation };
  return assetFits(next, bounds) ? next : element;
}

// Projeta o gesto na diagonal local. O canto oposto é a âncora da escala.
function resizeProportionally(element, handle, dx, dy, bounds) {
  const angle = ((element.rotation || 0) * Math.PI) / 180;
  const c = Math.cos(angle),
    s = Math.sin(angle);
  const signX = handle.includes('w') ? -1 : 1;
  const signY = handle.includes('n') ? -1 : 1;
  const localX = (dx * c + dy * s) * signX;
  const localY = (-dx * s + dy * c) * signY;
  const scale = Math.max(
    0.25 / element.w,
    0.25 / element.h,
    1 + (localX * element.w + localY * element.h) / (element.w ** 2 + element.h ** 2),
  );
  function atScale(value) {
    const w = element.w * value,
      h = element.h * value;
    const shiftX = ((w - element.w) / 2) * signX;
    const shiftY = ((h - element.h) / 2) * signY;
    return {
      ...element,
      w,
      h,
      x: element.x + element.w / 2 + shiftX * c - shiftY * s - w / 2,
      y: element.y + element.h / 2 + shiftX * s + shiftY * c - h / 2,
    };
  }
  const next = atScale(scale);
  if (assetFits(next, bounds)) return next;
  if (!assetFits(element, bounds)) return element;
  // Para no limite sem perder a proporção ou saltar ao tamanho original.
  let valid = 1,
    invalid = scale;
  for (let i = 0; i < 40; i++) {
    const middle = (valid + invalid) / 2;
    if (assetFits(atScale(middle), bounds)) valid = middle;
    else invalid = middle;
  }
  return atScale(1 + (valid - 1) * (1 - 1e-8));
}
