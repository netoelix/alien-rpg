export const areaTools = ['room', 'ellipse', 'polygon', 'floorRegion'];
export function areaElement(element, purpose, finish) {
  if (purpose === 'room' || !areaTools.includes(element.kind)) return element;
  let points = element.points;
  if (!points) {
    const { x, y, w, h } = element;
    if (element.kind === 'ellipse') {
      const count = Math.max(4, Math.min(64, Math.floor((Math.PI * Math.min(w, h)) / 1.3) * 4));
      points = Array.from({ length: count }, (_, i) => {
        const a = (i * 2 * Math.PI) / count;
        return { x: x + w / 2 + (Math.cos(a) * w) / 2, y: y + h / 2 + (Math.sin(a) * h) / 2 };
      });
    } else
      points = [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ];
  }
  return {
    id: element.id,
    kind: 'floorRegion',
    points,
    floorFinish: {
      ...finish,
      type:
        purpose === 'floor'
          ? ['pool', 'lake'].includes(finish.type)
            ? 'plates'
            : finish.type
          : purpose,
    },
  };
}
