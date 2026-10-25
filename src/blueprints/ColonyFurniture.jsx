import { vehicleShape } from './vehicle-geometry.js';
import { vehicleAssets } from './vehicle-assets.js';
import { createElement } from 'react';
import { colonyAssets } from './colony-assets.js';
export function ColonyFurniture({
  type,
  w = (colonyAssets[type] || vehicleAssets[type])?.w,
  h = (colonyAssets[type] || vehicleAssets[type])?.h,
}) {
  const asset = colonyAssets[type] || vehicleAssets[type];
  if (!asset) return null;
  const vehicle = !!vehicleAssets[type];
  const shapes = vehicle ? asset.shapes.map((shape) => vehicleShape(shape, w, h)) : asset.shapes;
  return (
    <svg
      width={w}
      height={h}
      viewBox={vehicle ? `0 0 ${w} ${h}` : '0 0 100 100'}
      preserveAspectRatio="none"
      overflow="visible"
    >
      <g
        strokeWidth={vehicle ? Math.min(0.055, w / 20, h / 20) : Math.min(2, 2.5 / Math.max(w, h))}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect
          width={vehicle ? w : 100}
          height={vehicle ? h : 100}
          fill="transparent"
          stroke="none"
        />
        {shapes.map(({ tag, ...props }, i) =>
          createElement(tag, { ...props, key: i, fill: tag === 'path' ? 'none' : undefined }),
        )}
      </g>
    </svg>
  );
}
