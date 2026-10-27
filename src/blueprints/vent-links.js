import { ventRoomName } from './vent-room-name.js';
import { ventPortPosition } from './vent-ports.js';
import { activeFloor, floorList } from './floors.js';
import { floorElements } from './connections.js';
import { uid } from './model.js';
export function ventLinkEndpoint(project, endpoint) {
  if (!endpoint) return null;
  const vent = floorElements(project, endpoint.floorId).find(
    (e) => e.id === endpoint.elementId && e.kind === 'vent',
  );
  const port = vent?.ports?.find(
    (p) => p.id === endpoint.portId && ['floor', 'ceiling'].includes(p.type),
  );
  return port ? { vent, port } : null;
}
export function validVentLink(project, link) {
  const a = ventLinkEndpoint(project, link.from),
    b = ventLinkEndpoint(project, link.to);
  return !!(
    a &&
    b &&
    link.from.floorId !== link.to.floorId &&
    floorList(project).some((f) => f.id === link.from.floorId) &&
    floorList(project).some((f) => f.id === link.to.floorId) &&
    a.port.type !== b.port.type
  );
}
const matches = (a, b) =>
  a.floorId === b.floorId && a.elementId === b.elementId && a.portId === b.portId;
export function addVentLink(project, from, to) {
  const link = { id: uid(), from, to };
  if (!validVentLink(project, link))
    throw Error('Conecte uma escotilha de teto a uma de piso em outro pavimento.');
  for (const endpoint of [from, to]) {
    const e = ventLinkEndpoint(project, endpoint).vent;
    if (e.locked || e.hidden) throw Error('Mostre e desbloqueie os dutos antes de conectar.');
  }
  const layer = project.layers.find((l) => l.id === 'vents');
  if (!layer?.visible || layer.locked) throw Error('Mostre e desbloqueie a ventilação.');
  if (
    (project.ventLinks || []).some((l) =>
      [l.from, l.to].some((e) => matches(e, from) || matches(e, to)),
    )
  )
    throw Error('Este acesso já possui uma conexão. Desvincule antes de trocar o destino.');
  return { ...project, ventLinks: [...(project.ventLinks || []), link] };
}
export function portDestinations(project, ventId, portId) {
  const endpoint = { floorId: activeFloor(project), elementId: ventId, portId };
  return (project.ventLinks || []).flatMap((link) => {
    const other = matches(link.from, endpoint)
      ? link.to
      : matches(link.to, endpoint)
        ? link.from
        : null;
    if (!other) return [];
    const target = ventLinkEndpoint(project, other),
      floor = floorList(project).find((f) => f.id === other.floorId);
    return target && floor
      ? [
          {
            id: link.id,
            endpoint: other,
            label:
              floor.name +
              ' · ' +
              (target.port.label ||
                ventRoomName(
                  floorElements(project, other.floorId),
                  ventPortPosition(target.vent.points, target.port, target.vent.width),
                ) ||
                target.vent.name ||
                'Acesso de ventilação'),
          },
        ]
      : [];
  });
}
export function normalizeVentLinks(project, value) {
  if (!Array.isArray(value) || value.length > 2000)
    throw Error('Conexões de ventilação inválidas.');
  const ids = new Set(),
    ends = new Set();
  return value.map((l) => {
    if (!l || typeof l.id !== 'string' || !l.id || l.id.length > 100 || ids.has(l.id))
      throw Error('Conexão de ventilação inválida.');
    const endpoint = (e) => {
      if (
        !e ||
        ['floorId', 'elementId', 'portId'].some(
          (k) => typeof e[k] !== 'string' || !e[k] || e[k].length > 100,
        )
      )
        throw Error('Destino de ventilação inválido.');
      return { floorId: e.floorId, elementId: e.elementId, portId: e.portId };
    };
    const link = { id: l.id, from: endpoint(l.from), to: endpoint(l.to) };
    if (!validVentLink(project, link)) throw Error('Conexão de ventilação sem acesso válido.');
    for (const e of [link.from, link.to]) {
      const key = JSON.stringify(e);
      if (ends.has(key)) throw Error('Acesso de ventilação com mais de um destino.');
      ends.add(key);
    }
    ids.add(l.id);
    return link;
  });
}
