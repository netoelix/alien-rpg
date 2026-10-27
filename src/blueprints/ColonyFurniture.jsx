import { RailAsset } from './RailTrack.jsx';
import { CabinFurniture } from './CabinFurniture.jsx';
import { vehicleShape } from './vehicle-geometry.js';
import { vehicleAssets } from './vehicle-assets.js';
import { createElement } from 'react';
import { colonyAssets } from './colony-assets.js';
export function ColonyFurniture({
  type,
  floor,
  w = (colonyAssets[type] || vehicleAssets[type])?.w,
  h = (colonyAssets[type] || vehicleAssets[type])?.h,
}) {
  const asset = colonyAssets[type] || vehicleAssets[type];
  if (!asset) return null;
  if (['toiletCubicle', 'showerCubicle', 'securityBooth'].includes(type))
    return <CabinFurniture type={type} w={w} h={h} />;
  if (type === 'railSegment') return <RailAsset w={w} h={h} floor={floor} />;
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
        strokeWidth={vehicle ? Math.min(0.055, w / 20, h / 20) : Math.min(2, 3.5 / Math.max(w, h))}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect
          width={vehicle ? w : 100}
          height={vehicle ? h : 100}
          fill="transparent"
          stroke="none"
        />
        {shapes.flatMap(({ tag, ...props }, i) => {
          const parts = tag === 'path' ? props.d.match(/M[^M]*/g) || [props.d] : [null];
          return parts.map((d, j) =>
            createElement(tag, {
              ...props,
              ...(d ? { d } : {}),
              key: i + '-' + j,
              fill: props.fill ?? (tag === 'path' && !/z\s*$/i.test(d || '') ? 'none' : 'inherit'),
            }),
          );
        })}
      </g>
    </svg>
  );
}
