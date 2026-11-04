import { memo } from 'react';
import { Furniture } from './Furniture.jsx';
import { furniture } from './furniture.js';
import { AssetSymbol } from './Assets.jsx';
import { floorMarkings } from './floor-markings.js';

export function assetShapeId(prefix, element) {
  return prefix + '-' + element.asset + '-' + element.w + '-' + element.h;
}

// Shared SVG definitions reduce repeated geometry in dense maps and exports.
export const AssetDefinitions = memo(
  function AssetDefinitions({ elements, prefix, floor }) {
    const shapes = new Map();
    for (const element of elements) {
      if (element.kind === 'asset') shapes.set(assetShapeId(prefix, element), element);
    }
    return (
      <defs>
        {[...shapes].map(([id, element]) => (
          <g id={id} key={id}>
            {furniture[element.asset] ? (
              <Furniture type={element.asset} w={element.w} h={element.h} floor={floor} />
            ) : (
              <>
                <rect width="100" height="100" fill="transparent" stroke="none" />
                <AssetSymbol type={element.asset} />
              </>
            )}
          </g>
        ))}
      </defs>
    );
  },
  (a, b) => a.prefix === b.prefix && a.floor === b.floor && sameAssetShapes(a.elements, b.elements),
);

function sameAssetShapes(a, b) {
  if (a === b) return true;
  const keys = (elements) =>
    new Set(elements.filter((e) => e.kind === 'asset').map((e) => assetShapeId('', e)));
  const left = keys(a),
    right = keys(b);
  return left.size === right.size && [...left].every((key) => right.has(key));
}

export const DrawingAsset = memo(function DrawingAsset({ element: e, prefix, palette }) {
  const physical = Boolean(furniture[e.asset]);
  const ink = physical && floorMarkings[e.asset] ? palette.accent : palette.ink;
  return (
    <g
      data-object={e.id}
      transform={`translate(${e.x + e.w / 2} ${e.y + e.h / 2}) rotate(${e.rotation}) translate(${-e.w / 2} ${-e.h / 2})`}
    >
      <svg
        width={e.w}
        height={e.h}
        viewBox={physical ? `0 0 ${e.w} ${e.h}` : '0 0 100 100'}
        overflow={physical ? 'visible' : undefined}
        preserveAspectRatio={physical ? undefined : 'none'}
        fill={palette.floor}
        stroke={ink}
        color={physical ? ink : undefined}
        strokeWidth={physical ? undefined : 2}
      >
        <use href={'#' + assetShapeId(prefix, e)} />
      </svg>
    </g>
  );
});
