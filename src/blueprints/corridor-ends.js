export function setCorridorEnd(project, id, end, closed) {
  const c = project.elements.find((e) => e.id === id);
  if (c?.kind !== 'corridor') throw new Error('Selecione um corredor.');
  const n = (c.points.length - 1) * 2;
  const oldNames = [
    ...(c.closedStart ? ['closedStart'] : []),
    ...(c.closedEnd ? ['closedEnd'] : []),
  ];
  const updated = { ...c, [end]: closed };
  const names = [
    ...(updated.closedStart ? ['closedStart'] : []),
    ...(updated.closedEnd ? ['closedEnd'] : []),
  ];
  const remap = (segment) =>
    segment < n
      ? segment
      : names.includes(oldNames[segment - n])
        ? n + names.indexOf(oldNames[segment - n])
        : -1;
  updated.walls = (c.walls || [])
    .filter((w) => remap(w.segment) >= 0)
    .map((w) => ({ ...w, segment: remap(w.segment) }));
  return {
    ...project,
    elements: project.elements
      .filter((e) => !(e.wallId === id && remap(e.segment) < 0))
      .map((e) =>
        e.id === id ? updated : e.wallId === id ? { ...e, segment: remap(e.segment) } : e,
      ),
  };
}
