import { useId, useState } from 'react';
import './HelpHint.css';

export function HelpHint({ children, label = 'Como usar' }) {
  const id = useId();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = !dismissed && (hover || focus || pinned);
  return (
    <div
      className="blueprint-help"
      onMouseEnter={() => {
        setHover(true);
        setDismissed(false);
      }}
      onMouseLeave={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          setPinned(false);
          setDismissed(true);
        }
      }}
    >
      <button
        type="button"
        className="blueprint-help-button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onFocus={() => {
          setFocus(true);
          setDismissed(false);
        }}
        onBlur={() => setFocus(false)}
        onClick={() => {
          setPinned(!pinned);
          setDismissed(pinned);
        }}
      >
        <span aria-hidden="true">ⓘ</span>
        <span className="blueprint-help-label">{label}</span>
      </button>
      {open && (
        <div id={id} className="blueprint-help-content" role="note">
          {children}
        </div>
      )}
    </div>
  );
}
