import { AssetSymbol } from './Assets.jsx';
import { doorPosition, layerFor } from './model.js';
export const palettes = {
  green: { background: '#04120d', floor: '#102c24', ink: '#78ebae', accent: '#f1c46c' },
  blue: { background: '#071421', floor: '#102c40', ink: '#71d9f4', accent: '#f5cd7c' },
  print: { background: '#ffffff', floor: '#f1f3f4', ink: '#14252c', accent: '#555555' },
};
function Shape({ element, outer = false }) {
  if (element.kind === 'polygon')
    return (
      <polygon
        points={element.points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={outer ? 0.4 : 0}
        strokeLinejoin="round"
      />
    );
  if (element.kind === 'corridor')
    return (
      <polyline
        points={element.points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={element.width + (outer ? 0.4 : 0)}
        strokeLinejoin="round"
        strokeLinecap="butt"
      />
    );
  const { x, y, w, h } = element;
  const common = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: outer ? 0.4 : 0 };
  return element.kind === 'ellipse' ? (
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />
  ) : (
    <rect x={x} y={y} width={w} height={h} {...common} />
  );
}
export function Drawing({
  project,
  grid = false,
  gridStep = project.grid,
  selected,
  preview = [],
  interactive = false,
}) {
  const palette = palettes[project.theme];
  const elements = [...project.elements, ...preview];
  const visible = (id) => project.layers.find((l) => l.id === id)?.visible;
  const opacity = (id) => project.layers.find((l) => l.id === id)?.opacity ?? 1;
  const structure = elements.filter((e) => layerFor(e.kind) === 'structure');
  const doors = elements.filter((e) => e.kind === 'door');
  const position = (e) => {
    const p = doorPosition(e, elements);
    return p ? `translate(${p.x} ${p.y}) rotate(${p.rotation})` : '';
  };
  return (
    <>
      <rect
        data-background="true"
        width={project.width}
        height={project.height}
        fill={palette.background}
      />
      <defs>
        <pattern
          id="blueprint-grid"
          width={gridStep}
          height={gridStep}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridStep} 0 H 0 V ${gridStep}`}
            fill="none"
            stroke={palette.ink}
            strokeOpacity=".16"
            strokeWidth=".045"
          />
        </pattern>
        <mask
          id="blueprint-walls"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={project.width}
          height={project.height}
        >
          <g color="white">
            {structure.map((e) => (
              <Shape key={e.id} element={e} outer />
            ))}
          </g>
          <g color="black">
            {structure.map((e) => (
              <Shape key={e.id} element={e} />
            ))}
          </g>
          {doors.map(
            (e) =>
              doorPosition(e, elements) && (
                <rect
                  key={e.id}
                  transform={position(e)}
                  x={-e.width / 2}
                  y="-.4"
                  width={e.width}
                  height=".8"
                  fill="black"
                />
              ),
          )}
        </mask>
      </defs>
      {grid && (
        <rect
          data-editor-only="true"
          width={project.width}
          height={project.height}
          fill="url(#blueprint-grid)"
        />
      )}
      {visible('structure') && (
        <g data-layer="structure" opacity={opacity('structure')}>
          <g color={palette.floor}>
            {structure.map((e) => (
              <Shape key={e.id} element={e} />
            ))}
          </g>
          <rect
            width={project.width}
            height={project.height}
            fill={palette.ink}
            mask="url(#blueprint-walls)"
          />
        </g>
      )}
      {interactive && (
        <g data-editor-only="true">
          {visible('structure') &&
            structure.map((e) => (
              <g key={e.id} data-object={e.id} opacity="0" color="white">
                <Shape element={e} />
              </g>
            ))}
        </g>
      )}
      {visible('doors') && (
        <g
          data-layer="doors"
          opacity={opacity('doors')}
          stroke={palette.accent}
          fill="none"
          strokeWidth=".12"
        >
          {doors.map(
            (e) =>
              doorPosition(e, elements) && (
                <g key={e.id} data-object={e.id} transform={position(e)}>
                  <path
                    d={`M ${-e.width / 2} -.35 V .35 M ${e.width / 2} -.35 V .35 M ${-e.width / 2} -.12 H ${e.width / 2} V .12 H ${-e.width / 2} Z`}
                  />
                  <rect
                    x={-e.width / 2}
                    y="-.4"
                    width={e.width}
                    height=".8"
                    fill="transparent"
                    stroke="none"
                  />
                </g>
              ),
          )}
        </g>
      )}
      {visible('equipment') && (
        <g data-layer="equipment" opacity={opacity('equipment')}>
          {elements
            .filter((e) => e.kind === 'asset')
            .map((e) => (
              <g
                key={e.id}
                data-object={e.id}
                transform={`translate(${e.x + e.w / 2} ${e.y + e.h / 2}) rotate(${e.rotation}) translate(${-e.w / 2} ${-e.h / 2})`}
              >
                <svg
                  width={e.w}
                  height={e.h}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  fill={palette.floor}
                  stroke={palette.ink}
                  strokeWidth="2"
                >
                  <rect width="100" height="100" fill="transparent" stroke="none" />
                  <AssetSymbol type={e.asset} />
                </svg>
              </g>
            ))}
        </g>
      )}
      {visible('vents') && (
        <g data-layer="vents" opacity={opacity('vents')} fill="none" stroke={palette.accent}>
          {elements
            .filter((e) => e.kind === 'vent')
            .map((e) => (
              <g key={e.id} data-object={e.id}>
                <polyline
                  points={e.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  strokeWidth={e.width}
                  strokeOpacity=".3"
                  strokeLinejoin="round"
                />
                <polyline
                  points={e.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  strokeWidth=".12"
                  strokeDasharray=".4 .2"
                />
                {[e.points[0], e.points.at(-1)].map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={e.width / 2}
                    fill={palette.floor}
                    strokeWidth=".1"
                  />
                ))}
              </g>
            ))}
        </g>
      )}
      {visible('labels') && (
        <g
          data-layer="labels"
          opacity={opacity('labels')}
          fill={palette.ink}
          fontFamily="monospace"
        >
          {elements
            .filter((e) => e.kind === 'label')
            .map((e) => (
              <text key={e.id} data-object={e.id} x={e.x} y={e.y} fontSize={e.size}>
                {e.text}
              </text>
            ))}
        </g>
      )}
      {interactive && (
        <g data-editor-only="true">
          {elements
            .filter((e) => e.id === selected)
            .map((e) => {
              const p = e.kind === 'door' ? doorPosition(e, elements) : e;
              if (!p) return null;
              return e.points ? (
                <polyline
                  key={e.id}
                  points={(e.kind === 'polygon' ? [...e.points, e.points[0]] : e.points)
                    .map((p) => `${p.x},${p.y}`)
                    .join(' ')}
                  fill="none"
                  stroke="#fff"
                  strokeWidth=".15"
                  strokeDasharray=".4 .3"
                  pointerEvents="none"
                />
              ) : (
                <rect
                  key={e.id}
                  x={p.x - 0.3}
                  y={p.y - 0.3}
                  width={(e.w || 1) + 0.6}
                  height={(e.h || 1) + 0.6}
                  fill="none"
                  stroke="#fff"
                  strokeWidth=".12"
                  strokeDasharray=".4 .3"
                  pointerEvents="none"
                />
              );
            })}
        </g>
      )}
    </>
  );
}
