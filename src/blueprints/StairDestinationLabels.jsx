import { stairDestinations } from './stair-destinations.js';
export function StairDestinationLabels({ project, elements, ink, background }) {
  return (
    <g
      pointerEvents="none"
      fill={ink}
      stroke={background}
      strokeWidth=".12"
      paintOrder="stroke"
      strokeLinejoin="round"
      fontFamily="monospace"
      fontSize=".45"
      textAnchor="middle"
    >
      {elements
        .filter((e) => e.kind === 'asset' && e.asset === 'stairs' && !e.connectionLabel?.hidden)
        .map((e) =>
          stairDestinations(project, e).map((text, i) => (
            <text
              key={e.id + ':' + i}
              data-editor-only={e.connectionLabel?.export === false ? 'true' : undefined}
              x={e.x + e.w / 2 + (e.connectionLabel?.dx || 0)}
              y={e.y + e.h + 0.65 + i * 0.6 + (e.connectionLabel?.dy || 0)}
            >
              {text}
            </text>
          )),
        )}
    </g>
  );
}
