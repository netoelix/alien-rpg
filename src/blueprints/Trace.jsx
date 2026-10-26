import { traceGeometry } from './trace-geometry.js';
const coords = (points) => points.map((p) => p.x + ',' + p.y).join(' ');
export function Trace({ element }) {
  const g = traceGeometry(element),
    rail = element.traceType === 'rail';
  return (
    <g fill="none" strokeWidth=".055" strokeLinejoin="round" strokeLinecap="round">
      {g.marks.map((m, i) => (
        <line key={i} x1={m.a.x} y1={m.a.y} x2={m.b.x} y2={m.b.y} strokeOpacity={rail ? 0.65 : 1} />
      ))}
      {rail ? (
        <>
          <polyline points={coords(g.left)} />
          <polyline points={coords(g.right)} />
        </>
      ) : (
        <polyline points={coords(g.center)} strokeWidth=".09" />
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
