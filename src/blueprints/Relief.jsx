import { reliefGeometry } from './relief.js';
const coords = (points) => points.map((p) => p.x + ',' + p.y).join(' ');
export function Relief({ element }) {
  const g = reliefGeometry(element);
  return (
    <g data-relief={element.traceType} fill="none" strokeLinejoin="round" strokeLinecap="butt">
      <polyline points={coords(g.center)} strokeWidth=".09" />
      {g.fractures.map((points, i) => (
        <polyline key={i} points={coords(points)} strokeWidth=".045" strokeOpacity=".8" />
      ))}
      {element.traceType === 'cliff' && (
        <polyline
          points={coords(g.fractures.map((p) => p.at(-1)))}
          strokeWidth=".035"
          strokeOpacity=".45"
        />
      )}
      <polyline
        points={coords(g.center)}
        stroke="transparent"
        strokeWidth={Math.max(0.6, element.width)}
        pointerEvents="stroke"
      />
    </g>
  );
}
