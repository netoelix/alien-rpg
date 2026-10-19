const paths = {
  select: 'M5 3L19 13L12 14L9 21Z',
  pan: 'M12 2V22M2 12H22M8 6L12 2L16 6M8 18L12 22L16 18M6 8L2 12L6 16M18 8L22 12L18 16',
  room: 'M4 4H20V20H4Z',
  polygon: 'M4 4H20V11H12V20H4Z',
  ellipse: 'M12 3A9 9 0 1 0 12 21A9 9 0 1 0 12 3',
  corridor: 'M3 3V21H21V15H9V3Z',
  door: 'M3 21V3H18V21M6 21V6L15 3V18ZM11 12H12',
  vent: 'M3 5H15V19H21M3 9H11V23M5 3V11M9 3V11M9 15H17',
  asset: 'M4 6H20V20H4ZM8 6V3H16V6M4 11H20M10 11V14H14V11',
  module: 'M3 3H10V10H3ZM14 3H21V10H14ZM3 14H10V21H3ZM14 14H21V21H14Z',
  label: 'M4 5V3H20V5M12 3V21M8 21H16',
  fit: 'M3 9V3H9M15 3H21V9M21 15V21H15M9 21H3V15',
  focus: 'M8 3H3V8M3 3L9 9M16 3H21V8M21 3L15 9M3 16V21H8M3 21L9 15M21 16V21H16M21 21L15 15',
};
export function ToolIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.fit} />
    </svg>
  );
}
