import { traceGeometry } from './trace-geometry.js';
const coords = (points) => points.map((p) => p.x + ',' + p.y).join(' ');
export function UtilityTrace({ element, floor = '#102c24' }) {
  const g = traceGeometry({ ...element, traceType: 'rail' }),
    w = element.width;
  const marks = g.marks
    .filter((_, i) => i % (element.traceType === 'pipe' ? 6 : 2) === 0)
    .map((m) => {
      const x = (m.a.x + m.b.x) / 2,
        y = (m.a.y + m.b.y) / 2;
      const length = Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y) || 1;
      const half = (w + (element.traceType === 'pipe' ? 0.12 : 0)) / 2;
      const dx = ((m.b.x - m.a.x) / length) * half,
        dy = ((m.b.y - m.a.y) / length) * half;
      return { a: { x: x - dx, y: y - dy }, b: { x: x + dx, y: y + dy } };
    });
  return (
    <g data-utility={element.traceType} fill="none" strokeLinejoin="round">
      {element.traceType === 'cable' ? (
        <>
          <polyline points={coords(g.center)} strokeWidth={Math.max(0.03, w * 0.4)} />
          <polyline
            points={coords(g.right)}
            strokeWidth={Math.max(0.02, w * 0.16)}
            strokeOpacity=".65"
          />
        </>
      ) : (
        <>
          <polyline points={coords(g.center)} strokeWidth={w + 0.08} />
          <polyline points={coords(g.center)} stroke={floor} strokeWidth={w} />
          {marks.map((m, i) => (
            <line
              key={i}
              x1={m.a.x}
              y1={m.a.y}
              x2={m.b.x}
              y2={m.b.y}
              strokeWidth={element.traceType === 'pipe' ? 0.08 : 0.035}
            />
          ))}
          {element.traceType === 'cableTray' && (
            <polyline points={coords(g.center)} strokeWidth=".03" />
          )}
        </>
      )}
      <polyline
        points={coords(g.center)}
        stroke="transparent"
        strokeWidth={Math.max(0.6, w)}
        pointerEvents="stroke"
      />
    </g>
  );
}
