import { useId } from 'react';
import { Shape } from './FloorShape.jsx';
export function FloorFinish({ element, ink = 'currentColor' }) {
  const id = 'floor-finish-' + useId().replaceAll(':', '');
  const finish = element.floorFinish;
  if (!finish || finish.type === 'plain' || !finish.opacity) return null;
  const size = finish.size;
  return (
    <g pointerEvents="none" opacity={finish.opacity} data-floor-finish={finish.type}>
      <defs>
        <pattern
          id={id}
          width={size}
          height={finish.type === 'plates' ? size * 2 : size}
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={ink} strokeWidth={Math.min(0.025, size * 0.04)}>
            {finish.type === 'tiles' && <path d={`M${size} 0H0V${size}`} />}
            {finish.type === 'plates' && (
              <>
                <path d={`M${size} 0H0V${size * 2}M0 ${size * 2}H${size}`} />
                <path
                  d={`M${size * 0.1} ${size * 0.1}h${size * 0.12}M${size * 0.78} ${size * 0.1}h${size * 0.12}M${size * 0.1} ${size * 1.9}h${size * 0.12}M${size * 0.78} ${size * 1.9}h${size * 0.12}`}
                />
              </>
            )}
            {finish.type === 'grating' && (
              <>
                {[0, 0.25, 0.5, 0.75].map((t) => (
                  <path key={t} d={`M${size * t} 0V${size}`} />
                ))}
                <path d={`M0 0H${size}M0 ${size * 0.5}H${size}`} />
              </>
            )}
          </g>
        </pattern>
      </defs>
      <Shape element={element} seamOverlap paint={`url(#${id})`} />
    </g>
  );
}
