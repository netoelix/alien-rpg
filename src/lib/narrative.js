// O acervo marca censuras com /texto/. Datas usam barras, mas nunca são censuras.
// Exigir uma letra evita confundir /04/ ou /2120/ com trechos narrativos.
const redactionPattern = /(?<!\d)\/([^/]*\p{L}[^/]*)\/(?!\d)/gu;
const paragraphBoundary =
  /\r?\n\s*\r?\n|(?<=[.!?])\s+(?=(?:\d{2}:\d{2}|DESAPARECIDOS:|MORTOS:|Fim da transmissão))/g;

export function parseNarrative(text = '') {
  const segments = [];
  let plainText = '';
  let cursor = 0;

  function append(value, redacted) {
    if (!value) return;
    const start = plainText.length;
    plainText += value;
    segments.push({ start, end: plainText.length, redacted });
  }

  // Reconhece as tarjas antes dos parágrafos: uma quebra nunca expõe
  // o restante de um trecho censurado, mesmo quando inclui horários.
  for (const match of text.matchAll(redactionPattern)) {
    append(text.slice(cursor, match.index), false);
    append(match[1], true);
    cursor = match.index + match[0].length;
  }
  append(text.slice(cursor), false);

  const paragraphs = [];
  function appendParagraph(start, end) {
    const paragraph = segments
      .filter((segment) => segment.start < end && segment.end > start)
      .map((segment) => ({
        text: plainText.slice(Math.max(start, segment.start), Math.min(end, segment.end)),
        redacted: segment.redacted,
      }));
    if (paragraph.some((segment) => segment.text.trim())) paragraphs.push(paragraph);
  }

  cursor = 0;
  for (const boundary of plainText.matchAll(paragraphBoundary)) {
    appendParagraph(cursor, boundary.index);
    cursor = boundary.index + boundary[0].length;
  }
  appendParagraph(cursor, plainText.length);
  return paragraphs;
}

export function hasRedactions(text) {
  return parseNarrative(text).some((paragraph) => paragraph.some((segment) => segment.redacted));
}
