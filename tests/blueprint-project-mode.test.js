import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, exampleProject, parseProject } from '../src/blueprints/model.js';
import { assetInMode, toolInMode, pathInMode } from '../src/blueprints/project-mode.js';
test('colony mode roundtrips without changing existing objects, floors or dimensions', () => {
  const original = exampleProject();
  const baseline = parseProject(JSON.stringify(original));
  const colony = parseProject(JSON.stringify({ ...baseline, mode: 'colony' }));
  assert.equal(colony.mode, 'colony');
  assert.deepEqual({ ...colony, mode: 'construction' }, baseline);
  assert.deepEqual(parseProject(JSON.stringify({ ...colony, mode: 'construction' })), baseline);
});
test('old projects default to construction and unknown modes are rejected', () => {
  const old = newProject();
  delete old.mode;
  assert.equal(parseProject(JSON.stringify(old)).mode, 'construction');
  assert.throws(() => parseProject(JSON.stringify({ ...old, mode: 'unknown' })), /Modo/);
});
test('colony creation separates interior tools and assets, preserving common exterior tools', () => {
  const colony = { mode: 'colony' };
  for (const tool of ['door', 'wall', 'vent', 'module'])
    assert.equal(toolInMode(colony, tool), false);
  for (const tool of ['select', 'pan', 'room', 'trace', 'asset', 'dimension', 'label'])
    assert.equal(toolInMode(colony, tool), true);
  assert.equal(pathInMode(colony, 'corridor'), false);
  assert.equal(pathInMode(colony, 'road'), true);
  assert.equal(assetInMode(colony, 'gardenTree'), true);
  assert.equal(assetInMode(colony, 'commandBench'), false);
  assert.equal(assetInMode(newProject(), 'commandBench'), true);
});
