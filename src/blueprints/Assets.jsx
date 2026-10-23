export const assetNames = {
  stairs: 'Escada',
  elevator: 'Elevador',
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
  engine: 'Motor',
  tank: 'Tanque',
  rack: 'Estante de carga',
  workbench: 'Bancada de manutenção',
  kitchen: 'Cozinha compacta',
  sofa: 'Banco estofado',
};
export function AssetSymbol({ type }) {
  const frame = <rect x="5" y="5" width="90" height="90" rx="8" />;
  switch (type) {
    case 'stairs':
      return (
        <>
          {frame}
          <path d="M15 20H85 M15 32H85 M15 44H85 M15 56H85 M15 68H85 M15 80H85 M50 85V15 M40 25L50 15L60 25" />
        </>
      );
    case 'elevator':
      return (
        <>
          {frame}
          <path d="M50 8V92 M18 40L30 25L42 40 M30 25V70 M58 60L70 75L82 60 M70 30V75" />
        </>
      );
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
    case 'engine':
      return (
        <>
          <path d="M25 8H75V25L88 38V72L72 88H28L12 72V38L25 25Z M25 25H75 M12 45H88 M12 60H88 M28 88V96 M72 88V96" />
          <circle cx="50" cy="52" r="16" />
          <path d="M42 40L58 64 M58 40L42 64" />
        </>
      );
    case 'tank':
      return (
        <>
          <rect x="18" y="10" width="64" height="80" rx="30" />
          <path d="M20 32H80 M20 68H80 M43 10V3H57V10 M43 90V97H57V90" />
          <circle cx="50" cy="50" r="8" />
        </>
      );
    case 'rack':
      return (
        <>
          <rect x="6" y="6" width="88" height="88" />
          <path d="M6 35H94 M6 65H94 M35 6V94 M65 6V94 M13 13L27 27 M42 42L58 58 M73 73L87 87" />
        </>
      );
    case 'workbench':
      return (
        <>
          <rect x="5" y="12" width="90" height="76" />
          <path d="M5 35H95 M18 18V28 M30 18V28 M42 18V28 M15 75H85 M55 45L75 65 M75 45L55 65" />
          <circle cx="28" cy="55" r="10" />
        </>
      );
    case 'kitchen':
      return (
        <>
          <rect x="4" y="8" width="92" height="84" />
          <path d="M50 8V92 M4 70H50" />
          <rect x="12" y="20" width="28" height="38" rx="5" />
          <circle cx="65" cy="30" r="8" />
          <circle cx="83" cy="30" r="8" />
          <circle cx="65" cy="60" r="8" />
          <circle cx="83" cy="60" r="8" />
        </>
      );
    case 'sofa':
      return (
        <>
          <rect x="4" y="15" width="92" height="70" rx="12" />
          <path d="M15 15V72H85V15 M15 32H85 M38 32V72 M62 32V72" />
        </>
      );
    default:
      return null;
  }
}
