export function isClosedVent(vent) {
  return (
    vent.kind === 'vent' &&
    vent.points.length >= 4 &&
    Math.hypot(vent.points[0].x - vent.points.at(-1).x, vent.points[0].y - vent.points.at(-1).y) <
      0.00001
  );
}
export function closeVentPoints(points) {
  if (points.length < 3) return points;
  return Math.hypot(points[0].x - points.at(-1).x, points[0].y - points.at(-1).y) < 0.00001
    ? points
    : [...points, { ...points[0] }];
}
