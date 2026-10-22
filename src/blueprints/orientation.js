// Coordenadas locais mantêm dimensões e índices de paredes estáveis ao girar.
export function rotatePoint(element, x, y, inverse = false) {
  const angle = (((element.rotation || 0) * Math.PI) / 180) * (inverse ? -1 : 1);
  const cx = element.x + element.w / 2,
    cy = element.y + element.h / 2;
  return {
    x: cx + (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle),
    y: cy + (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle),
  };
}
export function shapeTransform(element) {
  return element.rotation
    ? `rotate(${element.rotation} ${element.x + element.w / 2} ${element.y + element.h / 2})`
    : undefined;
}
