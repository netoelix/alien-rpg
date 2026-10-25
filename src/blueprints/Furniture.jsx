import { EnvironmentFurniture } from './EnvironmentFurniture.jsx';
import { environmentAssets } from './environment-assets.js';
import { furniture } from './furniture.js';
export function Furniture({ type, w = furniture[type]?.w, h = furniture[type]?.h }) {
  if (environmentAssets[type]) return <EnvironmentFurniture type={type} w={w} h={h} />;
  const edge = Math.min(0.035, w / 15, h / 15),
    inset = Math.min(0.08, w / 8, h / 8);
  return (
    <g strokeWidth={edge} strokeLinejoin="round">
      <rect width={w} height={h} fill="transparent" stroke="none" />
      {type === 'surveillanceCamera' && (
        <>
          <rect x={w * 0.25} y={h * 0.03} width={w * 0.5} height={h * 0.09} />
          <path d={`M${w * 0.44} ${h * 0.12}V${h * 0.37}H${w * 0.56}V${h * 0.12}Z`} />
          <path d={`M${w * 0.1} ${h * 0.3}H${w * 0.9}V${h * 0.78}H${w * 0.1}Z`} />
          <rect x={w * 0.27} y={h * 0.78} width={w * 0.46} height={h * 0.15} />
          <path
            d={`M${w * 0.04} ${h * 0.72}V${h * 0.97}H${w * 0.96}V${h * 0.72} M${w * 0.22} ${h * 0.42}H${w * 0.78} M${w * 0.22} ${h * 0.5}H${w * 0.78}`}
            fill="none"
          />
        </>
      )}
      {type === 'crtStation' && (
        <>
          <path d={`M${w * 0.2} ${h * 0.04}H${w * 0.8}L${w * 0.93} ${h * 0.62}H${w * 0.07}Z`} />
          <path
            d={`M${w * 0.14} ${h * 0.51}H${w * 0.86} M${w * 0.28} ${h * 0.15}H${w * 0.72} M${w * 0.25} ${h * 0.23}H${w * 0.75}`}
            fill="none"
          />
          <rect x={w * 0.06} y={h * 0.72} width={w * 0.88} height={h * 0.23} rx={inset / 3} />
          <path
            d={`M${w * 0.15} ${h * 0.8}H${w * 0.85} M${w * 0.23} ${h * 0.88}H${w * 0.7}`}
            fill="none"
          />
        </>
      )}
      {type === 'communicationsRadio' && (
        <>
          <rect x={w * 0.05} y={h * 0.12} width={w * 0.9} height={h * 0.82} rx={inset / 3} />
          {[0.25, 0.35, 0.45, 0.55].map((x) => (
            <path key={x} d={`M${w * x} ${h * 0.25}V${h * 0.65}`} fill="none" />
          ))}
          <path
            d={`M${w * 0.12} ${h * 0.12}V${edge} M${w * 0.65} ${h * 0.25}H${w * 0.85}V${h * 0.52}H${w * 0.65}Z`}
            fill="none"
          />
          <circle cx={w * 0.75} cy={h * 0.76} r={Math.min(w, h) * 0.07} />
        </>
      )}
      {type === 'reportPrinter' && (
        <>
          <rect x={w * 0.04} y={h * 0.2} width={w * 0.92} height={h * 0.75} rx={inset / 2} />
          <rect x={w * 0.2} y={edge / 2} width={w * 0.6} height={h * 0.43} />
          <path
            d={`M${w * 0.12} ${h * 0.46}H${w * 0.88} M${w * 0.2} ${h * 0.65}H${w * 0.8} M${w * 0.25} ${h * 0.75}H${w * 0.75}`}
            fill="none"
          />
        </>
      )}
      {type === 'dataTapeCabinet' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path d={`M0 ${inset}H${w} M0 ${h - inset}H${w}`} fill="none" />
          {[0.18, 0.34, 0.5, 0.66, 0.82].map((x) => (
            <g key={x}>
              <rect x={w * (x - 0.055)} y={h * 0.3} width={w * 0.11} height={h * 0.42} />
              <path d={`M${w * (x - 0.03)} ${h * 0.4}H${w * (x + 0.03)}`} fill="none" />
            </g>
          ))}
        </>
      )}
      {type === 'labIncubator' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <rect x={w * 0.12} y={h * 0.12} width={w * 0.76} height={h * 0.62} rx={inset / 2} />
          <path d={`M${w * 0.3} ${h * 0.85}H${w * 0.7}`} fill="none" />
        </>
      )}
      {type === 'sampleFreezer' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset / 2} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} rx={inset / 2} />
          <path
            d={`M${w / 2} ${inset}V${h - inset} M${w * 0.2} ${h * 0.8}H${w * 0.3} M${w * 0.7} ${h * 0.8}H${w * 0.8}`}
            fill="none"
          />
        </>
      )}
      {type === 'tubeRack' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          {[0.2, 0.4, 0.6, 0.8].flatMap((x) =>
            [0.3, 0.7].map((y) => (
              <circle key={x + '-' + y} cx={w * x} cy={h * y} r={Math.min(w * 0.055, h * 0.1)} />
            )),
          )}
        </>
      )}
      {type === 'securityMonitor' && (
        <>
          <path
            d={`M${edge / 2} ${h - edge / 2}V${h * 0.2}L${w * 0.15} ${edge / 2}H${w * 0.85}L${w - edge / 2} ${h * 0.2}V${h - edge / 2}Z`}
          />
          {[0.08, 0.38, 0.68].map((x) => (
            <rect key={x} x={w * x} y={h * 0.2} width={w * 0.24} height={h * 0.34} rx={inset / 3} />
          ))}
          <path d={`M${w * 0.2} ${h * 0.75}H${w * 0.8}`} fill="none" />
        </>
      )}
      {type === 'securitySafe' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path
            d={`M${inset} ${h - inset}V${inset}H${w - inset}V${h - inset}Z M${inset} ${h * 0.75}H${w - inset}`}
            fill="none"
          />
          <rect x={w * 0.37} y={h * 0.82} width={w * 0.26} height={h * 0.08} />
        </>
      )}
      {type === 'protectionShield' && (
        <>
          <path
            d={`M${w * 0.15} ${edge / 2}H${w * 0.85}L${w - edge / 2} ${h * 0.15}V${h * 0.82}L${w * 0.8} ${h - edge / 2}H${w * 0.2}L${edge / 2} ${h * 0.82}V${h * 0.15}Z`}
          />
          <rect x={w * 0.2} y={h * 0.18} width={w * 0.6} height={h * 0.16} rx={inset / 2} />
          <path d={`M${w * 0.3} ${h * 0.65}H${w * 0.7}`} fill="none" />
        </>
      )}
      {type === 'weaponLocker' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path d={`M0 ${inset}H${w} M0 ${h - inset}H${w}`} fill="none" />
          {[0.15, 0.38, 0.61, 0.84].map((x) => (
            <g key={x}>
              <path
                d={`M${w * x} ${h * 0.2}V${h * 0.7}l${w * 0.035} ${h * 0.12}h${-w * 0.07}V${h * 0.58}h${w * 0.07} M${w * x} ${h * 0.44}h${w * 0.045}v${h * 0.15}`}
                fill="none"
              />
            </g>
          ))}
        </>
      )}
      {type === 'gearStand' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          {[0.22, 0.5, 0.78].map((x) => (
            <g key={x}>
              <ellipse cx={w * x} cy={h * 0.35} rx={w * 0.09} ry={h * 0.16} />
              <path
                d={`M${w * (x - 0.1)} ${h * 0.58}h${w * 0.2}v${h * 0.25}h${-w * 0.2}Z`}
                fill="none"
              />
            </g>
          ))}
        </>
      )}
      {type === 'inspectionBench' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <rect x={w * 0.08} y={h * 0.16} width={w * 0.58} height={h * 0.68} rx={inset} />
          <rect x={w * 0.75} y={h * 0.22} width={w * 0.17} height={h * 0.32} rx={inset / 2} />
          <path d={`M${w * 0.75} ${h * 0.7}H${w * 0.92}`} fill="none" />
        </>
      )}
      {type === 'labCentrifuge' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <circle cx={w / 2} cy={h * 0.43} r={Math.min(w * 0.36, h * 0.31)} />
          <circle cx={w / 2} cy={h * 0.43} r={Math.min(w, h) * 0.1} />
          <path d={`M${w * 0.25} ${h * 0.86}H${w * 0.65}`} fill="none" />
        </>
      )}
      {type === 'labMicroscope' && (
        <>
          <path
            d={`M${w * 0.2} ${h * 0.12}H${w * 0.8}L${w * 0.95} ${h * 0.9}Q${w / 2} ${h} ${w * 0.05} ${h * 0.9}Z`}
          />
          <rect x={w * 0.2} y={h * 0.4} width={w * 0.6} height={h * 0.2} />
          <path d={`M${w * 0.4} ${h * 0.12}H${w * 0.6}V${h * 0.48}H${w * 0.4}Z`} />
          <circle cx={w * 0.8} cy={h * 0.68} r={Math.min(w, h) * 0.09} />
        </>
      )}
      {type === 'sampleAnalyzer' && (
        <>
          <path
            d={`M${edge / 2} ${h - edge / 2}V${inset}L${inset} ${edge / 2}H${w - inset}L${w - edge / 2} ${inset}V${h - edge / 2}Z`}
          />
          <rect x={w * 0.08} y={h * 0.15} width={w * 0.52} height={h * 0.65} rx={inset / 2} />
          <rect x={w * 0.68} y={h * 0.18} width={w * 0.23} height={h * 0.27} />
          {[0.62, 0.76].map((y) => (
            <path key={y} d={`M${w * 0.7} ${h * y}H${w * 0.88}`} fill="none" />
          ))}
        </>
      )}
      {type === 'dissectionTable' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} rx={inset / 2} />
          <path d={`M${w / 2} ${h * 0.15}V${h * 0.8}`} fill="none" />
          {[0.25, 0.4, 0.55, 0.7].map((y) => (
            <path
              key={y}
              d={`M${inset * 1.5} ${h * y}L${w / 2} ${h * (y + 0.05)}L${w - inset * 1.5} ${h * y}`}
              fill="none"
            />
          ))}
          <circle cx={w / 2} cy={h * 0.88} r={Math.min(0.05, w * 0.06)} />
        </>
      )}
      {['loungeSofa', 'loungeArmchair'].includes(type) && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <path
            d={`M${inset} ${h - edge}V${h * 0.25}H${w - inset}V${h - edge} M${inset} ${h * 0.85}H${w - inset}`}
            fill="none"
          />
          {type === 'loungeSofa' && (
            <path
              d={`M${w / 3} ${h * 0.25}V${h * 0.85} M${(w * 2) / 3} ${h * 0.25}V${h * 0.85}`}
              fill="none"
            />
          )}
        </>
      )}
      {type === 'sideTable' && (
        <>
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - edge} ry={h / 2 - edge} />
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - inset} ry={h / 2 - inset} fill="none" />
        </>
      )}
      {type === 'lowCabinet' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path
            d={`M0 ${h - inset}H${w} M${w / 2} ${h - inset}V${h - edge} M${w * 0.38} ${h - inset / 2}H${w * 0.46} M${w * 0.54} ${h - inset / 2}H${w * 0.62}`}
            fill="none"
          />
        </>
      )}
      {type === 'labSinkBench' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path d={`M0 ${inset}H${w} M0 ${h - inset}H${w}`} fill="none" />
          <rect x={w * 0.08} y={h * 0.25} width={w * 0.28} height={h * 0.5} rx={inset} />
          <path d={`M${w * 0.22} ${inset}V${h * 0.35}`} fill="none" />
          <rect x={w * 0.58} y={h * 0.3} width={w * 0.28} height={h * 0.4} rx={inset / 2} />
        </>
      )}
      {type === 'sampleFridge' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset / 2} />
          <path
            d={`M${inset} ${inset}H${w - inset} M${edge} ${h - inset}H${w - edge}`}
            fill="none"
          />
          <rect
            x={w * 0.62}
            y={h - inset * 0.7}
            width={w * 0.2}
            height={inset * 0.35}
            rx={inset * 0.1}
          />
          {[0.2, 0.3, 0.4].map((y) => (
            <path key={y} d={`M${w * 0.2} ${h * y}H${w * 0.8}`} fill="none" />
          ))}
        </>
      )}
      {type === 'analysisCabinet' && (
        <>
          <path
            d={`M${edge / 2} ${h - edge / 2}V${inset}L${inset} ${edge / 2}H${w - inset}L${w - edge / 2} ${inset}V${h - edge / 2}Z`}
          />
          <rect x={inset} y={h * 0.22} width={w - 2 * inset} height={h * 0.62} />
          {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((x) => (
            <path key={x} d={`M${w * x} ${h * 0.07}V${h * 0.15}`} fill="none" />
          ))}
          <path d={`M${inset} ${h * 0.72}H${w - inset}`} fill="none" />
        </>
      )}
      {type === 'securityLocker' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path
            d={`M0 ${inset}H${w} M${w / 3} ${inset}V${h - edge} M${(w * 2) / 3} ${inset}V${h - edge}`}
            fill="none"
          />
          {[1 / 6, 1 / 2, 5 / 6].map((x) => (
            <path
              key={x}
              d={`M${w * x - inset / 2} ${h - inset}H${w * x + inset / 2}`}
              fill="none"
            />
          ))}
        </>
      )}
      {type === 'cargoContainer' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} fill="none" />
          {Array.from({ length: Math.min(24, Math.max(2, Math.floor(h / 0.4))) }, (_, i) => {
            const count = Math.min(24, Math.max(2, Math.floor(h / 0.4)));
            const y = inset + ((h - 2 * inset) * (i + 1)) / (count + 1);
            return <path key={i} d={`M${inset} ${y}H${w - inset}`} fill="none" />;
          })}
          <path
            d={`M${w * 0.3} ${h - inset}V${h - edge} M${w * 0.7} ${h - inset}V${h - edge}`}
            fill="none"
          />
        </>
      )}
      {type === 'reinforcedCrate' && (
        <>
          <path
            d={`M${inset} ${edge / 2}H${w - inset}L${w - edge / 2} ${inset}V${h - inset}L${w - inset} ${h - edge / 2}H${inset}L${edge / 2} ${h - inset}V${inset}Z`}
          />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} />
          <path
            d={`M${inset} ${inset}L${w - inset} ${h - inset} M${w - inset} ${inset}L${inset} ${h - inset}`}
            fill="none"
          />
        </>
      )}
      {type === 'horizontalTank' && (
        <>
          <rect
            x={inset}
            y={edge / 2}
            width={w - 2 * inset}
            height={h - edge}
            rx={Math.min((w - 2 * inset) / 2, h * 0.25)}
          />
          {[0.3, 0.7].map((y) => (
            <g key={y}>
              <rect x={edge / 2} y={h * y - inset / 2} width={w - edge} height={inset} />
            </g>
          ))}
          <circle cx={w / 2} cy={h * 0.5} r={Math.min(w * 0.13, h * 0.1)} />
        </>
      )}
      {type === 'airCompressor' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <rect
            x={w * 0.12}
            y={h * 0.1}
            width={w * 0.4}
            height={h * 0.8}
            rx={Math.min(w * 0.2, h * 0.2)}
          />
          <rect x={w * 0.62} y={h * 0.15} width={w * 0.27} height={h * 0.4} rx={inset / 2} />
          <path
            d={`M${w * 0.52} ${h * 0.3}H${w * 0.62} M${w * 0.7} ${h * 0.55}V${h * 0.8}H${w * 0.52}`}
            fill="none"
          />
          {[0.25, 0.35, 0.45].map((y) => (
            <path key={y} d={`M${w * 0.66} ${h * y}H${w * 0.85}`} fill="none" />
          ))}
        </>
      )}
      {type === 'cryoPodPlan' && (
        <>
          <rect
            x={edge / 2}
            y={edge / 2}
            width={w - edge}
            height={h - edge}
            rx={Math.min(w * 0.43, h * 0.22)}
          />
          <rect
            x={w * 0.15}
            y={h * 0.1}
            width={w * 0.7}
            height={h * 0.7}
            rx={Math.min(w * 0.3, h * 0.15)}
          />
          <path
            d={`M${w * 0.25} ${h * 0.3}H${w * 0.75} M${w * 0.3} ${h * 0.9}H${w * 0.7}`}
            fill="none"
          />
          <rect x={w * 0.36} y={h * 0.16} width={w * 0.28} height={h * 0.1} rx={inset} />
        </>
      )}
      {type === 'surgeryTable' && (
        <>
          <rect x={w * 0.25} y={edge / 2} width={w * 0.5} height={h - edge} rx={inset} />
          <path
            d={`M${w * 0.25} ${h * 0.22}H${w * 0.75} M${w * 0.25} ${h * 0.63}H${w * 0.75} M${w * 0.5} ${h * 0.63}V${h - edge}`}
            fill="none"
          />
          <rect x={edge / 2} y={h * 0.3} width={w * 0.25} height={h * 0.12} rx={inset / 2} />
          <rect x={w * 0.75} y={h * 0.3} width={w * 0.25 - edge} height={h * 0.12} rx={inset / 2} />
        </>
      )}
      {type === 'medicalTrolley' && (
        <>
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} rx={inset / 2} />
          <path
            d={`M${inset / 2} ${inset}V${h - inset} M${w - inset / 2} ${inset}V${h - inset} M${w * 0.55} ${inset}V${h - inset}`}
            fill="none"
          />
          {[inset, w - inset].flatMap((x) =>
            [edge, h - edge].map((y) => (
              <path key={x + '-' + y} d={`M${x - inset / 2} ${y}H${x + inset / 2}`} fill="none" />
            )),
          )}
        </>
      )}
      {type === 'serverCabinet' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path
            d={`M${inset} ${h * 0.12}H${w - inset} M${inset} ${h * 0.88}H${w - inset}`}
            fill="none"
          />
          {[0.35, 0.65].map((y) => (
            <g key={y}>
              <circle cx={w / 2} cy={h * y} r={Math.min(w * 0.25, h * 0.12)} />
              <path d={`M${w * 0.35} ${h * y}H${w * 0.65}`} fill="none" />
            </g>
          ))}
        </>
      )}
      {type === 'briefingTable' && (
        <>
          <rect
            x={edge / 2}
            y={edge / 2}
            width={w - edge}
            height={h - edge}
            rx={Math.min(h * 0.45, w * 0.2)}
          />
          <rect x={w * 0.28} y={h * 0.28} width={w * 0.44} height={h * 0.44} rx={inset} />
          <path d={`M${w * 0.35} ${h * 0.5}H${w * 0.65}`} fill="none" />
        </>
      )}
      {type === 'sanitaryToilet' && (
        <>
          <ellipse cx={w / 2} cy={h * 0.59} rx={w * 0.43} ry={h * 0.38} />
          <ellipse cx={w / 2} cy={h * 0.6} rx={w * 0.26} ry={h * 0.24} fill="none" />
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h * 0.23} rx={inset / 2} />
        </>
      )}
      {type === 'washBasin' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <ellipse cx={w / 2} cy={h * 0.55} rx={w * 0.34} ry={h * 0.3} />
          <path d={`M${w / 2} ${h * 0.08}V${h * 0.3}`} fill="none" />
          <circle cx={w / 2} cy={h * 0.55} r={Math.min(0.025, w * 0.04)} />
        </>
      )}
      {type === 'showerTray' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset / 2} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} rx={inset} />
          <circle cx={w * 0.75} cy={h * 0.75} r={Math.min(0.05, w * 0.08)} />
          <path
            d={`M${w / 2} ${edge}V${h * 0.16} M${w * 0.4} ${h * 0.16}H${w * 0.6}`}
            fill="none"
          />
        </>
      )}
      {type === 'galleySink' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <rect x={w * 0.08} y={h * 0.2} width={w * 0.43} height={h * 0.65} rx={inset} />
          <path d={`M${w * 0.3} ${h * 0.05}V${h * 0.3}`} fill="none" />
          {[0.6, 0.68, 0.76, 0.84, 0.92].map((x) => (
            <path key={x} d={`M${w * x} ${h * 0.2}V${h * 0.85}`} fill="none" />
          ))}
        </>
      )}
      {type === 'galleyHob' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          {[0.28, 0.72].flatMap((x) =>
            [0.25, 0.65].map((y) => (
              <circle key={x + '-' + y} cx={w * x} cy={h * y} r={Math.min(w, h) * 0.16} />
            )),
          )}
          <path d={`M${inset} ${h * 0.9}H${w - inset}`} fill="none" />
        </>
      )}
      {type === 'powerUnit' && (
        <>
          <path
            d={`M${inset * 2} ${edge}H${w - inset * 2}L${w - edge} ${inset * 2}V${h - inset * 2}L${w - inset * 2} ${h - edge}H${inset * 2}L${edge} ${h - inset * 2}V${inset * 2}Z`}
          />
          <rect x={w * 0.2} y={h * 0.15} width={w * 0.6} height={h * 0.6} rx={inset} />
          {[0.25, 0.35, 0.45, 0.55, 0.65].map((t) => (
            <path key={t} d={`M${w * 0.25} ${h * t}H${w * 0.75}`} fill="none" />
          ))}
          <path
            d={`M${w * 0.2} ${h * 0.88}H${w * 0.45} M${w * 0.6} ${h * 0.88}H${w * 0.8}`}
            fill="none"
          />
        </>
      )}
      {type === 'pumpUnit' && (
        <>
          <rect x={inset / 2} y={inset / 2} width={w - inset} height={h - inset} />
          <rect x={w * 0.1} y={h * 0.2} width={w * 0.4} height={h * 0.6} rx={inset} />
          {[0.2, 0.3, 0.4].map((t) => (
            <path key={t} d={`M${w * t} ${h * 0.22}V${h * 0.78}`} fill="none" />
          ))}
          <ellipse cx={w * 0.72} cy={h * 0.5} rx={w * 0.17} ry={h * 0.3} />
          <path
            d={`M${w * 0.5} ${h * 0.5}H${w * 0.55} M${w * 0.89} ${h * 0.5}H${w - inset}`}
            fill="none"
          />
        </>
      )}
      {type === 'verticalTank' && (
        <>
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - edge} ry={h / 2 - edge} />
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - inset} ry={h / 2 - inset} fill="none" />
          <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.13} />
          <path
            d={`M${w / 2} ${h * 0.05}V${h * 0.2} M${w / 2} ${h * 0.8}V${h * 0.95}`}
            fill="none"
          />
        </>
      )}
      {type === 'serviceBench' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path d={`M0 ${inset}H${w} M0 ${h - inset}H${w}`} fill="none" />
          <rect x={w * 0.08} y={h * 0.28} width={Math.min(0.28, w * 0.2)} height={h * 0.35} />
          <path d={`M${w * 0.5} ${h * 0.22}H${w * 0.88}V${h * 0.7}H${w * 0.5}Z`} fill="none" />
        </>
      )}
      {type === 'cargoPallet' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h - 2 * inset} />
          <path
            d={`M${w * 0.3} ${inset}V${h - inset} M${w * 0.7} ${inset}V${h - inset} M${inset} ${h * 0.5}H${w - inset}`}
            fill="none"
          />
        </>
      )}
      {type === 'storageShelf' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path
            d={`M0 ${inset}H${w} M0 ${h - inset}H${w} M${w / 3} ${inset}V${h - inset} M${(2 * w) / 3} ${inset}V${h - inset}`}
            fill="none"
          />
          {[inset, w - inset].map((x) => (
            <path key={x} d={`M${x} 0V${h}`} fill="none" />
          ))}
        </>
      )}
      {type === 'crewBed' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset / 2} />
          <rect x={inset} y={inset} width={w - 2 * inset} height={h * 0.2} rx={inset} />
          <path
            d={`M${inset} ${h * 0.3}H${w - inset}V${h - inset}H${inset}Z M${inset} ${h * 0.8}H${w - inset}`}
            fill="none"
          />
        </>
      )}
      {type === 'wallLocker' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path
            d={`M0 ${inset}H${w} M${w / 2} ${inset}V${h} M${w * 0.2} ${h - inset}H${w * 0.3} M${w * 0.7} ${h - inset}H${w * 0.8}`}
            fill="none"
          />
        </>
      )}
      {type === 'crewBench' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} rx={inset} />
          <path
            d={`M${inset} ${inset}H${w - inset} M${w / 3} ${inset}V${h - inset} M${(2 * w) / 3} ${inset}V${h - inset}`}
            fill="none"
          />
        </>
      )}
      {type === 'diningTable' && (
        <>
          <rect
            x={edge / 2}
            y={edge / 2}
            width={w - edge}
            height={h - edge}
            rx={Math.min(0.18, h / 4)}
          />
          <rect
            x={inset}
            y={inset}
            width={w - 2 * inset}
            height={h - 2 * inset}
            rx={inset}
            fill="none"
          />
        </>
      )}
      {type === 'examBed' && (
        <>
          <rect x={w * 0.13} y={edge / 2} width={w * 0.74} height={h - edge} rx={inset} />
          <rect x={w * 0.23} y={inset} width={w * 0.54} height={h * 0.18} rx={inset} />
          <path
            d={`M${w * 0.13} ${h * 0.28}H${w * 0.87} M${w * 0.13} ${h * 0.7}H${w * 0.87} M${w * 0.05} ${h * 0.3}V${h * 0.72} M${w * 0.95} ${h * 0.3}V${h * 0.72}`}
            fill="none"
          />
        </>
      )}
      {type === 'medicalCabinet' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <rect x={inset} y={inset} width={w * 0.42} height={h - 2 * inset} rx={inset} />
          <path
            d={`M${w * 0.62} ${inset}H${w - inset} M${w * 0.62} ${h * 0.5}H${w - inset} M${w * 0.62} ${h - inset}H${w - inset}`}
            fill="none"
          />
        </>
      )}
      {type === 'commandBench' && (
        <>
          <rect x={edge / 2} y={edge / 2} width={w - edge} height={h - edge} />
          <path d={`M0 ${inset}H${w} M0 ${h - inset}H${w}`} fill="none" />
        </>
      )}
      {type === 'deskTerminal' && (
        <>
          <rect x={inset / 2} y={inset / 2} width={w - inset} height={h - inset} rx={inset / 2} />
          <rect
            x={inset}
            y={inset}
            width={w - 2 * inset}
            height={Math.max(0.01, h * 0.35)}
            rx={inset / 3}
          />
          <path
            d={`M${inset} ${h * 0.68}H${w * 0.7} M${inset} ${h * 0.8}H${w * 0.7}`}
            fill="none"
          />
          <circle cx={w * 0.82} cy={h * 0.75} r={Math.min(0.035, w * 0.04)} />
        </>
      )}
      {type === 'operatorSeat' && (
        <>
          <rect
            x={w * 0.18}
            y={h * 0.23}
            width={w * 0.64}
            height={h * 0.65}
            rx={Math.min(0.1, w * 0.15)}
          />
          <rect
            x={w * 0.12}
            y={edge}
            width={w * 0.76}
            height={h * 0.22}
            rx={Math.min(0.08, h * 0.08)}
          />
          <path
            d={`M${w * 0.06} ${h * 0.33}V${h * 0.75} M${w * 0.94} ${h * 0.33}V${h * 0.75}`}
            fill="none"
          />
        </>
      )}
    </g>
  );
}
