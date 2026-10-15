export const onlineEditor = import.meta.env.MODE !== 'editor';
export async function editorRequest(action, options) {
  if (!onlineEditor) return fetch(`/__local-editor/${action}`, options);
  const { onlineRequest } = await import('./online-client.js');
  return onlineRequest(action, options);
}
