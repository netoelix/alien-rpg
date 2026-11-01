import {
  draftRemoval,
  copyBlueprint,
  draftPaste,
  duplicateSelection,
  movePastedGroup,
} from './clipboard.js';
import {
  expandGroups,
  draftSelectionGroup,
  convertRoomsToPolygons,
  rotateGroup,
} from './groups.js';
import { removeElement, duplicateElement, moveElement } from './model.js';

export function selectionCommands({
  project,
  selected,
  selectedElement,
  editable,
  pastedGroup,
  drawing,
  clipboard,
  commit,
  allowed,
  setSelected,
  setPastedGroup,
  setMessage,
  setTool,
  selectionAngle,
  rotationFrame,
  svgRef,
  property,
}) {
  function remove() {
    if (drawing) return;
    if (pastedGroup?.ids.length) {
      try {
        if (commit(draftRemoval(project, pastedGroup.ids))) {
          setSelected(null);
          setPastedGroup(null);
          setMessage('Seleção removida. Ctrl+Z restaura o conjunto.');
        }
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    if (selected && allowed(selectedElement?.kind)) {
      commit(removeElement(project, selected));
      setSelected(null);
    }
  }

  function groupSelection(ungroup = false) {
    if (drawing) return;
    try {
      const ids = expandGroups(project, pastedGroup?.ids || (selected ? [selected] : []));
      if (commit(draftSelectionGroup(project, ids, ungroup))) {
        setPastedGroup(ids.length ? { selectedId: selected || ids[0], ids } : null);
        setMessage(
          ungroup
            ? 'Grupo desfeito; peças continuam selecionadas.'
            : 'Grupo criado. Será preservado ao salvar o projeto.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function copySelection() {
    if (drawing) return;
    try {
      clipboard.current = { ...copyBlueprint(project, pastedGroup?.ids || selected), count: 0 };
      setMessage('Cópia guardada nesta aba. Use Ctrl+V na planta para colar.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function pasteSelection() {
    if (drawing) return;
    try {
      const offset = project.grid * ((clipboard.current?.count || 0) + 1);
      const result = draftPaste(project, clipboard.current, offset, offset);
      if (commit(result.project)) {
        clipboard.current.count++;
        setSelected(result.selectedId);
        setPastedGroup({ selectedId: result.selectedId, ids: result.ids });
        setTool('select');
        setMessage(
          'Cópia selecionada. Arraste a estrutura para mover o conjunto; Escape libera as peças.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function duplicate() {
    if (!editable || drawing) return;
    try {
      const copy = pastedGroup?.ids.length
        ? duplicateSelection(project, pastedGroup.ids)
        : duplicateElement(project, selected);
      if (commit(copy.project)) {
        setSelected(copy.selectedId);
        setPastedGroup(copy.ids ? { selectedId: copy.selectedId, ids: copy.ids } : null);
        setTool('select');
        setMessage(
          copy.ids
            ? 'Conjunto duplicado e selecionado. Arraste para posicionar.'
            : 'Cópia selecionada. Arraste para posicionar; equipamentos internos são peças independentes.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function convertSelectedRooms() {
    if (!editable || drawing) return;
    try {
      if (commit(convertRoomsToPolygons(project, pastedGroup?.ids || [selected]))) {
        setMessage(
          'Sala convertida em vértices. Paredes e aberturas preservadas; Ctrl+Z restaura o retângulo.',
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function rotateFreely() {
    if (!editable || drawing) return;
    try {
      const ids = pastedGroup?.ids || [selected];
      commit(rotateGroup(project, ids, 1, Number(selectionAngle), rotationFrame));
    } catch (error) {
      setMessage(error.message);
    }
    svgRef.current?.focus();
  }

  function rotateSelection(delta) {
    if (pastedGroup?.ids.length && !drawing) {
      try {
        commit(rotateGroup(project, pastedGroup.ids, delta > 0 ? 1 : -1));
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    if (selectedElement && selectedElement.kind !== 'door' && !drawing) {
      if (selectedElement.kind !== 'asset') {
        try {
          commit(rotateGroup(project, [selected], delta > 0 ? 1 : -1));
        } catch (error) {
          setMessage(error.message);
        }
        return;
      }

      property('rotation', (((selectedElement.rotation + delta) % 360) + 360) % 360);
    }
  }

  function nudge(dx, dy) {
    if (!editable || selectedElement.kind === 'door' || drawing) return;
    if (pastedGroup?.selectedId === selected) {
      try {
        commit(movePastedGroup(project, pastedGroup.ids, dx, dy));
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }
    commit({
      ...project,
      elements: project.elements.map((element) =>
        element.id === selected ? moveElement(element, dx, dy) : element,
      ),
    });
  }

  return {
    remove,
    groupSelection,
    copySelection,
    pasteSelection,
    duplicate,
    convertSelectedRooms,
    rotateFreely,
    rotateSelection,
    nudge,
  };
}
