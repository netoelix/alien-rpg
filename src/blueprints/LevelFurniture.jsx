import { useId } from 'react';
import { levelAssets, stepPositions, isPlatform } from './level-assets.js';
export function LevelFurniture({ type, w = levelAssets[type]?.w, h = levelAssets[type]?.h }) {
  const id = 'level-grid-' + useId().replaceAll(':', '');
  const inset = Math.min(0.12, w / 8, h / 8),
    edge = Math.min(0.035, w / 20, h / 20);
  return (
    <g strokeWidth={edge} strokeLinejoin="round">
      <rect width={w} height={h} fill="transparent" stroke="none" />
      {isPlatform(type) && (
        <>
          <rect x={edge} y={edge} width={w - edge * 2} height={h - edge * 2} rx={inset / 3} />
          <rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} fill="none" />
          {type === 'gratedPlatform' && (
            <>
              <defs>
                <pattern id={id} width=".25" height=".25" patternUnits="userSpaceOnUse">
                  <path d="M0 .25V0H.25" fill="none" strokeWidth=".018" strokeOpacity=".4" />
                </pattern>
              </defs>
              <rect
                x={inset}
                y={inset}
                width={w - inset * 2}
                height={h - inset * 2}
                fill={`url(#${id})`}
                stroke="none"
              />
            </>
          )}
          {[inset * 2, w - inset * 2].flatMap((x) =>
            [inset * 2, h - inset * 2].map((y) => (
              <circle key={x + ',' + y} cx={x} cy={y} r={edge} fill="none" />
            )),
          )}
        </>
      )}
      {['shortSteps', 'stairFlight'].includes(type) && (
        <>
          <rect x={edge} y={edge} width={w - edge * 2} height={h - edge * 2} />
          <path d={`M${inset} 0V${h}M${w - inset} 0V${h}`} fill="none" />
          {stepPositions(h).map((y) => (
            <path key={y} d={`M${inset} ${y}H${w - inset}`} fill="none" />
          ))}
          <path
            d={`M${w * 0.5} ${h * 0.85}V${h * 0.18}M${w * 0.36} ${h * 0.32}L${w * 0.5} ${h * 0.18}L${w * 0.64} ${h * 0.32}`}
            fill="none"
            strokeWidth={edge * 1.6}
          />
        </>
      )}
      {type === 'accessRamp' && (
        <>
          <rect x={edge} y={edge} width={w - edge * 2} height={h - edge * 2} />
          <path
            d={`M${inset} ${h - inset}L${w / 2} ${inset}L${w - inset} ${h - inset}M${w / 2} ${h * 0.8}V${h * 0.25}M${w * 0.4} ${h * 0.38}L${w / 2} ${h * 0.25}L${w * 0.6} ${h * 0.38}`}
            fill="none"
          />
          <path d={`M${inset} 0V${h}M${w - inset} 0V${h}`} fill="none" />
        </>
      )}
      {type === 'levelEdge' && (
        <g fill="none">
          <path d={`M0 ${edge}H${w}`} strokeWidth={edge * 2} />
          {stepPositions(w).map((x) => (
            <path key={x} d={`M${x} ${edge}v${h * 0.75}`} />
          ))}
        </g>
      )}
    </g>
  );
}
