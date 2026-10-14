import { useState } from 'react';
import { useMapDraft } from './useMapDraft.js';
import { editJournal } from '../../data/journal-editing.js';

const emptyEntry = { id: '', title: '', dateTime: '', text: '' };

export function JournalEditor({ campaign, storageKey, onApply }) {
  const characters = campaign.players.flatMap((player) =>
    player.characters.map((character) => ({ ...character, ownerName: player.playerId })),
  );
  const [form, setForm] = useMapDraft(storageKey, { characterId: '', ...emptyEntry });
  const [message, setMessage] = useState('');
  const character = characters.find((item) => item.id === form.characterId);
  const entries = character?.journal || [];
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function apply(remove = false) {
    if (!character) return setMessage('Selecione um personagem.');
    let journal;
    try {
      journal = editJournal(entries, form, { remove });
    } catch (error) {
      setMessage(error.message);
      return;
    }
    if (onApply(character.id, journal)) {
      setForm({ characterId: character.id, ...emptyEntry });
      setMessage(
        remove
          ? 'Entrada removida do rascunho.'
          : 'Diário aplicado ao rascunho. Confira o site antes de salvar.',
      );
    }
  }

  return (
    <section className="editor-form">
      <p>
        Escreva a vivência do personagem. As páginas ficam públicas após a publicação do site; as
        datas pertencem à história.
      </p>
      <label>
        Personagem do diário
        <select
          value={form.characterId}
          onChange={(event) => setForm({ ...emptyEntry, characterId: event.target.value })}
        >
          <option value="">Selecione um personagem</option>
          {characters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.characterName} · {item.ownerName}
            </option>
          ))}
        </select>
      </label>
      {character && (
        <>
          <label>
            Entrada do diário
            <select
              value={form.id}
              onChange={(event) =>
                setForm({
                  characterId: character.id,
                  ...(entries.find((item) => item.id === event.target.value) || emptyEntry),
                })
              }
            >
              <option value="">+ Nova entrada</option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title} · {entry.dateTime}
                </option>
              ))}
            </select>
          </label>
          <form
            className="editor-form"
            onSubmit={(event) => {
              event.preventDefault();
              apply();
            }}
          >
            <label>
              Título da entrada
              <input
                required
                value={form.title}
                onChange={(event) => change('title', event.target.value)}
              />
            </label>
            <label>
              Data no universo
              <input
                required
                value={form.dateTime}
                onChange={(event) => change('dateTime', event.target.value)}
              />
            </label>
            <label>
              Texto do diário
              <textarea
                required
                value={form.text}
                onChange={(event) => change('text', event.target.value)}
              />
            </label>
            <div className="toolbar">
              <button type="submit">APLICAR DIÁRIO AO RASCUNHO</button>
              {form.id && (
                <button type="button" onClick={() => apply(true)}>
                  REMOVER ENTRADA DO RASCUNHO
                </button>
              )}
            </div>
          </form>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
