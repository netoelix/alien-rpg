import { wallSegments } from './model.js';

// Wall masks only need the room boundary and its thickest corner caps.
// Keep the original map clipping, including structures crossing its border.
export function wallMaskBounds(element, width, height) {
  const points = wallSegments(element).flat();
  if (!points.length) return { x: 0, y: 0, width, height };
  const margin = 2;
  const x = Math.max(0, Math.min(...points.map((p) => p[0])) - margin);
  const y = Math.max(0, Math.min(...points.map((p) => p[1])) - margin);
  const right = Math.min(width, Math.max(...points.map((p) => p[0])) + margin);
  const bottom = Math.min(height, Math.max(...points.map((p) => p[1])) + margin);
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}
