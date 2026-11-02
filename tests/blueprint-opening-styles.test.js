import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { openingNames } from '../src/blueprints/opening-types.js';
import { openingCandidate } from '../src/blueprints/placement.js';
test('all opening styles fit the same wall and survive saving', () => {
  const p = { ...newProject(), elements: [{ kind: 'room', id: 'r', x: 2, y: 2, w: 10, h: 10 }] };
  for (const style of Object.keys(openingNames)) {
    const hit = openingCandidate(p, { x: 7, y: 2 }, 1.5, style, 0.3);
    assert.ok(hit.element);
    const opening = parseProject(JSON.stringify({ ...p, elements: [...p.elements, hit.element] }))
      .elements[1];
    assert.equal(opening.wallId, 'r');
    assert.equal(opening.openingType, style);
  }
});
