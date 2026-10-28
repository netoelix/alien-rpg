import { useState } from 'react';
// Keep transient input (empty, zero, minus) separate from validated project state.
export function NumberField({ value, onChange, onBlur, onKeyDown, ...props }) {
  const [draft, setDraft] = useState(null);
  const commit = (e) => {
    if (
      draft !== null &&
      e.currentTarget.value !== '' &&
      !e.currentTarget.validity.rangeUnderflow &&
      !e.currentTarget.validity.rangeOverflow &&
      Number.isFinite(Number(e.currentTarget.value))
    )
      onChange?.(e);
    setDraft(null);
    onBlur?.(e);
  };
  return (
    <input
      {...props}
      type="number"
      step={props.step ?? 'any'}
      value={draft ?? value}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          setDraft(null);
          e.preventDefault();
          e.stopPropagation();
        }
        onKeyDown?.(e);
      }}
    />
  );
}
