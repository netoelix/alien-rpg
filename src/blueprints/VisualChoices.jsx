import { Trace } from './Trace.jsx';
import { FloorRegion } from './FloorRegion.jsx';
const shortNames = {
  internal: 'Interna',
  structural: 'Estrutural',
  hull: 'Casco',
  glass: 'Vidro',
  open: 'Aberta',
  auto: 'Automática',
  hazardLine: 'Segurança',
  walkwayLine: 'Circulação',
  gratedChannel: 'Gradeada',
  channel: 'Canaleta',
  ledge: 'Desnível',
  tread: 'Antiderrapante',
  service: 'Técnico',
  plates: 'Chapas',
  tiles: 'Placas',
  grating: 'Gradeado',
};
export function ChoicePreview({ kind, value }) {
  if (kind === 'trace' && ['corridor', 'vent'].includes(value))
    return (
      <g stroke={value === 'vent' ? '#f1c46c' : 'currentColor'}>
        <path d="M.15 .65H5.85M.15 3.35H5.85" strokeWidth={value === 'vent' ? '.1' : '.28'} />
        {value === 'vent' && <path d="M1.5 .65V3.35M3 .65V3.35M4.5 .65V3.35" strokeWidth=".08" />}
      </g>
    );
  if (kind === 'shape')
    return value === 'ellipse' ? (
      <ellipse cx="3" cy="2" rx="2.6" ry="1.6" strokeWidth=".15" />
    ) : (
      <path
        d={value === 'polygon' ? 'M.4 .4H5.6V2H3.5V3.6H.4Z' : 'M.4 .4H5.6V3.6H.4Z'}
        strokeWidth=".15"
      />
    );
  if (kind === 'purpose')
    return value === 'room' ? (
      <path d="M.4 3.6V.4H5.6V3.6H3.6M2.4 3.6H.4" strokeWidth=".25" />
    ) : (
      <ChoicePreview kind="floor" value={value === 'floor' ? 'tiles' : value} />
    );
  // Close-up swatches emphasize the feature that distinguishes each surface.
  if (kind === 'trace' && ['path', 'sidewalk', 'road', 'gratedChannel'].includes(value)) {
    return (
      <g strokeWidth=".12" strokeLinecap="butt">
        <path d="M.15 .65H5.85M.15 3.35H5.85" />
        {value === 'sidewalk' && (
          <>
            <path d="M.15 .95H5.85M.15 3.05H5.85" />
            <path d="M2 .95V3.05M4 .95V3.05" strokeWidth=".09" />
          </>
        )}
        {value === 'road' && (
          <>
            <path d="M.15 .95H5.85M.15 3.05H5.85" strokeWidth=".07" />
            <path d="M.35 2H1.5M2.4 2H3.6M4.5 2H5.65" stroke="#f1c46c" strokeWidth=".19" />
          </>
        )}
        {value === 'gratedChannel' && (
          <>
            <path d="M.15 1H5.85M.15 3H5.85" />
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d={`M${0.4 + i * 0.57} 1V3`} strokeWidth=".16" />
            ))}
          </>
        )}
      </g>
    );
  }
  if (kind === 'trace')
    return (
      <svg x=".2" y=".2" width="5.6" height="3.6" viewBox="0 0 3 2">
        <Trace
          ink="#78ebae"
          element={{
            id: 'sample',
            kind: 'trace',
            traceType: value,
            markings: value === 'road',
            surface: value === 'sidewalk' ? 'slabs' : 'smooth',
            width: value === 'hazardLine' ? 0.55 : 1,
            rounded: true,
            side: 1,
            points: [
              { x: 0.15, y: 1 },
              { x: 2.85, y: 1 },
            ],
          }}
        />
      </svg>
    );
  if (kind === 'floor')
    return (
      <>
        <FloorRegion
          ink="#78ebae"
          element={{
            id: 'sample',
            kind: 'floorRegion',
            points: [
              { x: 0.3, y: 0.3 },
              { x: 5.7, y: 0.3 },
              { x: 5.7, y: 3.7 },
              { x: 0.3, y: 3.7 },
            ],
            floorFinish: { type: value, size: 2, opacity: 1 },
          }}
        />
        <rect x=".3" y=".3" width="5.4" height="3.4" fill="none" strokeWidth=".04" />
      </>
    );
  if (kind === 'opening')
    return (
      <>
        <path d="M.15 2H.8M5.2 2H5.85" strokeWidth=".45" />
        <g stroke={value === 'door' ? '#f1c46c' : 'currentColor'}>
          <path d="M.8 .9V3.1M5.2 .9V3.1M.8 1.65H5.2M.8 2.35H5.2" strokeWidth=".18" />
          {value === 'window' && <path d="M1.7 2.7L2.6 1.3M3.4 2.7L4.3 1.3" strokeWidth=".14" />}
        </g>
      </>
    );
  const widths = {
    internal: 0.55,
    structural: 1.2,
    hull: 1.9,
    glass: 0.55,
    auto: 0.55,
    open: 0.55,
  };
  return (
    <>
      <path
        d={value === 'open' ? 'M.4 2H1.5M4.5 2H5.6' : 'M.4 2H5.6'}
        strokeWidth={widths[value] || 0.2}
        strokeDasharray={value === 'auto' ? '.3 .2' : undefined}
      />
      {value === 'hull' && (
        <>
          <path d="M.4 2H5.6" stroke="#102c24" strokeWidth="1.3" />
          <path d="M.4 2H5.6" strokeWidth=".38" />
        </>
      )}
      {value === 'glass' && (
        <path d="M.4 2H5.6" stroke="#f1c46c" strokeWidth=".28" strokeDasharray=".5 .3" />
      )}
    </>
  );
}
export function VisualChoices({ label, kind, value, options, onChange }) {
  return (
    <div className="blueprint-visual-choices" role="group" aria-label={label}>
      <span className="blueprint-choice-heading">{label}</span>
      <div className="blueprint-choice-grid">
        {options.map(([id, name]) => (
          <button
            type="button"
            className="blueprint-choice-button"
            key={id}
            aria-label={name}
            title={name}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
          >
            <svg
              viewBox="0 0 6 4"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth=".06"
            >
              <ChoicePreview kind={kind} value={id} />
            </svg>
            <span>{shortNames[id] || name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
