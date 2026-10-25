export function labelBounds(e) {
  const lines = e.text.split('\n');
  const w = Math.max(1, ...lines.map((l) => Array.from(l).length)) * e.size * 0.65;
  const shift = e.align === 'middle' ? w / 2 : e.align === 'end' ? w : 0;
  return { x: e.x - shift, y: e.y - e.size, w, h: e.size * (1.25 * (lines.length - 1) + 1.3) };
}
