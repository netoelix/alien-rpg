import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject, parseProject } from '../src/blueprints/model.js';
import { createModule, parseModule } from '../src/blueprints/modules.js';
test('multiline labels retain alignment and emphasis through projects and modules', () => {
  const project = {
    ...newProject(),
    elements: [
      {
        id: 'text',
        kind: 'label',
        x: 20,
        y: 20,
        text: 'PONTE\nDE COMANDO',
        size: 2,
        align: 'middle',
        bold: true,
      },
    ],
  };
  const saved = parseProject(JSON.stringify(project));
  assert.deepEqual(saved.elements[0], project.elements[0]);
  const module = parseModule(JSON.stringify(createModule(saved, ['text'], 'Nome')));
  assert.equal(module.elements[0].align, 'middle');
  assert.equal(module.elements[0].bold, true);
});
test('legacy labels remain compatible and malformed styles are rejected', () => {
  const label = { id: 'text', kind: 'label', x: 2, y: 2, text: 'PONTE', size: 1 };
  const project = { ...newProject(), elements: [label] };
  assert.deepEqual(parseProject(JSON.stringify(project)).elements[0], label);
  assert.throws(() =>
    parseProject(JSON.stringify({ ...project, elements: [{ ...label, align: 'invalid' }] })),
  );
  assert.throws(() =>
    parseProject(JSON.stringify({ ...project, elements: [{ ...label, bold: 'yes' }] })),
  );
});

test('multiline selection bounds respect size and alignment', async () => {
  const { selectionBounds } = await import('../src/blueprints/selection.js');
  const e = { kind: 'label', x: 20, y: 20, size: 2, text: 'PONTE\nCOMANDO' };
  const left = selectionBounds(e),
    center = selectionBounds({ ...e, align: 'middle' }),
    right = selectionBounds({ ...e, align: 'end' });
  assert.ok(left.h > 4);
  assert.equal(center.x, 20 - left.w / 2);
  assert.equal(right.x, 20 - left.w);
  assert.equal(selectionBounds({ ...e, size: 4 }).w, left.w * 2);
});
