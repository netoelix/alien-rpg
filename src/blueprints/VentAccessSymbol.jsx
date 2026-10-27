export function VentAccessSymbol({ type, size }) {
  return type === 'ceiling' ? (
    <circle r={size * 0.35} fill="none" />
  ) : (
    <path
      d={`M${-size * 0.32} ${-size * 0.32}L${size * 0.32} ${size * 0.32}M${size * 0.32} ${-size * 0.32}L${-size * 0.32} ${size * 0.32}`}
      fill="none"
    />
  );
}
