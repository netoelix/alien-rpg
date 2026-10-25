import { LevelFurniture } from './LevelFurniture.jsx';
export function AccessFurniture({ type, w, h }) {
  if (type === 'stairs') return <LevelFurniture type="stairFlight" w={w} h={h} />;
  const i = Math.min(0.12, w / 8, h / 8);
  return (
    <g strokeWidth={Math.min(0.035, w / 20, h / 20)}>
      <rect x={i} y={i} width={w - 2 * i} height={h - 2 * i} />
      <rect x={w * 0.3} y={h - i * 1.5} width={w * 0.4} height={i * 1.5} />
      <path
        fill="none"
        d={
          'M' +
          w / 2 +
          ' ' +
          (h - i * 1.5) +
          'V' +
          h +
          'M' +
          i * 2 +
          ' ' +
          h * 0.25 +
          'V' +
          h * 0.7 +
          'M' +
          (w - i * 2) +
          ' ' +
          h * 0.25 +
          'V' +
          h * 0.7
        }
      />
    </g>
  );
}
