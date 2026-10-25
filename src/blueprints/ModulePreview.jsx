import { VentilationNetwork } from './Ventilation.jsx';
import { Furniture } from './Furniture.jsx';
import { furniture } from './furniture.js';
import { Dimension } from './Dimension.jsx';
import { LabelText } from './LabelText.jsx';
import { AssetSymbol } from './Assets.jsx';
import { doorPosition, wallSegments } from './model.js';
import { moduleBounds, moduleGrid } from './modules.js';
import { shapeTransform } from './orientation.js';

// Lightweight schematic, without shared SVG IDs or interactive editor handles.
export function ModuleSketch({ module }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth=".12" strokeLinejoin="round">
      {module.elements.map((element) => {
        if (element.kind === 'asset')
          return (
            <g key={element.id} transform={shapeTransform(element)}>
              <svg
                x={element.x}
                y={element.y}
                width={element.w}
                height={element.h}
                viewBox={furniture[element.asset] ? `0 0 ${element.w} ${element.h}` : '0 0 100 100'}
                strokeWidth="3"
              >
                {furniture[element.asset] ? (
                  <Furniture type={element.asset} w={element.w} h={element.h} />
                ) : (
                  <AssetSymbol type={element.asset} />
                )}
              </svg>
            </g>
          );
        if (element.kind === 'door') {
          const position = doorPosition(element, module.elements);
          if (!position) return null;
          return (
            <g
              key={element.id}
              transform={
                'translate(' + position.x + ' ' + position.y + ') rotate(' + position.rotation + ')'
              }
            >
              <path strokeWidth=".2" d={'M ' + -element.width / 2 + ' 0 H ' + element.width / 2} />
              <path
                d={'M ' + -element.width / 2 + ' -.3 V .3 M ' + element.width / 2 + ' -.3 V .3'}
              />
            </g>
          );
        }
        if (element.kind === 'vent') return null;
        if (element.kind === 'dimension') return <Dimension key={element.id} element={element} />;
        if (element.kind === 'label')
          return <LabelText key={element.id} element={element} fill="currentColor" stroke="none" />;
        return (
          <g key={element.id}>
            {wallSegments(element).map(([a, b], index) => (
              <line key={index} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            ))}
          </g>
        );
      })}
      <VentilationNetwork elements={module.elements} />
    </g>
  );
}
export function ModuleThumbnail({ module }) {
  const box = moduleBounds(module);
  return (
    <svg
      className="blueprint-module-thumbnail"
      viewBox={[box.x - 1, box.y - 1, box.w + 2, box.h + 2].join(' ')}
      role="img"
      aria-label={'Prévia esquemática de ' + module.name}
    >
      <ModuleSketch module={module} />
    </svg>
  );
}
export function ModulePlacementPreview({ module, point, project, options }) {
  const box = moduleBounds(module);
  const grid = moduleGrid(module, options);
  const valid =
    point.x >= 0 &&
    point.y >= 0 &&
    point.x + grid.w <= project.width &&
    point.y + grid.h <= project.height &&
    project.elements.length + grid.positions.length * module.elements.length <= 3000;
  return (
    <g data-editor-only="true" pointerEvents="none" color={valid ? '#f1c46c' : '#ff7373'}>
      {grid.positions.map((offset, index) => (
        <g
          key={index}
          transform={
            'translate(' + (point.x + offset.x - box.x) + ' ' + (point.y + offset.y - box.y) + ')'
          }
          opacity=".8"
        >
          {grid.positions.length * module.elements.length <= 500 ? (
            <ModuleSketch module={module} />
          ) : (
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill="none"
              stroke="currentColor"
              strokeWidth=".1"
            />
          )}
        </g>
      ))}
      <rect
        x={point.x}
        y={point.y}
        width={grid.w}
        height={grid.h}
        fill="none"
        stroke="currentColor"
        strokeWidth=".1"
        strokeDasharray=".3 .2"
      />
      {!valid && (
        <text x={point.x} y={point.y - 0.5} fill="currentColor" fontSize=".8">
          Limite da planta ou de objetos excedido
        </text>
      )}
    </g>
  );
}
