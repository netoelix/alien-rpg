export function SanitaryFixture({ type, w, h }) {
  const edge = Math.min(0.035, w / 15, h / 15),
    inset = Math.min(0.08, w / 8, h / 8);
  return (
    <g strokeWidth={edge}>
      {' '}
      {type === 'sanitaryToilet' && (
        <>
          <ellipse cx={w / 2} cy={h * 0.59} rx={w * 0.43} ry={h * 0.38} />
          <ellipse cx={w / 2} cy={h * 0.6} rx={w * 0.26} ry={h * 0.24} fill="none" />
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h * 0.23} rx={inset / 2} />
        </>
      )}
      {type === 'showerTray' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset / 2} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} rx={inset} />
          <circle cx={w * 0.75} cy={h * 0.75} r={Math.min(0.05, w * 0.08)} />
          <path
            d={`M${w / 2} ${edge}V${h * 0.16} M${w * 0.4} ${h * 0.16}H${w * 0.6}`}
            fill="none"
          />
        </>
      )}
    </g>
  );
}
