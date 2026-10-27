import { useId } from 'react';
const coords = (p) => p.map((q) => q.x + ',' + q.y).join(' ');
export function SignageTrace({ element, geometry }) {
  const id = 'signage-' + useId().replaceAll(':', ''),
    hazard = element.traceType === 'hazardLine';
  return (
    <g
      data-signage-trace={element.traceType}
      fill="none"
      stroke={element.signageColor === 'green' ? '#7ce9b2' : '#f1c46c'}
      strokeLinejoin="miter"
      strokeLinecap="butt"
    >
      {hazard ? (
        <>
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse" x="-100" y="-100" width="2200" height="2200">
              <polyline
                points={coords(geometry.center)}
                stroke="white"
                strokeWidth={element.width}
                fill="none"
              />
            </mask>
          </defs>
          <polyline points={coords(geometry.left)} strokeWidth=".04" />
          <polyline points={coords(geometry.right)} strokeWidth=".04" />
          <g mask={`url(#${id})`}>
            {geometry.marks.map((m, i) => {
              const dx = m.b.x - m.a.x,
                dy = m.b.y - m.a.y;
              return (
                <path
                  key={i}
                  d={`M${m.a.x - dx + dy} ${m.a.y - dy - dx}L${m.a.x + dx - dy} ${m.a.y + dy + dx}`}
                  strokeWidth={0.14}
                />
              );
            })}
          </g>
        </>
      ) : (
        <>
          <polyline points={coords(geometry.left)} strokeWidth=".04" />
          <polyline points={coords(geometry.right)} strokeWidth=".04" />
          <polyline points={coords(geometry.center)} strokeWidth=".035" strokeDasharray=".35 .45" />
        </>
      )}
      <polyline
        points={coords(geometry.center)}
        stroke="transparent"
        strokeWidth={Math.max(0.5, element.width)}
        pointerEvents="stroke"
      />
    </g>
  );
}
