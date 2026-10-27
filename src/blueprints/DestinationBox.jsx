import { destinationLines } from './destination-labels.js';
export function DestinationBox({
  element,
  labelKey,
  text,
  x,
  y,
  ink,
  background = '#061910',
  editorOnly,
}) {
  const lines = destinationLines(text),
    width = Math.max(1, ...lines.map((l) => l.length * 0.17)) + 0.3;
  const height = lines.length * 0.36 + 0.22,
    offset = element.destinationOffsets?.[labelKey];
  return (
    <g
      data-destination-object={element.id}
      data-destination-key={labelKey}
      data-editor-only={editorOnly ? 'true' : undefined}
      transform={`translate(${x + (offset?.dx || 0)} ${y + (offset?.dy || 0)})`}
      style={{ cursor: 'move' }}
      pointerEvents="all"
    >
      <title>Arraste para mover a legenda</title>
      <rect
        x={-width / 2}
        y="-.22"
        width={width}
        height={height}
        rx=".08"
        fill={background}
        stroke={ink}
        strokeWidth=".025"
      />
      <text fill={ink} stroke="none" fontFamily="monospace" fontSize=".28" textAnchor="middle">
        {lines.map((line, i) => (
          <tspan key={i} x="0" y={i * 0.36 + 0.08}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
