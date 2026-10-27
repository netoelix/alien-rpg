import { WaterMargins } from './WaterMargins.jsx';
export function River({ element, geometry, floor = '#102c24' }) {
  const points = geometry.center.map((p) => p.x + ',' + p.y).join(' ');
  return (
    <g data-water-river="true" fill="none" strokeLinejoin="round" strokeLinecap="round">
      <polyline points={points} strokeWidth={element.width + 0.1} />
      <polyline points={points} stroke={floor} strokeWidth={element.width} />
      <polyline
        points={points}
        stroke="currentColor"
        strokeOpacity=".08"
        strokeWidth={element.width}
      />
      <WaterMargins
        path={geometry.center.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ')}
        points={geometry.center}
        riverWidth={element.width}
        size={Math.max(0.5, Math.min(3, element.width / 3))}
      />
      <polyline
        points={points}
        stroke="transparent"
        strokeWidth={element.width}
        pointerEvents="stroke"
      />
    </g>
  );
}
