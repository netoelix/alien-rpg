import { ventRoomName } from './vent-room-name.js';
import { nearestVentPort, ventPortPosition } from './vent-ports.js';
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

// New vertical links are spatially aligned. Legacy links remain readable unchanged.
export function connectVentFloor(project, from, targetFloor) {
  const source = ventLinkEndpoint(project, from);
  if (
    !source ||
    from.floorId === targetFloor ||
    !floorList(project).some((f) => f.id === targetFloor)
  )
    throw Error('Escolha um acesso vertical e outro pavimento.');
  const position = ventPortPosition(source.vent.points, source.port, source.vent.width);
  const type = source.port.type === 'ceiling' ? 'floor' : 'ceiling';
  const elements = floorElements(project, targetFloor);
  const near = elements
    .filter((e) => e.kind === 'vent')
    .map((vent) => ({ vent, hit: nearestVentPort(vent.points, position) }))
    .filter((v) => v.hit && v.hit.distance < 0.001);
  if (near.length > 1)
    throw Error('Há vários dutos nesse ponto no destino. Separe os trechos antes de conectar.');
  let vent = near[0]?.vent,
    hit = near[0]?.hit;
  if (vent?.hidden || vent?.locked) throw Error('Mostre e desbloqueie o duto no destino.');
  if (!vent) {
    const angle = (position.angle * Math.PI) / 180,
      half = source.vent.width / 2;
    const points = [-1, 1].map((sign) => ({
      x: position.x + sign * Math.cos(angle) * half,
      y: position.y + sign * Math.sin(angle) * half,
    }));
    if (points.some((p) => p.x < 0 || p.y < 0 || p.x > project.width || p.y > project.height))
      throw Error(
        'Não há espaço para o trecho inicial nessa posição. Crie um duto no destino ou afaste o acesso da borda.',
      );
    vent = {
      id: uid(),
      kind: 'vent',
      name: 'Acesso entre pavimentos',
      width: source.vent.width,
      points,
    };
    hit = { segment: 0, t: 0.5 };
  }
  const existing = (vent.ports || []).filter((p) => {
    const at = ventPortPosition(vent.points, p, vent.width);
    return p.type !== 'grille' && Math.hypot(at.x - position.x, at.y - position.y) < 0.001;
  });
  if (existing.length > 1 || (existing[0] && existing[0].type !== type))
    throw Error('O acesso existente no destino não é compatível com teto/piso.');
  const port = existing[0] || {
    id: uid(),
    type,
    segment: hit.segment,
    t: hit.t,
    side: 1,
    label: '',
  };
  if (!existing.length) vent = { ...vent, ports: [...(vent.ports || []), port] };
  if (vent.ports.length > 100) throw Error('Limite de 100 acessos por duto.');
  const updated = elements.some((e) => e.id === vent.id)
    ? elements.map((e) => (e.id === vent.id ? vent : e))
    : [...elements, vent];
  const next = {
    ...project,
    floors: floorList(project).map((f) => (f.id === targetFloor ? { ...f, elements: updated } : f)),
  };
  return addVentLink(next, from, { floorId: targetFloor, elementId: vent.id, portId: port.id });
}
