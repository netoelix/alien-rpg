import test from 'node:test';
import assert from 'node:assert/strict';
import { editJournal } from '../data/journal-editing.js';

test('criar, editar e remover diário preserva as outras entradas e o texto original', () => {
  const form = { id: '', title: ' Partida ', dateTime: ' 2120 ', text: 'Linha um.\n\nLinha dois.' };
  const created = editJournal([], form, { createId: () => 'pagina-1' });
  const entries = [...created, { ...created[0], id: 'pagina-2' }];
  const edited = editJournal(entries, { ...created[0], title: 'Retorno' });
  assert.equal(edited[0].title, 'Retorno');
  assert.equal(edited[0].text, form.text);
  assert.deepEqual(edited[1], entries[1]);
  assert.equal(entries[0].title, 'Partida');
  assert.deepEqual(editJournal(edited, edited[0], { remove: true }), [entries[1]]);
});

test('rascunho de entrada ausente não simula sucesso nem perde o texto preenchido', () => {
  const form = { id: 'removida', title: 'Memórias', dateTime: '2120', text: 'Texto recuperado.' };
  for (const remove of [false, true]) {
    assert.throws(() => editJournal([], form, { remove }), /não existe mais/);
  }
  assert.equal(form.text, 'Texto recuperado.');
  assert.throws(() => editJournal([], { ...form, id: '', text: ' ' }), /Preencha/);
});
