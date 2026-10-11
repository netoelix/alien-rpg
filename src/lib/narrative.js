// O acervo marca censuras com /texto/. Datas usam barras, mas nunca são censuras.
// Exigir uma letra evita confundir /04/ ou /2120/ com trechos narrativos.
const redactionPattern = /(?<!\d)\/([^/]*\p{L}[^/]*)\/(?!\d)/gu;
const paragraphBoundary =
  /(?<=\.)\s+(?=(?:\d{2}:\d{2}|DESAPARECIDOS:|MORTOS:|Fim da transmissão))/g;

export function parseNarrative(text = '') {
  const paragraphs = [[]];
  let cursor = 0;

  function appendPlainText(value) {
    const parts = value.split(paragraphBoundary);
    parts.forEach((part, index) => {
      if (index > 0) paragraphs.push([]);
      if (part) paragraphs.at(-1).push({ text: part, redacted: false });
    });
  }

  for (const match of text.matchAll(redactionPattern)) {
    appendPlainText(text.slice(cursor, match.index));
    paragraphs.at(-1).push({ text: match[1], redacted: true });
    cursor = match.index + match[0].length;
  }
  appendPlainText(text.slice(cursor));
  return paragraphs;
}

export function hasRedactions(text) {
  return parseNarrative(text).some((paragraph) => paragraph.some((segment) => segment.redacted));
}
