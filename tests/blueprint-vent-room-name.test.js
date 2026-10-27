import test from 'node:test';
import assert from 'node:assert/strict';
import { ventRoomName } from '../src/blueprints/vent-room-name.js';
import { portDestinations } from '../src/blueprints/vent-links.js';
import { newProject } from '../src/blueprints/model.js';
const room = { id: 'room', kind: 'room', name: 'Enfermaria', x: 2, y: 2, w: 10, h: 10 };
test('automatic vent names detect room interiors, boundaries and rotated rooms', () => {
  assert.equal(ventRoomName([room], { x: 5, y: 5 }), 'Enfermaria');
  assert.equal(ventRoomName([room], { x: 2, y: 6 }), 'Enfermaria');
  assert.equal(ventRoomName([room], { x: 20, y: 20 }), '');
  assert.equal(ventRoomName([{ ...room, hidden: true }], { x: 5, y: 5 }), '');
  assert.equal(ventRoomName([{ ...room, rotation: 45 }], { x: 7, y: 7 }), 'Enfermaria');
  assert.equal(
    ventRoomName([room, { ...room, id: 'small', name: 'Triagem', x: 4, y: 4, w: 2, h: 2 }], {
      x: 5,
      y: 5,
    }),
    'Triagem',
  );
});
test('cross-floor destination follows automatic room name and respects manual override', () => {
  const vent = {
    id: 'v',
    kind: 'vent',
    width: 1,
    points: [
      { x: 4, y: 5 },
      { x: 8, y: 5 },
    ],
    ports: [{ id: 'p', type: 'floor', segment: 0, t: 0.5, side: 1, label: '' }],
  };
  const project = {
    ...newProject(),
    activeFloor: 'a',
    floors: [
      { id: 'a', name: 'Inferior' },
      { id: 'b', name: 'Superior', elements: [room, vent] },
    ],
    ventLinks: [
      {
        id: 'l',
        from: { floorId: 'a', elementId: 'source', portId: 's' },
        to: { floorId: 'b', elementId: 'v', portId: 'p' },
      },
    ],
  };
  assert.equal(portDestinations(project, 'source', 's')[0].label, 'Superior · Enfermaria');
  room.name = 'Laboratório';
  assert.equal(portDestinations(project, 'source', 's')[0].label, 'Superior · Laboratório');
  vent.ports[0].label = 'Saída de emergência';
  assert.equal(portDestinations(project, 'source', 's')[0].label, 'Superior · Saída de emergência');
});
