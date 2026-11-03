import assert from 'node:assert/strict';
import test from 'node:test';
import { areaElement } from '../src/blueprints/area-tools.js';
import { newProject, parseProject, wallSegments } from '../src/blueprints/model.js';
for (const type of ['plateau', 'depression']) {
  test(type + ' persists as a wall-free elliptical region with adjustable detail', () => {
    const element = areaElement({ id: 't', kind: 'ellipse', x: 2, y: 4, w: 15, h: 9 }, type, {
      size: 2,
      height: 7,
      opacity: 0.35,
    });
    const result = parseProject(
      JSON.stringify({ ...newProject(), mode: 'colony', elements: [element] }),
    );
    assert.deepEqual(result.elements[0], element);
    assert.deepEqual(wallSegments(element), []);
  });
}
