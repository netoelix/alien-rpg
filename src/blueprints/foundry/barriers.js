import { arcEdges } from './arc-edges.js';
import { persistentWallStructure, sharedWallStructures } from '../shared-walls.js';
import { wallRuns, corridorCorners, openingGeometry } from '../wall-geometry.js';
import { isWindow } from '../opening-types.js';
import { joinedBoundaryPieces, floorContours } from './union.js';
import { centerWallBarriers } from './wall-center.js';

const EPS = 1e-8;
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// Segment/rectangle clipping in the opening's local coordinates.
function openingInterval(a, b, opening) {
  const g = opening.geometry,
    angle = (-g.rotation * Math.PI) / 180;
  const local = (p) => {
    const x = p[0] - g.x,
      y = p[1] - g.y;
    return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
  };
  const p = local(a),
    q = local(b);
  // The frame rectangle may overlap a perpendicular wall at a corner.
  // Only the supporting direction can become an opening. Ellipse openings
  // span adjacent chords, so allow their changing tangent.
  const dx = q[0] - p[0],
    dy = q[1] - p[1];
  if (
    opening.curvedSupport
      ? Math.abs(dx) < Math.abs(dy)
      : Math.abs(dy) > Math.max(EPS, Math.abs(dx) * 1e-6)
  )
    return null;
  let low = 0,
    high = 1;
  for (const [axis, limit] of [
    [0, opening.width / 2],
    [1, g.frameDepth],
  ]) {
    const d = q[axis] - p[axis];
    if (Math.abs(d) < EPS) {
      if (Math.abs(p[axis]) > limit + EPS) return null;
      continue;
    }
    const x = (-limit - p[axis]) / d,
      y = (limit - p[axis]) / d;
    low = Math.max(low, Math.min(x, y));
    high = Math.min(high, Math.max(x, y));
  }
  return high - low > EPS ? [low, high] : null;
}
export function buildFoundryBarriers(
  elements,
  pixelsPerMeter = 100,
  { wallPlacement = 'center' } = {},
) {
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) throw Error('Escala inválida.');
  const warnings = [];
  const supported = new Set(['room', 'polygon', 'ellipse', 'corridor', 'partition']);
  const originals = elements.filter((e) => supported.has(e.kind) && !e.hidden);
  const contours = floorContours(originals);
  const structure = sharedWallStructures(
    originals.map((e) => {
      const filled = persistentWallStructure({ ...e, joinWalls: false });
      return {
        ...filled,
        walls: filled.walls.map((wall) => ({ ...wall, automatic: !!e.joinWalls })),
      };
    }),
  );
  const openings = elements
    .filter((e) => e.kind === 'door' && !e.hidden && originals.some((p) => p.id === e.wallId))
    .map((e) => ({
      ...e,
      curvedSupport: originals.find((p) => p.id === e.wallId)?.kind === 'ellipse',
      geometry: openingGeometry(e, elements, structure),
    }))
    .filter((e) => e.geometry);
  const barriers = [];
  const owners = [];
  const seen = new Set();
  function add(a, b, type, source, opening) {
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < EPS) return;
    const transparent = opening ? isWindow(opening.openingType) : type === 'glass';
    const kind = opening ? (transparent ? 'window' : 'door') : 'wall';
    const coordinates = [...a, ...b].map((v) => Math.round(v * pixelsPerMeter * 1000) / 1000);
    const ends = [coordinates.slice(0, 2).join(','), coordinates.slice(2).join(',')].sort();
    const key = ends.join(':') + ':' + kind + ':' + transparent;
    if (seen.has(key)) return;
    seen.add(key);
    owners.push({ element: originals.find((e) => e.id === source), type });
    barriers.push({
      coordinates,
      kind,
      sourceId: opening?.id || source,
      style: opening?.openingType || type,
      blocks: { movement: true, sight: !transparent, light: !transparent, sound: true },
      ...(kind === 'door' ? { state: 'closed' } : {}),
    });
  }
  for (const e of structure) {
    const edges = wallRuns(e)
      .filter((run) => run.points)
      .flatMap((run) => {
        const points = run.closed ? [...run.points, run.points[0]] : run.points;
        return points.slice(1).map((p, i) => ({ a: points[i], b: p, type: run.type }));
      });
    for (const corner of corridorCorners(e))
      for (const [a, b] of arcEdges(corner)) edges.push({ a, b, type: corner.type });
    for (const edge of edges) {
      let pieces = originals.find((original) => original.id === e.id)?.joinWalls
        ? joinedBoundaryPieces(edge.a, edge.b, originals, contours)
        : [{ a: edge.a, b: edge.b }];
      for (const opening of openings) {
        pieces = pieces.flatMap((piece) => {
          if (piece.opening) return [piece];
          const interval = openingInterval(piece.a, piece.b, opening);
          if (!interval) return [piece];
          const [lo, hi] = interval,
            start = lerp(piece.a, piece.b, lo),
            end = lerp(piece.a, piece.b, hi);
          return [
            ...(lo > EPS ? [{ a: piece.a, b: start }] : []),
            { a: start, b: end, opening },
            ...(hi < 1 - EPS ? [{ a: end, b: piece.b }] : []),
          ];
        });
      }
      for (const piece of pieces) add(piece.a, piece.b, edge.type, e.id, piece.opening);
    }
  }
  for (const opening of openings) {
    const count = barriers.filter((b) => b.sourceId === opening.id).length;
    if (!count) warnings.push('Abertura sem barreira correspondente: ' + opening.id);
    if (count > 1 && !isWindow(opening.openingType))
      for (const barrier of barriers.filter((b) => b.sourceId === opening.id))
        barrier.doorGroup = opening.id;
  }
  return {
    barriers:
      wallPlacement === 'edge' ? barriers : centerWallBarriers(barriers, owners, pixelsPerMeter),
    ready: !warnings.length,
    warnings,
  };
}
