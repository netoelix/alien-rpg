import { waterRegionPath } from './water.js';
import { shapeTransform } from './orientation.js';
export function Shape({ element, outer = false, seamOverlap = false, paint = 'currentColor' }) {
  // Tiny rendering overlap closes antialiasing seams at coincident boundaries.
  // Geometry, snapping and saved dimensions remain unchanged.
  const outline = outer ? 0.4 : seamOverlap ? 0.06 : 0;
  if (element.kind === 'floorRegion' && element.floorFinish?.type === 'lake')
    return (
      <path
        d={waterRegionPath(element.points, true)}
        fill={paint}
        stroke={paint}
        strokeWidth={outline}
      />
    );
  if (element.kind === 'partition') return null;
  if (['polygon', 'floorRegion'].includes(element.kind))
    return (
      <polygon
        points={element.points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill={paint}
        stroke={paint}
        strokeWidth={outline}
        strokeLinejoin="round"
      />
    );
  if (element.kind === 'corridor')
    return (
      <polyline
        points={element.points.map((p) => p.x + ',' + p.y).join(' ')}
        fill="none"
        stroke={paint}
        strokeWidth={element.width + outline}
        strokeLinejoin="round"
        strokeLinecap="butt"
      />
    );
  const { x, y, w, h } = element;
  const common = {
    transform: shapeTransform(element),
    fill: paint,
    stroke: paint,
    strokeWidth: outline,
  };
  return element.kind === 'ellipse' ? (
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />
  ) : (
    <rect x={x} y={y} width={w} height={h} {...common} />
  );
}
