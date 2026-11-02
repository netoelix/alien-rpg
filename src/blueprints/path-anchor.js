import { projectPointToSegment } from './segment-geometry.js';

// Identify the successor of a segment by the vertex edit, even if two runs overlap.
export function remapPathAnchor(segment, t, pointCount, index, action, closed, projectOnto) {
  const last = pointCount - 1;
  if (action === 'insert') {
    if (segment === index)
      return t <= 0.5 ? { segment, t: t * 2 } : { segment: segment + 1, t: t * 2 - 1 };
    return { segment: segment + Number(segment > index), t };
  }
  let successor;
  if (closed && (index === 0 || index === last)) {
    if (segment !== 0 && segment !== last - 1) return { segment: segment - 1, t };
    successor = last - 2;
  } else if (index === 0) {
    if (segment > 0) return { segment: segment - 1, t };
    successor = 0;
  } else if (index === last) {
    if (segment < last - 1) return { segment, t };
    successor = last - 2;
  } else {
    if (segment < index - 1) return { segment, t };
    if (segment > index) return { segment: segment - 1, t };
    successor = index - 1;
  }
  const { point, a, b } = projectOnto(successor);
  const hit = projectPointToSegment(point, a, b);
  if (!hit)
    throw new Error('Não foi possível preservar a abertura em um trecho de comprimento zero.');
  return { segment: successor, t: hit.t };
}
