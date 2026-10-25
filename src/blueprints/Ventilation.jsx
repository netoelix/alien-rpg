import { ventAccess, ventSeams, ventNetworks } from './ventilation.js';
export function Ventilation({ element, elements = [], floor = '#102c24', phase = 'all' }) {
  const accesses =
    element.points.length >= 2 ? [0, 1].map((i) => ventAccess(element, i, elements)) : [];
  const resolved = element.points.map((p, i) =>
    i === 0 ? accesses[0] || p : i === element.points.length - 1 ? accesses[1] || p : p,
  );
  const points = resolved.map((p) => p.x + ',' + p.y).join(' '),
    width = element.width;
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="butt">
      {(phase === 'all' || phase === 'outline') && (
        <polyline points={points} strokeWidth={width + 0.12} />
      )}
      {(phase === 'all' || phase === 'fill') && (
        <polyline points={points} stroke={floor} strokeWidth={width} />
      )}
      {(phase === 'all' || phase === 'detail') &&
        ventSeams({ ...element, points: resolved }).map((p, i) => (
          <path
            key={i}
            transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}
            d={`M0 ${-width / 2}V${width / 2}`}
            strokeWidth=".06"
            strokeOpacity=".65"
          />
        ))}
      {(phase === 'all' || phase === 'detail') &&
        element.points.length >= 2 &&
        [0, 1].map((i) => {
          const a = accesses[i];
          return (
            <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`} strokeWidth=".1">
              {a.type === 'grille' && (
                <>
                  <rect x={-width / 2} y="-.15" width={width} height=".3" fill={floor} />
                  {[-0.3, 0, 0.3].map((x) => (
                    <path key={x} d={`M${x * width} -.15V.15`} />
                  ))}
                </>
              )}
              {a.type === 'hatch' && (
                <>
                  <rect x={-width / 2} y={-width / 2} width={width} height={width} fill={floor} />
                  <path
                    d={`M${-width * 0.3} ${-width * 0.3}L${width * 0.3} ${width * 0.3} M${width * 0.3} ${-width * 0.3}L${-width * 0.3} ${width * 0.3}`}
                  />
                </>
              )}
              {a.type === 'cap' && <path d={`M0 ${-width / 2}V${width / 2}`} strokeWidth=".18" />}
            </g>
          );
        })}
    </g>
  );
}

export function VentilationNetwork({ elements, floor }) {
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
