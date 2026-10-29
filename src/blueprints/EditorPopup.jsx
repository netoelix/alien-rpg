import { useId, useRef } from 'react';
import './EditorPopup.css';
export function EditorPopup({ title, children }) {
  const ref = useRef(null),
    id = useId();
  return (
    <div className="blueprint-popup-control">
      <button type="button" onClick={() => ref.current.showModal()}>
        {title}
      </button>
      <dialog
        ref={ref}
        className="blueprint-popup"
        aria-labelledby={id}
        onClick={(e) => {
          if (e.target === e.currentTarget || e.target.closest('[data-close-popup]'))
            ref.current.close();
        }}
      >
        <header>
          <strong id={id}>{title}</strong>
          <button type="button" aria-label="Fechar painel" onClick={() => ref.current.close()}>
            ×
          </button>
        </header>
        <div className="blueprint-popup-body">{children}</div>
      </dialog>
    </div>
  );
}
