// Plan views in catalog coordinates. Enclosed bodies occlude the floor; vents and seams are linework.
export const rect = (x, y, width, height, rx = 0) => ({ tag: 'rect', x, y, width, height, rx });
export const line = (d) => ({ tag: 'path', d, fill: 'none' });
export const body = (d) => ({ tag: 'path', d, fill: 'inherit' });
export const circle = (cx, cy, r) => ({ tag: 'circle', cx, cy, r });
