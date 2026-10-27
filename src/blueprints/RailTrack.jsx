const coords = (points) => points.map((p) => p.x + ',' + p.y).join(' ');
// Shared construction for the modular asset and the drawable rail tool.
export function RailTrack({ geometry, gauge, floor = '#102c24', sleeperDepth = (gauge * 2) / 9 }) {
  const thickness = gauge / 9,
    edge = Math.min(0.035, thickness / 3);
  return (
    <g strokeLinejoin="round" strokeLinecap="butt">
      {geometry.marks.map((m, i) => {
        const dx = m.b.x - m.a.x,
          dy = m.b.y - m.a.y,
          len = Math.hypot(dx, dy) || 1;
        const nx = ((-dy / len) * sleeperDepth) / 2,
          ny = ((dx / len) * sleeperDepth) / 2;
        return (
          <polygon
            key={i}
            data-rail-sleeper="true"
            points={coords([
              { x: m.a.x + nx, y: m.a.y + ny },
              { x: m.b.x + nx, y: m.b.y + ny },
              { x: m.b.x - nx, y: m.b.y - ny },
              { x: m.a.x - nx, y: m.a.y - ny },
            ])}
            fill={floor}
            strokeWidth={edge}
          />
        );
      })}
      {[geometry.left, geometry.right].map((points, i) => (
        <g key={i} data-rail-beam="true">
          <polyline points={coords(points)} fill="none" strokeWidth={thickness + edge * 2} />
          <polyline points={coords(points)} fill="none" stroke={floor} strokeWidth={thickness} />
        </g>
      ))}
    </g>
  );
}
export function RailAsset({ w, h, floor }) {
  const marks = Array.from({ length: 6 }, (_, i) => ({
    a: { x: w * 0.04, y: h * (0.105 + i * 0.16) },
    b: { x: w * 0.96, y: h * (0.105 + i * 0.16) },
  }));
  return (
    <RailTrack
      gauge={w * 0.45}
      floor={floor}
      sleeperDepth={h * 0.05}
      geometry={{
        marks,
        left: [
          { x: w * 0.275, y: 0 },
          { x: w * 0.275, y: h },
        ],
        right: [
          { x: w * 0.725, y: 0 },
          { x: w * 0.725, y: h },
        ],
      }}
    />
  );
}
