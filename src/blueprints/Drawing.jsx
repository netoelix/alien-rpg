import { shapeTransform } from './orientation.js';
import { resizeHandles } from './resize.js';
import {
  corridorCorners,
  openingGeometry,
  wallRuns,
  wallTransitions,
  sharedWallJunctions,
  partitionEndCaps,
  wallWidths,
} from './wall-geometry.js';
import { AssetSymbol } from './Assets.jsx';
import { sharedWallStructures, persistentWallStructure } from './shared-walls.js';
import { doorPosition, layerFor, wallSections } from './model.js';
export const palettes = {
  green: { background: '#04120d', floor: '#102c24', ink: '#78ebae', accent: '#f1c46c' },
  blue: { background: '#071421', floor: '#102c40', ink: '#71d9f4', accent: '#f5cd7c' },
  print: { background: '#ffffff', floor: '#f1f3f4', ink: '#14252c', accent: '#555555' },
};
function Shape({ element, outer = false, seamOverlap = false }) {
  // Tiny rendering overlap closes antialiasing seams at coincident boundaries.
  // Geometry, snapping and saved dimensions remain unchanged.
  const outline = outer ? 0.4 : seamOverlap ? 0.06 : 0;
  if (element.kind === 'polygon')
    return (
      <polygon
        points={element.points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={outline}
        strokeLinejoin="round"
      />
    );
  if (element.kind === 'corridor')
    return (
      <polyline
        points={element.points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={element.width + outline}
        strokeLinejoin="round"
        strokeLinecap={seamOverlap ? 'square' : 'butt'}
      />
    );
  const { x, y, w, h } = element;
  const common = {
    transform: shapeTransform(element),
    fill: 'currentColor',
    stroke: 'currentColor',
    strokeWidth: outline,
  };
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
  wallSelection = null,
  arcSelection = null,
  editVertices = false,
  handleRadius = 0.4,
}) {
  const palette = palettes[project.theme];
  const elements = [...project.elements, ...preview];
  const visible = (id) => project.layers.find((l) => l.id === id)?.visible;
  const opacity = (id) => project.layers.find((l) => l.id === id)?.opacity ?? 1;
  const structure = elements
    .filter((e) => layerFor(e.kind) === 'structure')
    .map(persistentWallStructure);
  const sharedStructure = sharedWallStructures(structure);
  const sections = structure.flatMap((element) =>
    wallSections(element).map((wall) => ({ ...wall, id: element.id })),
  );
  const line = (wall) => ({ x1: wall.a[0], y1: wall.a[1], x2: wall.b[0], y2: wall.b[1] });
  const doors = elements.filter((e) => e.kind === 'door');
  const position = (e) => {
    const p = openingGeometry(e, elements);
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
          id="blueprint-junction-outside"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={project.width}
          height={project.height}
        >
          <rect width={project.width} height={project.height} fill="white" />
          <g color="black">
            {structure.map((element) => (
              <Shape key={element.id} element={element} />
            ))}
          </g>
        </mask>
        {structure.map((element, index) =>
          element.walls?.length ? (
            <mask
              key={element.id}
              id={'blueprint-replace-' + index}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={project.width}
              height={project.height}
            >
              <rect width={project.width} height={project.height} fill="white" />
              {wallSections(element).map((wall) => (
                <line
                  key={`${wall.segment}:${wall.start}`}
                  {...line(wall)}
                  stroke="black"
                  strokeWidth=".8"
                />
              ))}
              {corridorCorners(element).map((corner, cornerIndex) => (
                <path
                  key={`corner-${cornerIndex}`}
                  d={corner.d}
                  fill="none"
                  stroke="black"
                  strokeWidth=".8"
                />
              ))}
            </mask>
          ) : null,
        )}
        <mask
          id="blueprint-walls"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={project.width}
          height={project.height}
        >
          <g color="white">
            {structure.map((e, index) => (
              <g
                key={e.id}
                mask={e.walls?.length ? 'url(#blueprint-replace-' + index + ')' : undefined}
              >
                <Shape element={e} outer />
              </g>
            ))}
          </g>
          <g color="black">
            {structure.map((e) => (
              <Shape key={e.id} element={e} seamOverlap />
            ))}
          </g>
          {doors.map(
            (e) =>
              doorPosition(e, elements) && (
                <rect
                  key={e.id}
                  transform={position(e)}
                  x={-e.width / 2}
                  y={-openingGeometry(e, elements).frameDepth}
                  width={e.width}
                  height={2 * openingGeometry(e, elements).frameDepth}
                  fill="black"
                />
              ),
          )}
        </mask>
        <mask
          id="blueprint-section-cuts"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={project.width}
          height={project.height}
        >
          <rect width={project.width} height={project.height} fill="white" />
          {sections
            .filter((wall) => wall.type === 'open')
            .map((wall) => (
              <line
                key={wall.id + ':' + wall.segment + ':' + wall.start}
                {...line(wall)}
                stroke="black"
                strokeWidth="1.2"
              />
            ))}
          {doors.map(
            (door) =>
              doorPosition(door, elements) && (
                <rect
                  key={door.id}
                  transform={position(door)}
                  x={-door.width / 2}
                  y={-openingGeometry(door, elements).frameDepth}
                  width={door.width}
                  height={2 * openingGeometry(door, elements).frameDepth}
                  fill="black"
                />
              ),
          )}
        </mask>
        {structure.map((element, index) =>
          element.walls?.length ? (
            <mask
              key={element.id}
              id={'blueprint-outside-' + index}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={project.width}
              height={project.height}
            >
              <rect width={project.width} height={project.height} fill="white" />
              <g color="black">
                {(element.joinWalls ? structure : [element]).map((floor) => (
                  <Shape key={floor.id} element={floor} seamOverlap={element.joinWalls} />
                ))}
              </g>
            </mask>
          ) : null,
        )}
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
              <Shape key={e.id} element={e} seamOverlap />
            ))}
          </g>
          <rect
            width={project.width}
            height={project.height}
            fill={palette.ink}
            mask="url(#blueprint-walls)"
          />
          <g mask="url(#blueprint-section-cuts)" fill="none" stroke={palette.ink}>
            <g mask="url(#blueprint-junction-outside)" fill={palette.ink} stroke="none">
              {sharedWallJunctions(structure).map((joint, index) => (
                <rect
                  key={index}
                  x={joint.x - joint.radius}
                  y={joint.y - joint.radius}
                  width={2 * joint.radius}
                  height={2 * joint.radius}
                />
              ))}
            </g>
            {sharedStructure.map((element, index) => (
              <g
                key={element.id}
                mask={element.walls?.length ? 'url(#blueprint-outside-' + index + ')' : undefined}
                strokeLinejoin="round"
                strokeLinecap="butt"
              >
                {wallTransitions(structure[index]).map((joint, jointIndex) => (
                  <rect
                    key={`transition-${jointIndex}`}
                    x={joint.x - joint.radius}
                    y={joint.y - joint.radius}
                    width={2 * joint.radius}
                    height={2 * joint.radius}
                    fill={palette.ink}
                    stroke="none"
                  />
                ))}
                {[...partitionEndCaps(element, structure), ...wallRuns(element)].map(
                  (run, runIndex) => (
                    <g key={runIndex}>
                      <path d={run.d} strokeWidth={2 * wallWidths[run.type]} />
                      {run.type === 'hull' && (
                        <>
                          <path d={run.d} stroke={palette.floor} strokeWidth=".95" />
                          <path d={run.d} strokeWidth=".28" />
                        </>
                      )}
                      {run.type === 'glass' && (
                        <path
                          d={run.d}
                          stroke={palette.accent}
                          strokeWidth=".4"
                          strokeDasharray=".3 .2"
                        />
                      )}
                    </g>
                  ),
                )}
              </g>
            ))}
          </g>
          {doors.map((door) => {
            const geometry = openingGeometry(door, elements);
            if (!geometry) return null;
            const reach = geometry.depth / 2 + 0.03;
            return (
              <rect
                key={`threshold-${door.id}`}
                transform={position(door)}
                x={-door.width / 2}
                y={geometry.floorSide > 0 ? 0 : -reach}
                width={door.width}
                height={reach}
                fill={palette.floor}
              />
            );
          })}
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
                    stroke={e.openingType === 'window' ? palette.ink : undefined}
                    d={`M ${-e.width / 2} ${-openingGeometry(e, elements).frameDepth} V ${openingGeometry(e, elements).frameDepth} M ${e.width / 2} ${-openingGeometry(e, elements).frameDepth} V ${openingGeometry(e, elements).frameDepth} M ${-e.width / 2} -.12 H ${e.width / 2} V .12 H ${-e.width / 2} Z`}
                  />
                  {e.openingType === 'window' && (
                    <path d={`M ${-e.width / 2} 0 H ${e.width / 2}`} stroke={palette.ink} />
                  )}
                  <rect
                    x={-e.width / 2}
                    y={-openingGeometry(e, elements).frameDepth}
                    width={e.width}
                    height={2 * openingGeometry(e, elements).frameDepth}
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
              const p = e.kind === 'door' ? openingGeometry(e, elements) : e;
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
                  transform={
                    ['room', 'ellipse', 'asset'].includes(e.kind) ? shapeTransform(e) : undefined
                  }
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
      {arcSelection &&
        visible('structure') &&
        (() => {
          const element = elements.find((item) => item.id === arcSelection.id);
          const { start, end } = arcSelection;
          if (
            element?.kind !== 'ellipse' ||
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            start < 0 ||
            start >= 360 ||
            end <= start ||
            end > start + 360
          )
            return null;
          const at = (angle) => {
            const radians = (angle * Math.PI) / 180;
            return `${element.x + element.w / 2 + (Math.cos(radians) * element.w) / 2} ${element.y + element.h / 2 + (Math.sin(radians) * element.h) / 2}`;
          };
          const middle = (start + end) / 2;
          const arc = (angle) => `A ${element.w / 2} ${element.h / 2} 0 0 1 ${at(angle)}`;
          return (
            <path
              data-editor-only="true"
              d={`M ${at(start)} ${arc(middle)} ${arc(end)}`}
              transform={shapeTransform(element)}
              fill="none"
              stroke="#fff"
              strokeWidth=".18"
              strokeDasharray=".3 .2"
              pointerEvents="none"
            />
          );
        })()}
      {wallSelection &&
        !arcSelection &&
        visible('structure') &&
        (() => {
          const element = elements.find((e) => e.id === wallSelection.id);
          const section = element && wallSections({ ...element, walls: [wallSelection] })[0];
          return section ? (
            <line
              data-editor-only="true"
              {...line(section)}
              stroke="#fff"
              strokeWidth=".18"
              strokeDasharray=".3 .2"
              pointerEvents="none"
            />
          ) : null;
        })()}
      {interactive && editVertices && (
        <g data-editor-only="true">
          {elements
            .filter((element) => element.id === selected && element.points)
            .flatMap((element) =>
              element.points.map((point, index) => (
                <circle
                  key={`${element.id}-${index}`}
                  data-vertex={index}
                  data-object={element.id}
                  cx={point.x}
                  cy={point.y}
                  r={handleRadius}
                  fill={palette.background}
                  stroke="#fff"
                  strokeWidth={handleRadius / 4}
                  style={{ cursor: 'crosshair' }}
                >
                  <title>Vértice {index + 1}: arraste para ajustar</title>
                </circle>
              )),
            )}
        </g>
      )}
      {interactive &&
        editVertices &&
        elements
          .filter(
            (element) =>
              element.id === selected && ['room', 'ellipse', 'asset'].includes(element.kind),
          )
          .map((element) => (
            <g
              key={`handles-${element.id}`}
              data-editor-only="true"
              data-object={element.id}
              transform={shapeTransform(element)}
            >
              {resizeHandles
                .filter((handle) => {
                  if (element.kind === 'asset' || Math.min(element.w, element.h) < handleRadius * 4)
                    return handle.id === 'se';
                  if (handle.id.length === 2) return true;
                  return (
                    (['n', 's'].includes(handle.id) ? element.w : element.h) >= handleRadius * 8
                  );
                })
                .map((handle) => (
                  <rect
                    key={handle.id}
                    data-transform="resize"
                    data-resize-handle={handle.id}
                    x={element.x + element.w * handle.x - handleRadius}
                    y={element.y + element.h * handle.y - handleRadius}
                    width={handleRadius * 2}
                    height={handleRadius * 2}
                    fill={palette.accent}
                    stroke={palette.background}
                    strokeWidth=".1"
                    style={{ cursor: handle.cursor }}
                  >
                    <title>
                      {handle.label}: arraste para redimensionar. Shift nos cantos mantém a
                      proporção. Equipamentos internos mantêm suas medidas e posições.
                    </title>
                  </rect>
                ))}
              {true && (
                <g data-transform="rotate" style={{ cursor: 'pointer' }}>
                  <circle
                    cx={element.x + element.w / 2}
                    cy={element.y - handleRadius * 3}
                    r={handleRadius * 1.5}
                    fill={palette.background}
                    stroke={palette.accent}
                    strokeWidth=".1"
                  />
                  <text
                    x={element.x + element.w / 2}
                    y={element.y - handleRadius * 3}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={palette.accent}
                    fontSize={handleRadius * 2}
                  >
                    ↻
                  </text>
                  <title>{'Arraste para girar; Shift: passos de 15°. Escape cancela.'}</title>
                </g>
              )}
            </g>
          ))}
    </>
  );
}
