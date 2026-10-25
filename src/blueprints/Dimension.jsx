import { dimensionFrame } from './dimensions.js';
export function Dimension({ element, editable = false, ...props }) {
  const f = dimensionFrame(element),
    flip = f.angle > 90 || f.angle < -90;
  return (
    <g {...props}>
      <path
        d={element.points
          .map((p, i) => {
            const q = i ? f.b : f.a;
            return 'M' + p.x + ' ' + p.y + 'L' + q.x + ' ' + q.y;
          })
          .join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth=".06"
      />
      <g transform={`translate(${f.a.x} ${f.a.y}) rotate(${f.angle})`}>
        <path
          d={`M0 0H${f.length} M0 -.35V.35 M${f.length} -.35V.35`}
          fill="none"
          stroke="currentColor"
          strokeWidth=".1"
        />
        <path
          data-editor-only="true"
          d={`M0 0H${f.length}`}
          fill="none"
          stroke="transparent"
          strokeWidth=".8"
        />
        <text
          transform={`translate(${f.length / 2} ${flip ? 0.85 : -0.3}) rotate(${flip ? 180 : 0})`}
          textAnchor="middle"
          fontSize=".65"
          fontFamily="monospace"
          fill="currentColor"
          stroke="none"
        >
          {f.length.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m
        </text>
        {editable && (
          <circle
            data-editor-only="true"
            data-dimension-offset="true"
            cx={f.length / 2}
            cy="0"
            r=".25"
            fill="#f1c46c"
            stroke="none"
            style={{ cursor: 'move' }}
          >
            <title>Arraste para afastar a linha de medida</title>
          </circle>
        )}
      </g>
    </g>
  );
}
