import { VentAccessSymbol } from './VentAccessSymbol.jsx';
import { ventPortPosition, ventPortTypes } from './vent-ports.js';
import { ventBranch } from './vent-branches.js';
export function VentPorts({ element, points, floor, subtle, elements = [], contextMask }) {
  return (element.ports || []).map((port) => {
    const origin = ventPortPosition(points, port, element.width);
    if (!origin) return null;
    const size =
      port.type === 'grille' ? (port.size ?? Math.min(0.65, element.width * 0.8)) : element.width;
    const branch = ventBranch({ ...element, points }, port, elements),
      p = branch ? { ...branch.end, angle: branch.angle } : origin;

    const angle = (origin.angle * Math.PI) / 180,
      dx = (Math.cos(angle) * size) / 2,
      dy = (Math.sin(angle) * size) / 2;
    const corners = branch
      ? [
          { x: origin.x - dx, y: origin.y - dy },
          { x: branch.end.x - dx, y: branch.end.y - dy },
          { x: branch.end.x + dx, y: branch.end.y + dy },
          { x: origin.x + dx, y: origin.y + dy },
        ]
      : [];
    const path = corners.map((q, i) => (i ? 'L' : 'M') + q.x + ' ' + q.y).join(' ');
    const full = (
      <g fill="none" strokeWidth=".06">
        <path d={path + 'Z'} fill={floor} stroke="none" />
        <path d={path} />
      </g>
    );
    const branchShape = branch && (
      <g data-vent-branch={port.id}>
        {contextMask ? (
          <>
            <g mask={`url(#${contextMask}-outside)`}>{full}</g>
            <path
              d={path}
              fill="none"
              strokeWidth=".06"
              mask={`url(#${contextMask}-inside)`}
              strokeDasharray=".25 .2"
              opacity=".5"
            />
          </>
        ) : (
          full
        )}
      </g>
    );
    return (
      <g key={port.id} data-vent-port={port.id}>
        <title>{port.label || ventPortTypes[port.type]}</title>
        {branchShape}
        <g transform={`translate(${p.x} ${p.y})`}>
          <g
            transform={`rotate(${p.angle})`}
            opacity={subtle ? 0.7 : 1}
            strokeWidth=".055"
            fill={floor}
          >
            {port.type === 'grille' ? (
              <>
                <rect x={-size / 2} y="-.1" width={size} height=".2" />
                {[-0.25, 0, 0.25].map((x) => (
                  <path key={x} d={`M${x * size} -.1V.1`} fill="none" />
                ))}
              </>
            ) : (
              <>
                <rect x={-size / 2} y={-size / 2} width={size} height={size} />
                <VentAccessSymbol type={port.type} size={size} />
              </>
            )}
          </g>
        </g>
      </g>
    );
  });
}
