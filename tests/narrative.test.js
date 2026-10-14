import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNarrative, hasRedactions } from '../src/lib/narrative.js';

test('relatos sem censura e datas não oferecem revelação', () => {
  assert.equal(hasRedactions('Operação em 04/04/2120. Retorno em 05/04/2120.'), false);
  assert.equal(hasRedactions('CORROMPIDO'), false);
  assert.equal(hasRedactions('Registro sem tarjas.'), false);
});

test('a segmentação por horário preserva as tarjas em todos os parágrafos', () => {
  const result = parseNarrative(
    '10:00 Chegada. /Informação secreta. 11:00 Contato./ 12:00 Retorno.',
  );
  const redactions = result.flat().filter((segment) => segment.redacted);
  assert.deepEqual(redactions, [
    { text: 'Informação secreta.', redacted: true },
    { text: '11:00 Contato.', redacted: true },
  ]);
  assert.equal(hasRedactions('/Informação secreta/'), true);
  assert.equal(
    result.map((paragraph) => paragraph.map((segment) => segment.text).join('')).join(' '),
    '10:00 Chegada. Informação secreta. 11:00 Contato. 12:00 Retorno.',
  );
});

test('parágrafos explícitos dentro de censuras não expõem o segundo trecho', () => {
  assert.deepEqual(parseNarrative('Antes.\n\n/Segredo um.\n\nSegredo dois./\n\nDepois.'), [
    [{ text: 'Antes.', redacted: false }],
    [{ text: 'Segredo um.', redacted: true }],
    [{ text: 'Segredo dois.', redacted: true }],
    [{ text: 'Depois.', redacted: false }],
  ]);
});

test('horário iniciado em outra tarja abre parágrafo; datas e linhas simples são preservadas', () => {
  assert.equal(parseNarrative('10:00 Chegada. /11:00 Segredo/. 12:00 Retorno.').length, 3);
  assert.deepEqual(parseNarrative('04/04/2120\nEquipe: Trisha'), [
    [{ text: '04/04/2120\nEquipe: Trisha', redacted: false }],
  ]);
  assert.deepEqual(parseNarrative('\n\n'), []);
});
