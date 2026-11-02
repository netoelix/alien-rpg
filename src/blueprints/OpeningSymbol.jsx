export function OpeningSymbol({ type = 'door', width, depth, stroke }) {
  const x = width / 2,
    d = depth,
    h = Math.min(d * 0.8, 0.22);
  return (
    <g fill="none" stroke={stroke}>
      <path d={`M${-x} ${-d}v${2 * d}M${x} ${-d}v${2 * d}`} />
      {type === 'slimWindow' ? (
        <path strokeWidth=".055" d={`M${-x} -.042H${x}M${-x} .042H${x}`} />
      ) : type === 'armoredDoor' ? (
        <>
          <rect x={-x} y={-h} width={width} height={2 * h} />
          {[-0.65, 0.65].map((f) => (
            <path key={f} d={`M${x * f} ${-d}V${d}`} />
          ))}
          <path strokeWidth=".045" d={`M${-0.48 * x} 0H${0.48 * x}`} />
        </>
      ) : type === 'airlock' ? (
        <>
          <path
            d={`M${-x} ${-h}H${-0.12 * x}L0 0l${-0.12 * x} ${h}H${-x}ZM${x} ${-h}H${0.12 * x}L0 0l${0.12 * x} ${h}H${x}Z`}
          />
          <path strokeWidth=".045" d={`M${-0.8 * x} 0h${0.35 * x}M${0.45 * x} 0h${0.35 * x}`} />
        </>
      ) : type === 'shutter' ? (
        <>
          <rect x={-x} y={-d} width={width} height={d * 0.7} rx=".04" />
          <path
            strokeWidth=".055"
            d={`M${-x} 0H${x}M${-x} ${d * 0.36}H${x}M${-x} ${d * 0.72}H${x}`}
          />
        </>
      ) : type === 'fortifiedWindow' ? (
        <>
          <rect x={-x} y={-h} width={width} height={2 * h} />
          <path strokeWidth=".05" d={`M${-x} 0H${x}`} />
          {[-0.55, 0, 0.55].map((f) => (
            <path key={f} d={`M${x * f} ${-d}V${d}`} />
          ))}
        </>
      ) : (
        <>
          <path d={`M${-x} -.12H${x}V.12H${-x}Z`} />
          {type === 'window' && <path d={`M${-x} 0H${x}`} />}
        </>
      )}
    </g>
  );
}
