import { useState } from 'react';
import { assetCategories } from './asset-categories.js';
import { AssetSymbol } from './Assets.jsx';
export function AssetCatalog({ items, search, selected, onSelect }) {
  const [expanded, setExpanded] = useState([]);
  const matches = new Map(items);
  const categories = [
    ...assetCategories,
    {
      id: 'other',
      name: 'Outros',
      items: items
        .map(([id]) => id)
        .filter((id) => !assetCategories.some((c) => c.items.includes(id))),
    },
  ];
  return (
    <div className="blueprint-asset-categories">
      {categories.map((category) => {
        const visible = category.items.filter((id) => matches.has(id));
        if (!visible.length) return null;
        const open = !!search.trim() || expanded.includes(category.id);
        return (
          <details
            key={category.id}
            open={open}
            onToggle={(event) => {
              if (search.trim()) return;
              const isOpen = event.currentTarget.open;
              setExpanded((old) =>
                isOpen
                  ? [...new Set([...old, category.id])]
                  : old.filter((id) => id !== category.id),
              );
            }}
          >
            <summary>
              {category.name} <span className="muted">({visible.length})</span>
            </summary>
            <div className="blueprint-assets">
              {visible.map((id) => (
                <button key={id} aria-pressed={selected === id} onClick={() => onSelect(id)}>
                  <svg
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <AssetSymbol type={id} />
                  </svg>
                  {matches.get(id)}
                </button>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
