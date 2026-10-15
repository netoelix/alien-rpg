export function journalFormUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'forms.gle' ||
        (url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')))
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function JournalSubmission() {
  const url = journalFormUrl(import.meta.env.VITE_JOURNAL_FORM_URL);
  if (!url) return null;
  return (
    <div className="journal-submission">
      <a className="button" href={url} target="_blank" rel="noopener noreferrer">
        ENVIAR DIÁRIO ↗
      </a>
      <p className="muted small-text">
        O formulário abre no Google Forms. O texto será revisado pelo mestre antes de aparecer no
        site.
      </p>
    </div>
  );
}
