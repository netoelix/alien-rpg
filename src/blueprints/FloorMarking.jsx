import { useId } from 'react';
import { floorMarkings } from './floor-markings.js';
export function FloorMarking({ type, w = floorMarkings[type]?.w, h = floorMarkings[type]?.h }) {
  const id = 'floor-stripe-' + useId().replaceAll(':', '');
  const edge = Math.min(0.04, w / 15, h / 15);
  return (
    <g fill="none" strokeWidth={edge}>
      <rect width={w} height={h} fill="transparent" stroke="none" />
      {type === 'hazardStripe' && (
        <>
          <defs>
            <pattern id={id} width=".4" height=".4" patternUnits="userSpaceOnUse">
              <path d="M-.1 .4L.3 0M.3 .4L.7 0" strokeWidth=".14" />
            </pattern>
          </defs>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} fill={`url(#${id})`} />
        </>
      )}
      {type === 'floorArrow' && (
        <path
          d={`M${w * 0.38} ${h * 0.96}V${h * 0.4}H${w * 0.08}L${w * 0.5} ${h * 0.04}L${w * 0.92} ${h * 0.4}H${w * 0.62}V${h * 0.96}Z`}
        />
      )}
      {type === 'loadingZone' && (
        <>
          <rect
            x={edge}
            y={edge}
            width={w - edge * 2}
            height={h - edge * 2}
            strokeDasharray=".3 .15"
          />
          <path
            d={`M${w * 0.25} ${edge * 3}H${edge * 3}V${h * 0.25}M${w * 0.75} ${edge * 3}H${w - edge * 3}V${h * 0.25}M${w * 0.25} ${h - edge * 3}H${edge * 3}V${h * 0.75}M${w * 0.75} ${h - edge * 3}H${w - edge * 3}V${h * 0.75}`}
          />
        </>
      )}
      {type === 'walkwayMark' && (
        <>
          <path d={`M${edge} 0V${h}M${w - edge} 0V${h}`} />
          <path d={`M${w / 2} 0V${h}`} strokeDasharray=".35 .45" />
        </>
      )}
    </g>
  );
}
