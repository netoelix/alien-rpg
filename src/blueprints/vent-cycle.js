export function isClosedVent(vent) {
  return (
    vent.kind === 'vent' &&
    vent.points.length >= 4 &&
    Math.hypot(vent.points[0].x - vent.points.at(-1).x, vent.points[0].y - vent.points.at(-1).y) <
      0.00001
  );
}
export function reopenVent(vent) {
  if (!isClosedVent(vent)) throw Error('Escolha um duto fechado.');
  const points = [...vent.points];
  const end = points.at(-1),
    previous = points.at(-2);
  const length = Math.hypot(end.x - previous.x, end.y - previous.y);
  if (length < 0.5) throw Error('Alongue o último trecho antes de abrir a emenda.');
  const fraction = 1 - Math.min(vent.width || 1, length / 2) / length;
  const segment = points.length - 2;
  if (vent.ports?.some((p) => p.segment === segment && p.t > fraction))
    throw Error('Afaste o acesso da emenda antes de abrir o ciclo.');
  points[segment + 1] = {
    x: previous.x + (end.x - previous.x) * fraction,
    y: previous.y + (end.y - previous.y) * fraction,
  };
  return {
    ...vent,
    points,
    ...(vent.ports && {
      ports: vent.ports.map((p) => (p.segment === segment ? { ...p, t: p.t / fraction } : p)),
    }),
  };
}
export function closeVentPoints(points) {
  if (points.length < 3) return points;
  return Math.hypot(points[0].x - points.at(-1).x, points[0].y - points.at(-1).y) < 0.00001
    ? points
    : [...points, { ...points[0] }];
}
