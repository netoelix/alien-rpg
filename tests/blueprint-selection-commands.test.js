import test from 'node:test';
import assert from 'node:assert/strict';
import { newProject } from '../src/blueprints/model.js';
import { selectionCommands } from '../src/blueprints/selection-commands.js';
import { applyEdit, startHistory, undoEdit } from '../src/blueprints/edit-history.js';

test('clipboard commands preserve the pending drawing and select a pasted room with its opening', () => {
  const room = { id: 'room', kind: 'room', x: 3, y: 3, w: 8, h: 8 };
  const door = { id: 'door', kind: 'door', wallId: room.id, segment: 0, width: 1, t: 0.5 };
  const project = { ...newProject(), elements: [room, door] };
  let history = startHistory(project);
  const clipboard = { current: null };
  let selected, group, tool;
  const context = {
    project,
    selected: room.id,
    selectedElement: room,
    editable: true,
    clipboard,
    commit(next) {
      history = applyEdit(history, next);
      return true;
    },
    setSelected(value) {
      selected = value;
    },
    setPastedGroup(value) {
      group = value;
    },
    setTool(value) {
      tool = value;
    },
    setMessage() {},
  };
  selectionCommands({ ...context, drawing: true }).copySelection();
  assert.equal(clipboard.current, null);
  const commands = selectionCommands(context);
  commands.copySelection();
  selectionCommands({ ...context, commit: () => false }).pasteSelection();
  assert.equal(clipboard.current.count, 0);
  assert.equal(selected, undefined);
  commands.pasteSelection();
  assert.equal(clipboard.current.count, 1);
  assert.equal(tool, 'select');
  assert.equal(group.selectedId, selected);
  const copiedDoor = history.project.elements.find(
    (e) => e.kind === 'door' && group.ids.includes(e.id),
  );
  assert.equal(copiedDoor.wallId, selected);
  assert.equal(undoEdit(history).project, project);
});
