import { SanitaryFixture } from './SanitaryFixture.jsx';
export function CabinFurniture({ type, w, h }) {
  const toilet = type === 'toiletCubicle',
    shower = type === 'showerCubicle';
  const sx = w / (shower ? 1.2 : toilet ? 1.1 : 2.2),
    sy = h / (shower ? 1.8 : toilet ? 1.6 : 2.2);
  const bw = w / sx,
    bh = h / sy;
  return (
    <g transform={`scale(${sx} ${sy})`} strokeLinejoin="miter">
      <rect x=".04" y=".04" width={bw - 0.08} height={bh - 0.08} stroke="none" />
      <path
        d={`M${bw * 0.35} ${bh - 0.04}H.04V.04H${bw - 0.04}V${bh - 0.04}H${bw * 0.9}`}
        fill="none"
        strokeWidth=".08"
      />
      {toilet || shower ? (
        <g transform={`translate(${(bw - (toilet ? 0.45 : 0.9)) / 2} .14)`}>
          <SanitaryFixture
            type={toilet ? 'sanitaryToilet' : 'showerTray'}
            w={toilet ? 0.45 : 0.9}
            h={toilet ? 0.7 : 0.9}
          />
        </g>
      ) : (
        <g strokeWidth=".035">
          <rect x=".16" y=".25" width="1.88" height=".55" />
          <rect x=".4" y=".35" width=".5" height=".3" />
          <rect x=".85" y="1.02" width=".5" height=".5" rx=".08" />
          <path d="M.87 1.45H1.33" fill="none" />
          <path d="M.35 .04H1.85M.04 .4V1.3M2.16 .4V1.3" fill="none" strokeWidth=".025" />
        </g>
      )}
      <path d={`M${bw * 0.35} ${bh - 0.04}v-.5`} fill="none" strokeWidth=".025" />
    </g>
  );
}
