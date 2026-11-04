export function sameElements(a, b) {
  return a === b || (a.length === b.length && a.every((element, index) => element === b[index]));
}

// Retain a subset while only unrelated, immutable objects change.
export function createElementSelector(predicate) {
  let previous = [];
  return (elements) => {
    const next = elements.filter(predicate);
    if (!sameElements(previous, next)) previous = next;
    return previous;
  };
}
