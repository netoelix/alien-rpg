import { useId } from 'react';
// Thin contour bands follow the actual geometry; no repeated texture covers the center.
export function WaterMargins({
  path,
  points,
  size = 1,
  opacity = 0.3,
  riverWidth,
  regular = false,
}) {
  const id = 'water-margins-' + useId().replaceAll(':', '');
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  const span = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const distance = riverWidth
    ? Math.min(0.35, riverWidth * 0.13)
    : Math.min(size * 0.3, Math.max(0.04, span * 0.08));
  const padding = (riverWidth || size) + 1;
  const bounds = {
    x: Math.min(...xs) - padding,
    y: Math.min(...ys) - padding,
    width: Math.max(...xs) - Math.min(...xs) + padding * 2,
    height: Math.max(...ys) - Math.min(...ys) + padding * 2,
  };
  return (
    <g data-water-margins="true" opacity={opacity} pointerEvents="none">
      <defs>
        {!riverWidth && (
          <clipPath id={id + '-inside'}>
            <path d={path} />
          </clipPath>
        )}
        {[1, 2].map((n) => {
          const width = riverWidth ? riverWidth - 2 * distance * n : distance * 2 * n;
          const line = Math.min(0.045, distance * 0.18);
          return (
            <mask key={n} id={id + n} maskUnits="userSpaceOnUse" {...bounds}>
              <path
                d={path}
                fill="none"
                stroke="white"
                strokeWidth={width + line}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={
                  n === 2 && !regular
                    ? `${size * 1.4} ${size * 0.9} ${size * 0.5} ${size * 1.2}`
                    : undefined
                }
              />
              <path
                d={path}
                fill="none"
                stroke="black"
                strokeWidth={Math.max(0.001, width - line)}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </mask>
          );
        })}
      </defs>
      <g clipPath={!riverWidth ? `url(#${id}-inside)` : undefined}>
        {[1, 2].map((n) => (
          <rect key={n} {...bounds} fill="currentColor" stroke="none" mask={`url(#${id + n})`} />
        ))}
      </g>
    </g>
  );
}
