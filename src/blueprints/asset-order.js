import { isPlatform } from './level-assets.js';
import { floorMarkings } from './floor-markings.js';
// Platforms support markings and furniture, regardless of insertion order.
export function assetOrder(element) {
  if (Number.isFinite(element.stackOrder)) return element.stackOrder;
  return isPlatform(element.asset) ? 0 : floorMarkings[element.asset] ? 1 : 2;
}

export function reorderAsset(project, id, action) {
  const sorted = project.elements
    .filter((e) => e.kind === 'asset')
    .sort((a, b) => assetOrder(a) - assetOrder(b));
  const index = sorted.findIndex((e) => e.id === id);
  if (index < 0 || sorted[index].locked) return project;
  const target = {
    front: sorted.length - 1,
    back: 0,
    forward: Math.min(sorted.length - 1, index + 1),
    backward: Math.max(0, index - 1),
  }[action];
  if (target === undefined || target === index) return project;
  const anchor = sorted[target],
    selected = sorted[index];
  const elements = project.elements.filter((e) => e.id !== id);
  const at = elements.findIndex((e) => e.id === anchor.id);
  elements.splice(at + (target > index ? 1 : 0), 0, {
    ...selected,
    stackOrder: assetOrder(anchor),
  });
  return { ...project, elements };
}
