import { useEffect, useState } from 'react';

// Recupera os campos ainda não aplicados sem misturá-los ao arquivo da campanha.
export function useMapDraft(storageKey, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      return saved && typeof saved === 'object' && !Array.isArray(saved)
        ? { ...initial, ...saved }
        : initial;
    } catch {
      return initial;
    }
  });
  const changed = JSON.stringify(value) !== JSON.stringify(initial);
  useEffect(() => {
    try {
      if (changed) sessionStorage.setItem(storageKey, JSON.stringify(value));
      else sessionStorage.removeItem(storageKey);
    } catch {
      // Os campos continuam utilizáveis quando o armazenamento está indisponível.
    }
    if (!changed) return;
    function protect(event) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, [storageKey, value, changed]);
  return [value, setValue];
}
