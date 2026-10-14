// Formulários recuperados podem referenciar entradas ausentes após importar um backup.
export function editJournal(
  entries,
  form,
  { remove = false, createId = () => crypto.randomUUID() } = {},
) {
  if (form.id && !entries.some((entry) => entry.id === form.id)) {
    throw new Error(
      'Esta entrada não existe mais. Copie seu texto e selecione Nova entrada para recuperá-lo.',
    );
  }
  if (remove) {
    if (!form.id) throw new Error('Selecione uma entrada para remover.');
    return entries.filter((entry) => entry.id !== form.id);
  }
  if (
    ['title', 'dateTime', 'text'].some(
      (field) => typeof form[field] !== 'string' || !form[field].trim(),
    )
  ) {
    throw new Error('Preencha título, data no universo e texto.');
  }
  const entry = {
    id: form.id || createId(),
    title: form.title.trim(),
    dateTime: form.dateTime.trim(),
    text: form.text,
  };
  return form.id
    ? entries.map((current) => (current.id === form.id ? entry : current))
    : [...entries, entry];
}
