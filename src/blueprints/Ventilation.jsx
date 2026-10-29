import { VentAccessSymbol } from './VentAccessSymbol.jsx';
import { traceGeometry } from './trace-geometry.js';
import { VentPorts } from './VentPorts.jsx';
import { useId } from 'react';
import { Shape } from './FloorShape.jsx';
import { ventAccess, ventSeams, ventNetworks, isClosedVent } from './ventilation.js';
export function Ventilation({
  element,
  elements = [],
  floor = '#102c24',
  phase = 'all',
  subtle = false,
  contextMask,
}) {
  const closed = isClosedVent(element);
  const Stroke = closed ? 'polygon' : 'polyline';
  const accesses =
    element.points.length >= 2 ? [0, 1].map((i) => ventAccess(element, i, elements)) : [];
  const resolved = element.points.map((p, i) =>
    i === 0 ? accesses[0] || p : i === element.points.length - 1 ? accesses[1] || p : p,
  );
  const points = resolved.map((p) => p.x + ',' + p.y).join(' '),
    width = element.width;
  if (phase === 'reference') {
    const edges = traceGeometry({
      ...element,
      points: closed ? [resolved.at(-2), ...resolved, resolved[1]] : resolved,
      traceType: 'ledge',
      rounded: false,
      width: width + 0.06,
    });
    return (
      <g fill="none" strokeWidth=".06" strokeLinejoin="miter">
        {[edges.left, edges.right].map((edge, i) => (
          <polyline
            key={i}
            points={(closed ? edge.slice(1, -1) : edge).map((p) => p.x + ',' + p.y).join(' ')}
          />
        ))}
      </g>
    );
  }
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="butt">
      {(phase === 'all' || phase === 'outline') && (
        <Stroke points={points} strokeWidth={width + 0.12} />
      )}
      {(phase === 'all' || phase === 'fill') && (
        <Stroke points={points} stroke={floor} strokeWidth={width} />
      )}
      {(phase === 'all' || phase === 'detail' || phase === 'seams') &&
        ventSeams({ ...element, points: resolved }).map((p, i) => (
          <path
            key={i}
            transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}
            d={`M0 ${-width / 2}V${width / 2}`}
            strokeWidth=".06"
            strokeOpacity=".65"
          />
        ))}
      {(phase === 'all' || phase === 'detail' || phase === 'access') &&
        element.points.length >= 2 &&
        [0, 1].map((i) => {
          const a = accesses[i];
          return (
            <g
              key={i}
              transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`}
              strokeWidth=".1"
              opacity={subtle ? 0.7 : 1}
            >
              {a.type === 'grille' && (
                <>
                  <rect x={-width / 2} y="-.15" width={width} height=".3" fill={floor} />
                  {[-0.3, 0, 0.3].map((x) => (
                    <path key={x} d={`M${x * width} -.15V.15`} />
                  ))}
                </>
              )}
              {['hatch', 'ceiling', 'floor'].includes(a.type) && (
                <>
                  <rect x={-width / 2} y={-width / 2} width={width} height={width} fill={floor} />
                  <VentAccessSymbol type={a.type} size={width} />
                </>
              )}
              {a.type === 'cap' && <path d={`M0 ${-width / 2}V${width / 2}`} strokeWidth=".18" />}
            </g>
          );
        })}
      {['all', 'detail', 'access'].includes(phase) && (
        <VentPorts
          element={element}
          points={resolved}
          floor={floor}
          subtle={subtle}
          elements={elements}
          contextMask={contextMask}
        />
      )}
    </g>
  );
}

function CompleteNetwork({ elements, floor }) {
  return ventNetworks(elements).map((network) => (
    <g key={network[0].id}>
      {['outline', 'fill', 'detail'].map((phase) =>
        network.map((element) => (
          <g key={phase + element.id} data-object={element.id}>
            <Ventilation element={element} elements={elements} floor={floor} phase={phase} />
          </g>
        )),
      )}
    </g>
  ));
}

export function VentilationNetwork({
  elements,
  floor,
  contextual = false,
  width = 2000,
  height = 2000,
}) {
  const id = 'vent-context-' + useId().replaceAll(':', '');
  if (!contextual) return <CompleteNetwork elements={elements} floor={floor} />;
  const rooms = elements.filter((e) => ['room', 'ellipse', 'polygon', 'corridor'].includes(e.kind));
  const networks = ventNetworks(elements),
    vents = networks.flat();
  const bounds = { x: 0, y: 0, width, height };
  return (
    <g>
      <defs>
        <mask id={id + '-outside'} maskUnits="userSpaceOnUse" {...bounds}>
          <rect {...bounds} fill="white" />
          <g color="black">
            {rooms.map((e) => (
              <Shape key={e.id} element={e} />
            ))}
          </g>
        </mask>
        <mask id={id + '-inside'} maskUnits="userSpaceOnUse" {...bounds}>
          <rect {...bounds} fill="black" />
          <g color="white">
            {rooms.map((e) => (
              <Shape key={e.id} element={e} />
            ))}
          </g>
        </mask>
        <mask id={id + '-hollow'} maskUnits="userSpaceOnUse" {...bounds}>
          <rect {...bounds} fill="white" />
          {vents.map((e) => (
            <g key={e.id} stroke="black">
              <Ventilation element={e} elements={elements} floor="black" phase="fill" />
            </g>
          ))}
        </mask>
      </defs>
      <g data-vent-presentation="contextual">
        <g mask={`url(#${id}-outside)`}>
          {networks.map((network) => (
            <g key={network[0].id}>
              {['outline', 'fill', 'seams'].map((phase) =>
                network.map((e) => (
                  <g key={phase + e.id} data-object={e.id}>
                    <Ventilation element={e} elements={elements} floor={floor} phase={phase} />
                  </g>
                )),
              )}
            </g>
          ))}
        </g>
        <g mask={`url(#${id}-inside)`}>
          <g mask={`url(#${id}-hollow)`} opacity=".5" strokeDasharray=".25 .2">
            {vents.map((e) => (
              <g key={e.id} data-object={e.id}>
                <Ventilation element={e} elements={elements} floor={floor} phase="reference" />
              </g>
            ))}
          </g>
        </g>
        {vents.map((e) => (
          <g key={e.id} data-object={e.id}>
            <Ventilation
              element={e}
              elements={elements}
              floor={floor}
              phase="access"
              subtle
              contextMask={id}
            />
          </g>
        ))}
      </g>
      <g data-vent-presentation="full" display="none">
        <CompleteNetwork elements={elements} floor={floor} />
      </g>
    </g>
  );
}
