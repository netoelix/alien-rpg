import test from 'node:test';
import assert from 'node:assert/strict';
import { openingGeometry } from '../src/blueprints/wall-geometry.js';
import { persistentWallStructure, sharedWallStructures } from '../src/blueprints/shared-walls.js';
test('shared opening geometry matches independent calculations and refreshes after edits', () => {
  for (const type of ['internal', 'hull', 'structural', 'glass']) {
    const room = {
      id: 'r',
      kind: 'room',
      x: 5,
      y: 5,
      w: 10,
      h: 10,
      walls: [{ segment: 0, start: 0, end: 1, type }],
    };
    const other = { id: 's', kind: 'room', x: 15, y: 5, w: 10, h: 10 };
    const door = { id: 'd', kind: 'door', wallId: 'r', segment: 0, t: 0.5, width: 1 };
    for (const dx of [0, 3]) {
      const elements = [{ ...room, x: room.x + dx }, other, door];
      const resolved = sharedWallStructures(
        elements.filter((e) => e.kind === 'room').map(persistentWallStructure),
      );
      assert.deepEqual(openingGeometry(door, elements, resolved), openingGeometry(door, elements));
    }
  }
});
