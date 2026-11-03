export function TerrainRegion({ element, ink }) {
  const { points, floorFinish } = element;
  const depression = floorFinish.type === 'depression';
  const edges = points.map((a, i) => ({ a, b: points[(i + 1) % points.length] }));
  const orientation = Math.sign(edges.reduce((sum, { a, b }) => sum + a.x * b.y - b.x * a.y, 0));
  const perimeter = edges.reduce((sum, { a, b }) => sum + Math.hypot(b.x - a.x, b.y - a.y), 0);
  const spacing = Math.max(1.4, perimeter / 180);
  let ticks = '',
    remaining = spacing / 2;
  let longest = 0,
    label = points[0];
  for (const { a, b } of edges) {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.hypot(dx, dy);
    if (!length) continue;
    const side = orientation * (depression ? 1 : -1);
    if (length > longest) {
      longest = length;
      label = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    for (; remaining < length; remaining += spacing) {
      const x = a.x + (dx * remaining) / length,
        y = a.y + (dy * remaining) / length;
      ticks +=
        'M' + x + ' ' + y + 'l' + (-dy / length) * side * 0.45 + ' ' + (dx / length) * side * 0.45;
    }
    remaining -= length;
  }
  const height = floorFinish.height ?? 3;
  return (
    <g data-object={element.id} data-terrain={floorFinish.type}>
      <polygon
        points={points.map((p) => p.x + ',' + p.y).join(' ')}
        fill={ink}
        fillOpacity=".035"
        stroke={ink}
        strokeWidth=".09"
      />
      <path d={ticks} fill="none" stroke={ink} strokeWidth=".07" />
      {label && (
        <text
          x={label.x}
          y={label.y}
          dy="-.22"
          fontSize=".8"
          textAnchor="middle"
          fill={ink}
          stroke="none"
        >
          {depression ? '−' : '+'}
          {height.toLocaleString('pt-BR')} m
        </text>
      )}
    </g>
  );
}
