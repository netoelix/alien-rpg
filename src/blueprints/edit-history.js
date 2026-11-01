import { prepareEdit } from './prepare-edit.js';

const historyLimit = 50;

export function startHistory(project) {
  return { project, past: [], future: [] };
}

export function applyEdit(history, candidate) {
  const project = prepareEdit(history.project, candidate);
  return {
    project,
    past: [...history.past.slice(1 - historyLimit), history.project],
    future: [],
  };
}

export function undoEdit(history) {
  if (!history.past.length) return history;
  return {
    project: history.past.at(-1),
    past: history.past.slice(0, -1),
    future: [history.project, ...history.future],
  };
}

export function redoEdit(history) {
  if (!history.future.length) return history;
  return {
    project: history.future[0],
    past: [...history.past, history.project],
    future: history.future.slice(1),
  };
}
