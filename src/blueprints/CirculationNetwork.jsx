import { useId, useMemo } from 'react';
import { traceGeometry } from './trace-geometry.js';
import {
  circulationStyle,
  roadSidewalks,
  isCirculation,
  overlappingTraces,
  pavementJoints,
} from './circulation.js';
export function CirculationNetwork({ elements, floor = '#102c24', ink = 'currentColor' }) {
  const id = 'circulation-' + useId().replaceAll(':', '');
  const paths = useMemo(
    () =>
      elements
        .filter((e) => isCirculation(e) && !e.hidden)
        .map((e) => ({
          e,
          style: circulationStyle(e),
          joints: pavementJoints(traceGeometry(e).center, e.width),
          points: traceGeometry(e)
            .center.map((p) => p.x + ',' + p.y)
            .join(' '),
        })),
    [elements],
  );
  const sidewalks = useMemo(() => roadSidewalks(elements), [elements]);
  const extent = elements.reduce(
    (max, e) => e.points?.reduce((n, p) => Math.max(n, p.x + 100, p.y + 100), max) ?? max,
    2200,
  );
  const stroke = (p, width, color, extra = {}) => (
    <polyline key={p.e.id} points={p.points} strokeWidth={width} stroke={color} {...extra} />
  );
  return (
    <g
      data-circulation-network="true"
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="butt"
      color={ink}
    >
      {sidewalks.length > 0 && <CirculationNetwork elements={sidewalks} floor={floor} ink={ink} />}
      <defs>
        {paths.map((p, i) => (
          <mask
            key={p.e.id}
            id={id + '-junction-' + i}
            maskUnits="userSpaceOnUse"
            x="-100"
            y="-100"
            width={extent}
            height={extent}
          >
            <rect x="-100" y="-100" width={extent} height={extent} fill="white" />
            {paths
              .filter((q) => q !== p && overlappingTraces(p.e, q.e))
              .map((q) => stroke(q, q.e.width + 0.12, 'black'))}
          </mask>
        ))}
      </defs>
      {/* Paint all borders before all interiors: joined surfaces have no internal seam. */}
      {paths.map((p) =>
        stroke(
          p,
          p.e.width + (p.style.edge === 'none' ? 0 : 0.08),
          p.style.edge === 'none' ? floor : ink,
        ),
      )}
      {paths.map((p) => stroke(p, p.e.width, floor))}
      {paths.map((p, i) => (
        <g key={p.e.id} mask={`url(#${id}-junction-${i})`}>
          {p.style.edge === 'curb' && (
            <>
              {stroke(p, Math.max(0.05, p.e.width - 0.28), ink)}
              {stroke(p, Math.max(0.025, p.e.width - 0.34), floor)}
            </>
          )}
          {p.style.finish === 'slabs' && (
            <g data-pavement-joints="true" stroke={ink} strokeWidth=".025" opacity=".22">
              {p.joints.map((j, index) => (
                <line key={index} x1={j.a.x} y1={j.a.y} x2={j.b.x} y2={j.b.y} />
              ))}
            </g>
          )}
          {p.e.traceType === 'road' &&
            p.style.markings &&
            stroke(p, 0.05, ink, { strokeDasharray: '1.5 1', opacity: 0.45 })}
        </g>
      ))}
      {paths.map((p) =>
        stroke(p, p.e.width, 'transparent', { 'data-object': p.e.id, pointerEvents: 'stroke' }),
      )}
    </g>
  );
}
