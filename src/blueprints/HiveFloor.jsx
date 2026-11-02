import { useId } from 'react';

// Distribute growth along the perimeter rather than restarting the motif at each vertex.
function edgeGrowth(points, size, density) {
  const edges = [];
  let perimeter = 0,
    twiceArea = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.hypot(dx, dy);
    twiceArea += a.x * b.y - b.x * a.y;
    if (!length) continue;
    edges.push({ a, dx, dy, length, start: perimeter });
    perimeter += length;
  }
  if (!twiceArea || !perimeter) return [];
  const count = Math.min(160, Math.max(3, Math.round(perimeter / (size * 1.7))));
  const spacing = perimeter / count;
  const depth = Math.min(size, (Math.abs(twiceArea) / perimeter) * 0.38);
  let edgeIndex = 0;
  return Array.from({ length: count }, (_, i) => {
    const distance = (i + 0.3 + 0.15 * Math.sin(i * 4.7)) * spacing;
    while (edgeIndex + 1 < edges.length && edges[edgeIndex + 1].start <= distance) edgeIndex++;
    const { a, dx, dy, length, start } = edges[edgeIndex];
    const t = (distance - start) / length;
    const x = a.x + t * dx,
      y = a.y + t * dy;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const phase = (distance / perimeter) * 2 * Math.PI;
    const pocket = 0.5 + 0.28 * Math.cos(phase * 2 + 0.4) + 0.22 * Math.sin(phase * 3 + 1);
    if (pocket + density < 0.94) return null;
    return (
      'translate(' +
      x +
      ' ' +
      y +
      ') rotate(' +
      angle +
      ') scale(' +
      Math.min(size * 2, spacing * 2) * (0.78 + 0.2 * Math.cos(i * 2.3)) +
      ' ' +
      Math.sign(twiceArea) *
        depth *
        (0.3 + 3.2 * density * pocket) *
        (0.8 + 0.24 * Math.sin(i * 1.7)) +
      ')'
    );
  });
}

export function HiveFloor({ element, ink, floor }) {
  const id = 'hive-floor-' + useId().replaceAll(':', '');
  const {
    points,
    floorFinish: { size, opacity, density = 0.55 },
  } = element;
  if (!opacity || points.length < 3) return null;
  const outline = points.map((p) => p.x + ',' + p.y).join(' ');
  return (
    <g pointerEvents="none" opacity={opacity} data-floor-finish="hive">
      <defs>
        <clipPath id={id}>
          <polygon points={outline} />
        </clipPath>
        <g id={id + '-root'} fill="none" stroke={ink} strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M-.4 .04Q-.2 .04 .04 .23T.56 .53Q.29 .44 .12 .4T-.35 .14Z"
            fill={ink}
            fillOpacity=".21"
            strokeWidth=".012"
          />
          <path
            d="M-.51 .035C-.27 .16-.11 .025 .12 .22S.37 .46 .66 .49Q.32 .51 .07 .28T-.51 .095Z"
            fill={floor}
            strokeWidth=".025"
          />
          <path
            d="M-.49 .09C-.26 .21-.13 .1 .1 .3S.33 .59 .60 .65Q.31 .64 .04 .36T-.49 .14Z"
            fill={floor}
            strokeWidth=".026"
          />
          <path
            fill={floor}
            strokeWidth=".034"
            d="M-.54 -.04C-.43 .21-.18 .12 .01 .31S.17 .69 .56 .92C.26 .84 .14 .63 .01 .46S-.35 .28-.54 .13Z"
          />
          <path
            strokeWidth=".016"
            d="M-.21 .16l-.01 .055m.06-.047-.012 .054m.066-.035-.02 .055M.11 .44l.051-.032m-.025 .088 .049-.032m.048 .15 .045-.04"
          />
          <path
            strokeWidth=".022"
            d="M-.13 .25Q.03 .24 .13 .14T.43 .09M.14 .55Q.32 .48 .4 .55T.63 .59M.32 .78Q.3 .92 .45 1.04"
          />
        </g>
      </defs>
      <g clipPath={'url(#' + id + ')'}>
        {edgeGrowth(points, size, density).map(
          (transform, i) =>
            transform && <use key={i} href={'#' + id + '-root'} transform={transform} />,
        )}
      </g>
    </g>
  );
}
