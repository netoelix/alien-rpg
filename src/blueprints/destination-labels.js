export function destinationLines(text, limit = 24) {
  const words = text.trim().split(/\s+/),
    lines = [];
  let line = '';
  for (let word of words) {
    if (line && line.length + word.length + 1 > limit) {
      lines.push(line);
      line = '';
    }
    while (word.length > limit) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(word.slice(0, limit));
      word = word.slice(limit);
    }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}
export function moveDestinationLabel(element, key, dx, dy) {
  const offset = element.destinationOffsets?.[key] || {};
  return {
    ...element,
    destinationOffsets: {
      ...element.destinationOffsets,
      [key]: { dx: (offset.dx || 0) + dx, dy: (offset.dy || 0) + dy },
    },
  };
}
