export function dimensionFrame(element) {
  const [a, b] = element.points;
  const mode = element.mode || 'direct';
  const dx = mode === 'vertical' ? 0 : b.x - a.x,
    dy = mode === 'horizontal' ? 0 : b.y - a.y;
  const length = Math.hypot(dx, dy);
  const ux = length ? dx / length : mode === 'vertical' ? 0 : 1,
    uy = length ? dy / length : mode === 'vertical' ? 1 : 0;
  const nx = -uy,
    ny = ux,
    offset = element.offset || 0;
  return {
    length,
    angle: (Math.atan2(uy, ux) * 180) / Math.PI,
    nx,
    ny,
    a: { x: a.x + nx * offset, y: a.y + ny * offset },
    b: { x: a.x + dx + nx * offset, y: a.y + dy + ny * offset },
  };
}
export function dimensionLength(element) {
  return dimensionFrame(element).length;
}
export function dimensionOffset(element, point) {
  const f = dimensionFrame({ ...element, offset: 0 });
  return Math.max(-2000, Math.min(2000, (point.x - f.a.x) * f.nx + (point.y - f.a.y) * f.ny));
}
