import { environmentAssets } from './environment-assets.js';

// Small, deterministic SVG plans: no textures, filters or external images.
function Leaves({ x = 50, y = 50, radius = 38, count = 7, narrow = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`rotate(${(i * 360) / count})`}>
          <path
            d={`M0 0 Q${narrow ? 8 : 22} ${-radius * 0.55} 0 ${-radius} Q${narrow ? -8 : -16} ${-radius * 0.45} 0 0Z`}
          />
          <path d={`M0 0 L0 ${-radius * 0.82}`} />
        </g>
      ))}
      <circle r="3" />
    </g>
  );
}
const slats = (horizontal, count, start = 15, end = 85) =>
  Array.from({ length: count }, (_, i) => {
    const p = start + ((end - start) * i) / Math.max(1, count - 1);
    return <path key={i} d={horizontal ? `M12 ${p}H88` : `M${p} 12V88`} />;
  });
export function EnvironmentFurniture({
  type,
  w = environmentAssets[type]?.w,
  h = environmentAssets[type]?.h,
}) {
  return (
    <svg width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">
      <g
        fill="none"
        strokeWidth={Math.min(2, 2.5 / Math.max(w, h))}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect width="100" height="100" fill="transparent" stroke="none" />
        {type === 'pottedPalm' && (
          <>
            <circle cx="50" cy="50" r="15" />
            <circle cx="50" cy="50" r="11" />
            <Leaves narrow radius={46} count={9} />
          </>
        )}
        {type === 'broadleafPot' && (
          <>
            <circle cx="50" cy="50" r="23" />
            <circle cx="50" cy="50" r="19" />
            <Leaves count={5} radius={43} />
          </>
        )}
        {type === 'roundShrub' && (
          <>
            <path d="M50 7Q65 0 75 17Q96 13 91 36Q105 52 89 67Q91 89 69 90Q53 104 38 91Q14 97 13 73Q-1 61 10 44Q4 19 27 19Q31 2 50 7Z" />
            <Leaves radius={26} count={6} />
          </>
        )}
        {type === 'gardenTree' && (
          <>
            <path d="M50 5Q61 0 67 12Q89 4 89 27Q105 34 92 48Q105 67 86 76Q87 97 65 91Q50 106 36 91Q12 98 14 77Q-2 64 9 48Q-3 27 19 21Q25 0 43 12Z" />
            <path d="M50 51L30 28M50 51L71 23M50 51L78 66M50 51L35 76" />
            <circle cx="50" cy="51" r="5" />
            <path d="M21 40Q29 32 36 39M60 76Q70 72 76 80M44 21Q50 17 55 24" />
          </>
        )}
        {type === 'longPlanter' && (
          <>
            <rect x="3" y="8" width="94" height="84" rx="5" />
            <rect x="7" y="15" width="86" height="70" rx="3" />
            {[22, 50, 78].map((x) => (
              <Leaves key={x} x={x} radius={20} count={5} />
            ))}
          </>
        )}
        {type === 'roundPlanter' && (
          <>
            <circle cx="50" cy="50" r="46" />
            <circle cx="50" cy="50" r="41" />
            <Leaves radius={29} />
            {[0, 90, 180, 270].map((a) => (
              <path key={a} transform={`rotate(${a} 50 50)`} d="M50 4V9" />
            ))}
          </>
        )}
        {type === 'hydroponicBed' && (
          <>
            <rect x="6" y="3" width="88" height="94" rx="3" />
            <path d="M50 8V92M11 8H89M11 92H89" />
            {[24, 50, 76].flatMap((y) =>
              [26, 74].map((x) => (
                <g key={x + ',' + y}>
                  <circle cx={x} cy={y} r="16" />
                  <Leaves x={x} y={y} radius={11} count={4} />
                </g>
              )),
            )}
          </>
        )}
        {type === 'gardenRocks' && (
          <>
            <path d="M8 18L29 8L48 21L43 44L23 53L5 36ZM50 45L78 31L96 51L88 83L61 93L46 71ZM9 73L25 62L39 74L31 92L12 91Z" />
            <path d="M15 21L29 17L37 25M60 49L76 41L86 54M15 77L24 72" />
          </>
        )}
        {type === 'gardenPond' && (
          <>
            <path d="M8 21C21-3 53 22 72 7C99-1 102 29 91 48C80 63 103 90 73 94C47 91 31 104 13 87C-1 73 17 51 8 21Z" />
            <path d="M15 25C26 8 53 30 75 15C91 9 95 30 83 48C73 66 94 83 73 86C49 83 34 96 20 82C8 71 24 49 15 25Z" />
            <path d="M32 44Q45 40 57 44M39 52Q52 48 64 52M33 67Q45 63 58 67" />
            <circle cx="72" cy="31" r="7" />
          </>
        )}
        {type === 'parkBench' && (
          <>
            <rect x="4" y="12" width="92" height="66" rx="3" />
            <path d="M4 27H96M4 43H96M4 59H96M12 78V91H21V78M79 78V91H88V78M8 6V84M92 6V84" />
          </>
        )}
        {type === 'picnicTable' && (
          <>
            <rect x="8" y="29" width="84" height="42" rx="3" />
            <rect x="5" y="6" width="90" height="13" rx="2" />
            <rect x="5" y="81" width="90" height="13" rx="2" />
            <path d="M10 43H90M10 57H90M21 19V29M79 19V29M21 71V81M79 71V81" />
            <circle cx="50" cy="50" r="3" />
          </>
        )}
        {type === 'sunParasol' && (
          <>
            <path d="M50 3L83 17L97 50L83 83L50 97L17 83L3 50L17 17Z" />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} transform={`rotate(${i * 45} 50 50)`} d="M50 50V3" />
            ))}
            <circle cx="50" cy="50" r="4" />
          </>
        )}
        {type === 'safetyBollard' && (
          <>
            <circle cx="50" cy="50" r="44" />
            <circle cx="50" cy="50" r="29" />
            <circle cx="50" cy="50" r="22" />
            {[0, 90, 180, 270].map((a) => (
              <circle key={a} transform={`rotate(${a} 50 50)`} cx="50" cy="13" r="3" />
            ))}
          </>
        )}
        {type === 'floodlightStand' && (
          <>
            <circle cx="50" cy="72" r="23" />
            <path d="M44 72V44H56V72M20 21V46H80V21" />
            <rect x="9" y="6" width="82" height="29" rx="4" />
            <rect x="16" y="12" width="68" height="15" />
            <path d="M28 12V27M44 12V27M60 12V27M76 12V27" />
          </>
        )}
        {type === 'outdoorCabinet' && (
          <>
            <rect x="4" y="5" width="92" height="90" rx="3" />
            <rect x="10" y="12" width="80" height="72" />
            <path d="M50 12V84M15 21H42M15 30H42M15 39H42M58 21H84M58 30H84M58 39H84M44 58V70M56 58V70M14 90H86" />
          </>
        )}
        {type === 'solarPanelArray' && (
          <>
            <rect x="4" y="3" width="92" height="94" />
            <rect x="9" y="7" width="82" height="86" />
            {[29.5, 50, 70.5].map((x) => (
              <path key={x} d={`M${x} 7V93`} />
            ))}
            {[21, 35, 49, 63, 77].map((y) => (
              <path key={y} d={`M9 ${y}H91`} />
            ))}
            <path d="M14 97V99M86 97V99" />
          </>
        )}
        {type === 'dishAntenna' && (
          <>
            <circle cx="50" cy="50" r="46" />
            <circle cx="50" cy="50" r="39" />
            <path d="M50 50L18 22M50 50L82 22M50 50L50 95" />
            <ellipse cx="50" cy="50" rx="9" ry="6" />
            <path d="M50 13V22M13 50H22M78 50H87" />
          </>
        )}
        {type === 'concreteBarrier' && (
          <>
            <path d="M8 5H92L98 26V74L92 95H8L2 74V26Z" />
            <rect x="8" y="31" width="84" height="38" />
            <path d="M18 9V27M33 9V27M48 9V27M63 9V27M78 9V27M18 73V91M33 73V91M48 73V91M63 73V91M78 73V91" />
          </>
        )}
        {type === 'drainGrate' && (
          <>
            <rect x="2" y="5" width="96" height="90" />
            <rect x="6" y="12" width="88" height="76" />
            {slats(false, 12, 10, 90)}
          </>
        )}
        {type === 'wovenRug' && (
          <>
            <rect x="5" y="7" width="90" height="86" />
            <rect x="10" y="14" width="80" height="72" />
            <path d="M50 24L77 50L50 76L23 50ZM50 35L65 50L50 65L35 50Z" />
            {[12, 22, 32, 42, 52, 62, 72, 82, 92].map((x) => (
              <path key={x} d={`M${x} 2V7M${x} 93V98`} />
            ))}
          </>
        )}
        {type === 'floorLamp' && (
          <>
            <circle cx="50" cy="50" r="44" />
            <circle cx="50" cy="50" r="37" />
            <circle cx="50" cy="50" r="7" />
            <path d="M50 13V43M18 68L44 53M82 68L56 53" />
          </>
        )}
        {type === 'displayPlinth' && (
          <>
            <rect x="5" y="5" width="90" height="90" rx="4" />
            <rect x="11" y="11" width="78" height="78" />
            <path d="M32 31L59 23L74 49L55 73L29 60ZM32 31L48 49L74 49M48 49L55 73" />
            <rect x="35" y="80" width="30" height="5" />
          </>
        )}
        {type === 'displayCase' && (
          <>
            <rect x="3" y="5" width="94" height="90" />
            <rect x="8" y="12" width="84" height="74" />
            <path d="M36 12V86M65 12V86M10 78L29 26M39 78L58 26M68 78L87 26" />
            <circle cx="22" cy="49" r="9" />
            <path d="M44 37H58V62H44ZM72 40L83 33L88 55L76 66Z" />
          </>
        )}
        {type === 'aquariumTank' && (
          <>
            <rect x="3" y="4" width="94" height="92" rx="4" />
            <rect x="8" y="12" width="84" height="75" rx="3" />
            <rect x="74" y="15" width="14" height="19" />
            <path d="M16 78Q12 56 19 43M19 65L26 54M19 57L13 48M65 78Q71 61 65 47M67 63L59 53M33 43Q42 29 52 43Q42 57 33 43L29 34V52ZM46 68Q53 58 61 68Q53 78 46 68L42 62V74" />
            <path d="M9 89H91" />
          </>
        )}
      </g>
    </svg>
  );
}
