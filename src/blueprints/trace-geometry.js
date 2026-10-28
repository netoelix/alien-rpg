export function traceGeometry(element) {
  const raw = element.points.filter(
    (p, i, a) => !i || Math.hypot(p.x - a[i - 1].x, p.y - a[i - 1].y) > 0.0001,
  );
  if (raw.length < 2) return { left: [], right: [], center: raw, marks: [] };
  const points = [raw[0]],
    mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  for (let i = 1; i < raw.length - 1; i++) {
    const a = raw[i - 1],
      b = raw[i],
      c = raw[i + 1];
    if (!element.rounded) {
      points.push(b);
      continue;
    }
    const ab = Math.hypot(b.x - a.x, b.y - a.y),
      bc = Math.hypot(c.x - b.x, c.y - b.y);
    const radius = Math.min(
      element.width * (element.traceType === 'rail' ? 3 : 1),
      ab * 0.4,
      bc * 0.4,
    );
    const from = mix(b, a, radius / ab),
      to = mix(b, c, radius / bc);
    points.push(from);
    for (let j = 1; j <= 8; j++) {
      const t = j / 8;
      points.push(mix(mix(from, b, t), mix(b, to, t), t));
    }
  }
  points.push(raw.at(-1));
  const normals = points.slice(1).map((p, i) => {
    const a = points[i],
      length = Math.hypot(p.x - a.x, p.y - a.y) || 1;
    return { x: -(p.y - a.y) / length, y: (p.x - a.x) / length, length };
  });
  const offset = (distance) =>
    points.map((p, i) => {
      const a = normals[Math.max(0, i - 1)],
        b = normals[Math.min(i, normals.length - 1)];
      let x = a.x + b.x,
        y = a.y + b.y;
      const len = Math.hypot(x, y);
      if (len < 0.001) {
        x = b.x;
        y = b.y;
      } else {
        x /= len;
        y /= len;
      }
      const scale = distance / Math.max(0.5, x * b.x + y * b.y);
      return { x: p.x + x * scale, y: p.y + y * scale };
    });
  const total = normals.reduce((sum, n) => sum + n.length, 0),
    spacing = Math.max(
      ['talus', 'cliff'].includes(element.traceType)
        ? Math.max(0.35, element.width * 0.28)
        : element.traceType === 'rail'
          ? (element.width * 0.64) / 0.9
          : element.traceType === 'gratedChannel'
            ? 0.16
            : element.traceType === 'hazardLine'
              ? 0.4
              : 0.6,
      total / 600,
    ),
    marks = [];
  let travelled = 0,
    next = spacing / 2;
  for (let i = 0; i < normals.length; i++) {
    const n = normals[i];
    while (next < travelled + n.length && marks.length < 600) {
      const p = mix(points[i], points[i + 1], (next - travelled) / n.length);
      const extent =
        element.traceType === 'rail' ? (element.width * 0.92) / 0.9 : element.width / 2;
      const side = element.side === -1 ? -1 : 1;
      marks.push(
        ['rail', 'channel', 'gratedChannel'].includes(element.traceType)
          ? {
              a: { x: p.x - n.x * extent, y: p.y - n.y * extent },
              b: { x: p.x + n.x * extent, y: p.y + n.y * extent },
            }
          : { a: p, b: { x: p.x + n.x * extent * side, y: p.y + n.y * extent * side } },
      );
      next += spacing;
    }
    travelled += n.length;
  }
  return {
    left: offset(element.width / 2),
    right: offset(-element.width / 2),
    center: points,
    marks,
  };
}
