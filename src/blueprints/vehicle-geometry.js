// Project normalized vehicle plans into metres so their strokes stay uniform.
export function vehicleShape({ tag, ...shape }, w, h) {
  const props = { ...shape };
  for (const key of ['x', 'width', 'cx', 'rx']) if (props[key] !== undefined) props[key] *= w / 100;
  for (const key of ['y', 'height', 'cy', 'ry'])
    if (props[key] !== undefined) props[key] *= h / 100;
  if (props.d) {
    let command = '',
      axis = 0;
    props.d = props.d.replace(/[MLHVZ]|-?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi, (token) => {
      if (/^[a-z]$/i.test(token)) {
        command = token.toUpperCase();
        axis = 0;
        return token;
      }
      const scale = command === 'H' ? w : command === 'V' ? h : axis++ % 2 === 0 ? w : h;
      return String((Number(token) * scale) / 100);
    });
  }
  return { tag, ...props };
}
