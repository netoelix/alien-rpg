import { labelBounds } from './label-bounds.js';
export function LabelText({ element, ...props }) {
  const box = labelBounds(element);
  return (
    <g {...props}>
      <rect
        data-editor-only="true"
        {...box}
        width={box.w}
        height={box.h}
        fill="transparent"
        stroke="none"
      />
      <text
        x={element.x}
        y={element.y}
        fontSize={element.size}
        textAnchor={element.align || 'start'}
        fontWeight={element.bold ? 'bold' : 'normal'}
      >
        {element.text.split('\n').map((line, index) => (
          <tspan key={index} x={element.x} dy={index ? element.size * 1.25 : 0}>
            {line || '\u00a0'}
          </tspan>
        ))}
      </text>
    </g>
  );
}
