import { UtilityTrace } from './UtilityTrace.jsx';
import { Relief } from './Relief.jsx';
import { SignageTrace } from './SignageTrace.jsx';
import { CirculationNetwork } from './CirculationNetwork.jsx';
import { isCirculation } from './circulation.js';
import { River } from './River.jsx';
import { RailTrack } from './RailTrack.jsx';
import { traceGeometry } from './trace-geometry.js';
const coords = (points) => points.map((p) => p.x + ',' + p.y).join(' ');
export function Trace({ element, floor, ink }) {
  if (['pipe', 'cable', 'cableTray'].includes(element.traceType))
    return <UtilityTrace element={element} floor={floor} />;
  if (['talus', 'cliff'].includes(element.traceType)) return <Relief element={element} />;
  const g = traceGeometry(element),
    rail = element.traceType === 'rail',
    channel = ['channel', 'gratedChannel'].includes(element.traceType);
  if (['hazardLine', 'walkwayLine'].includes(element.traceType))
    return <SignageTrace element={element} geometry={g} />;
  if (isCirculation(element))
    return <CirculationNetwork elements={[element]} floor={floor} ink={ink} />;
  if (element.traceType === 'river') return <River element={element} geometry={g} floor={floor} />;
  if (channel)
    return (
      <g
        data-floor-channel={element.traceType}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="butt"
      >
        <polyline points={coords(g.center)} strokeWidth={element.width} />
        <polyline
          points={coords(g.center)}
          stroke={floor || '#102c24'}
          strokeWidth={Math.max(0.05, element.width - 0.06)}
        />
        {g.marks.map((m, i) => (
          <line key={i} x1={m.a.x} y1={m.a.y} x2={m.b.x} y2={m.b.y} strokeWidth=".025" />
        ))}
        <polyline
          points={coords(g.center)}
          stroke="transparent"
          strokeWidth={Math.max(0.6, element.width)}
          pointerEvents="stroke"
        />
      </g>
    );
  return (
    <g fill="none" strokeWidth=".055" strokeLinejoin="round" strokeLinecap="round">
      {!rail &&
        g.marks.map((m, i) => (
          <line
            key={i}
            x1={m.a.x}
            y1={m.a.y}
            x2={m.b.x}
            y2={m.b.y}
            strokeOpacity={rail ? 0.65 : 1}
          />
        ))}
      {rail ? (
        <RailTrack geometry={g} gauge={element.width} floor={floor} />
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
