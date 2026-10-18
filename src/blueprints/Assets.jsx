export const assetNames = {
  console: 'Console',
  bed: 'Beliche',
  cryo: 'Cápsula criogênica',
  table: 'Mesa',
  crate: 'Carga',
  reactor: 'Reator',
  chair: 'Cadeira',
  medical: 'Maca',
  locker: 'Armário',
  hatch: 'Escotilha',
};
export function AssetSymbol({ type }) {
  const frame = <rect x="5" y="5" width="90" height="90" rx="8" />;
  switch (type) {
    case 'console':
      return (
        <>
          {frame}
          <path d="M15 15H85V55H15Z M15 70H60 M15 82H60" />
          <circle cx="78" cy="77" r="7" />
        </>
      );
    case 'bed':
      return (
        <>
          {frame}
          <rect x="15" y="14" width="70" height="20" rx="4" />
          <path d="M12 40H88 M12 83H88" />
        </>
      );
    case 'cryo':
      return (
        <>
          <rect x="12" y="3" width="76" height="94" rx="28" />
          <rect x="23" y="15" width="54" height="60" rx="20" />
          <path d="M32 85H68" />
        </>
      );
    case 'table':
      return (
        <>
          <rect x="10" y="15" width="80" height="70" rx="18" />
          <path d="M25 2V12 M75 2V12 M25 88V98 M75 88V98" />
        </>
      );
    case 'crate':
      return (
        <>
          {frame}
          <path d="M10 10L90 90 M90 10L10 90 M30 5V20 M70 80V95" />
        </>
      );
    case 'reactor':
      return (
        <>
          <circle cx="50" cy="50" r="43" />
          <circle cx="50" cy="50" r="26" />
          <path d="M40 35H60L68 50L60 65H40L32 50Z M50 7V23 M50 77V93 M7 50H23 M77 50H93" />
        </>
      );
    case 'chair':
      return (
        <>
          <rect x="20" y="25" width="60" height="55" rx="12" />
          <path d="M20 30V10H80V30 M10 35V65 M90 35V65 M35 80V95 M65 80V95" />
        </>
      );
    case 'medical':
      return (
        <>
          {frame}
          <path d="M15 28H85 M45 45H55V55H65V65H55V75H45V65H35V55H45Z" />
        </>
      );
    case 'locker':
      return (
        <>
          {frame}
          <path d="M50 5V95 M38 40V60 M62 40V60 M15 15H40 M60 15H85" />
        </>
      );
    case 'hatch':
      return (
        <>
          <circle cx="50" cy="50" r="43" />
          <circle cx="50" cy="50" r="30" />
          <path d="M50 20V80 M20 50H80" />
          <circle cx="50" cy="50" r="9" />
        </>
      );
    default:
      return null;
  }
}
