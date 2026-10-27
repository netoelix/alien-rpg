import { useId } from 'react';
import { WaterMargins } from './WaterMargins.jsx';
import { waterRegionPath } from './water.js';
export function WaterRegion({ element, floor, ink }) {
  const id = 'water-' + useId().replaceAll(':', ''),
    finish = element.floorFinish;
  const path = waterRegionPath(element.points, finish.type === 'lake');
  return (
    <g data-object={element.id} data-water-region={finish.type} color={ink}>
      <defs>
        <clipPath id={id + '-clip'}>
          <path d={path} />
        </clipPath>
      </defs>
      <path d={path} fill={floor} stroke="none" />
      <path d={path} fill={ink} fillOpacity=".08" stroke="none" />
      <path d={path} fill="none" stroke={ink} strokeWidth=".06" />
      <WaterMargins
        path={path}
        points={element.points}
        size={finish.size}
        opacity={finish.opacity}
        regular={finish.type === 'pool'}
      />
      {finish.type === 'pool' && (
        <g clipPath={`url(#${id}-clip)`} fill="none">
          <path d={path} stroke={ink} strokeWidth=".36" />
          <path d={path} stroke={floor} strokeWidth=".28" />
          <path d={path} stroke={ink} strokeWidth=".06" />
        </g>
      )}
    </g>
  );
}
