import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNarrative, hasRedactions } from '../src/lib/narrative.js';

test('relatos sem censura e datas não oferecem revelação', () => {
  assert.equal(hasRedactions('Operação em 04/04/2120. Retorno em 05/04/2120.'), false);
  assert.equal(hasRedactions('CORROMPIDO'), false);
  assert.equal(hasRedactions('Registro sem tarjas.'), false);
});

test('a segmentação não separa nem expõe conteúdo dentro das tarjas', () => {
  const result = parseNarrative(
    '10:00 Chegada. /Informação secreta. 11:00 Contato./ 12:00 Retorno.',
  );
  const redactions = result.flat().filter((segment) => segment.redacted);
  assert.deepEqual(redactions, [{ text: 'Informação secreta. 11:00 Contato.', redacted: true }]);
  assert.equal(hasRedactions('/Informação secreta/'), true);
  assert.equal(
    result
      .flat()
      .map((segment) => segment.text)
      .join(''),
    '10:00 Chegada. Informação secreta. 11:00 Contato. 12:00 Retorno.',
  );
});
