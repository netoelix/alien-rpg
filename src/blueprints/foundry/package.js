import { buildFoundryBarriers } from './barriers.js';
import { parseProject } from '../model.js';
import { floorList, floorElements } from '../floor-store.js';
import { rotatePoint } from '../orientation.js';
import { ventLinkEndpoint, validVentLink } from '../vent-links.js';
import { ventPortPosition } from '../vent-ports.js';
import { validEndpoint } from '../connections.js';
import { buildVentScenes } from './vent-scenes.js';

export const FOUNDRY_PACKAGE_FORMAT = 'alien-blueprint-foundry';
const key = (endpoint) =>
  JSON.stringify([endpoint.floorId, endpoint.elementId, endpoint.portId ?? null]);

// Stage one: portable data, not a Foundry Scene document. Runtime UUIDs must
// only be assigned after all scenes and regions have been created.
export function buildFoundryPackage(input, { pixelsPerMeter = 100 } = {}) {
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter < 1 || pixelsPerMeter > 300)
    throw Error('Escala de exportação inválida.');
  const project = parseProject(JSON.stringify(input));
  const warnings = [];
  const accesses = new Map();
  const floors = floorList(project);
  const sceneKeys = new Map(floors.map((floor, index) => [floor.id, 'floor-' + (index + 1)]));
  const ventilationScenes = buildVentScenes(project, floors, sceneKeys, pixelsPerMeter);
  const point = (p) => ({ x: p.x * pixelsPerMeter, y: p.y * pixelsPerMeter });
  function endpoint(source, ventilation) {
    const id = key(source);
    if (accesses.has(id)) return accesses.get(id);
    let center, polygon, label, kind;
    if (ventilation) {
      const { vent, port } = ventLinkEndpoint(project, source);
      center = ventPortPosition(vent.points, port);
      const r = vent.width / 2;
      polygon = [
        { x: center.x - r, y: center.y - r },
        { x: center.x + r, y: center.y - r },
        { x: center.x + r, y: center.y + r },
        { x: center.x - r, y: center.y + r },
      ];
      label = port.label || 'Acesso de ventilação';
      kind = 'vent';
    } else {
      const e = floorElements(project, source.floorId).find((e) => e.id === source.elementId);
      center = { x: e.x + e.w / 2, y: e.y + e.h / 2 };
      polygon = [
        [e.x, e.y],
        [e.x + e.w, e.y],
        [e.x + e.w, e.y + e.h],
        [e.x, e.y + e.h],
      ].map(([x, y]) => rotatePoint(e, x, y));
      label =
        e.name ||
        { stairs: 'Escada', elevator: 'Elevador', freightLift: 'Elevador de carga' }[e.asset];
      kind = e.asset;
    }
    if (polygon.some((p) => p.x < 0 || p.y < 0 || p.x > project.width || p.y > project.height))
      throw Error('Acesso fora dos limites do mapa: ' + label);
    const access = {
      key: 'access-' + (accesses.size + 1),
      sceneKey: ventilation
        ? ventilationScenes.locations.get(JSON.stringify([source.floorId, source.elementId]))
        : sceneKeys.get(source.floorId),
      source: structuredClone(source),
      kind,
      name: label,
      center: point(center),
      polygon: polygon.map(point),
      targets: [],
    };
    accesses.set(id, access);
    return access;
  }
  for (const [links, ventilation] of [
    [project.connections || [], false],
    [project.ventLinks || [], true],
  ]) {
    for (const link of links) {
      if (
        ventilation
          ? !validVentLink(project, link)
          : !validEndpoint(project, link.from) || !validEndpoint(project, link.to)
      )
        throw Error('Conexão inválida: ' + link.id);
      const a = endpoint(link.from, ventilation),
        b = endpoint(link.to, ventilation);
      if (a.key === b.key) throw Error('Uma conexão precisa de dois acessos distintos.');
      if (!a.targets.includes(b.key)) a.targets.push(b.key);
      if (!b.targets.includes(a.key)) b.targets.push(a.key);
    }
  }
  for (const entrance of ventilationScenes.entrances) {
    const r = entrance.width / 2,
      center = point(entrance.center);
    const polygon = [
      [-r, -r],
      [r, -r],
      [r, r],
      [-r, r],
    ].map(([x, y]) => point({ x: entrance.center.x + x, y: entrance.center.y + y }));
    if (
      polygon.some(
        (p) =>
          p.x < 0 ||
          p.y < 0 ||
          p.x > project.width * pixelsPerMeter ||
          p.y > project.height * pixelsPerMeter,
      )
    )
      throw Error('Acesso ao duto fora dos limites do mapa.');
    const source = {
      floorId: entrance.floorId,
      elementId: entrance.elementId,
      portId: entrance.portId,
    };
    const a = {
      key: 'access-' + (accesses.size + 1),
      sceneKey: sceneKeys.get(entrance.floorId),
      kind: 'vent-entry',
      source,
      name: entrance.name,
      center,
      polygon,
      targets: [],
    };
    const b = {
      ...a,
      key: 'access-' + (accesses.size + 2),
      sceneKey: entrance.sceneKey,
      kind: 'vent',
    };
    a.center = point(entrance.floorCenter || entrance.center);
    a.polygon = polygon.map((p) => ({
      x: p.x + a.center.x - center.x,
      y: p.y + a.center.y - center.y,
    }));
    if (
      a.polygon.some(
        (p) =>
          p.x < 0 ||
          p.y < 0 ||
          p.x > project.width * pixelsPerMeter ||
          p.y > project.height * pixelsPerMeter,
      )
    )
      throw Error('Chegada do duto fora dos limites do mapa.');
    a.targets = [b.key];
    b.targets = [a.key];
    accesses.set('entry-' + a.key, a);
    accesses.set('entry-' + b.key, b);
  }
  if (accesses.size)
    warnings.push(
      'Conferir espaço livre no centro de cada acesso: a Suíte MÃE usa esse ponto para a chegada.',
    );
  if (ventilationScenes.scenes.length)
    warnings.push(
      'Ventilação exportada em cenas exclusivas por rede. Confira o tamanho do token e a área de chegada nos acessos dos dutos.',
    );
  return {
    format: FOUNDRY_PACKAGE_FORMAT,
    version: 1,
    stage: 'barrier-plan',
    name: project.name,
    compatibility: {
      foundry: 14,
      importerVersion: '0.2.2',
      suite: 'alien-suite-mae',
      suiteVersion: '0.4.1',
    },
    pixelsPerMeter,
    units: 'm',
    scenes: [
      ...floors.map((floor) => ({
        geometry: buildFoundryBarriers(floorElements(project, floor.id), pixelsPerMeter),
        key: sceneKeys.get(floor.id),
        name: `${project.name} - ${floor.name}`,
        sourceFloorId: floor.id,
        width: project.width * pixelsPerMeter,
        height: project.height * pixelsPerMeter,
        grid: { distance: project.grid, size: project.grid * pixelsPerMeter },
        elements: structuredClone(floorElements(project, floor.id)),
      })),
      ...ventilationScenes.scenes,
    ],
    accesses: [...accesses.values()],
    warnings,
  };
}

// Receives the UUIDs actually returned by Foundry. Never guesses IDs or
// connects to an existing scene just because it has the same name.
export function resolveAccessFlags(bundle, regionUUIDs) {
  if (bundle.format !== FOUNDRY_PACKAGE_FORMAT || bundle.version !== 1)
    throw Error('Pacote incompatível.');
  const ids = new Set(bundle.accesses.map((a) => a.key));
  if (ids.size !== bundle.accesses.length) throw Error('Acessos duplicados.');
  const seen = new Set();
  for (const access of bundle.accesses) {
    const uuid = regionUUIDs.get(access.key);
    if (
      typeof uuid !== 'string' ||
      !/^Scene\.[A-Za-z0-9]+\.Region\.[A-Za-z0-9]+$/.test(uuid) ||
      seen.has(uuid)
    )
      throw Error('Região ausente ou duplicada: ' + access.key);
    seen.add(uuid);
    if (access.targets.some((id) => !ids.has(id) || id === access.key))
      throw Error('Destino inválido.');
  }
  return bundle.accesses.map((access) => ({
    uuid: regionUUIDs.get(access.key),
    flags: {
      'alien-suite-mae': {
        access: {
          enabled: true,
          auto: true,
          targets: [...new Set(access.targets.map((id) => regionUUIDs.get(id)))],
        },
      },
    },
  }));
}
