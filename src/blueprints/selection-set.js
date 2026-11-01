import { expandGroups } from './groups.js';
import { selectInBox } from './selection.js';

function selectionSet(project, ids, preferred) {
  const roots = new Set(
    project.elements.filter((item) => item.kind !== 'door').map((item) => item.id),
  );
  const selectedId =
    roots.has(preferred) && ids.includes(preferred) ? preferred : ids.find((id) => roots.has(id));
  return selectedId ? { selectedId, ids } : null;
}

export function boxSelection(project, gesture, current, primary = current[0]) {
  const hits = selectInBox(project, gesture.start, gesture.end);
  const ids = gesture.additive ? [...current, ...hits] : hits;
  return selectionSet(project, expandGroups(project, ids), gesture.additive ? primary : null);
}

export function toggleSelection(project, current, id, primary = current[0]) {
  const ids = new Set(current);
  const remove = ids.has(id);
  for (const member of expandGroups(project, [id])) {
    if (remove) ids.delete(member);
    else ids.add(member);
  }
  return selectionSet(project, [...ids], primary);
}

export function clickedGroup(project, element) {
  const ids = expandGroups(project, [element.id]);
  return selectionSet(project, ids, element.kind === 'door' ? element.wallId : element.id);
}
