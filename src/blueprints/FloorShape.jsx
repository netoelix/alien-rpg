import { shapeTransform } from './orientation.js';
export function Shape({ element, outer = false, seamOverlap = false, paint = 'currentColor' }) {
  // Tiny rendering overlap closes antialiasing seams at coincident boundaries.
  // Geometry, snapping and saved dimensions remain unchanged.
  const outline = outer ? 0.4 : seamOverlap ? 0.06 : 0;
  if (element.kind === 'partition') return null;
  if (element.kind === 'polygon')
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
        points={element.points
          .map((p, i, pts) => {
            if (!seamOverlap || (i !== 0 && i !== pts.length - 1)) return p.x + ',' + p.y;
            const closed = i === 0 ? element.closedStart : element.closedEnd;
            const other = i === 0 ? pts[1] : pts.at(-2),
              len = Math.hypot(p.x - other.x, p.y - other.y);
            const extra = closed ? 0 : element.width / 2;
            return (
              p.x + ((p.x - other.x) / len) * extra + ',' + (p.y + ((p.y - other.y) / len) * extra)
            );
          })
          .join(' ')}
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
