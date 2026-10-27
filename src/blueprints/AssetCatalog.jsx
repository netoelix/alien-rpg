import { useState } from 'react';
import { assetCategories } from './asset-categories.js';
import { catalogGroups } from './catalog-groups.js';
import { legacyAssets } from './legacy-assets.js';
import { AssetSymbol } from './Assets.jsx';
export function AssetCatalog({ items, search, selected, onSelect }) {
  const [expanded, setExpanded] = useState([]),
    matches = new Map(items.filter(([id]) => !Object.hasOwn(legacyAssets, id)));
  const other = {
    id: 'other',
    name: 'Outros',
    items: [...matches.keys()].filter((id) => !assetCategories.some((c) => c.items.includes(id))),
  };
  const categories = [...assetCategories, other];
  const toggle = (id) => (event) => {
    if (search.trim() || event.target !== event.currentTarget) return;
    const open = event.currentTarget.open;
    setExpanded((old) => (open ? [...new Set([...old, id])] : old.filter((k) => k !== id)));
  };
  const category = (c) => {
    const visible = c.items.filter((id) => matches.has(id));
    if (!visible.length) return null;
    return (
      <details
        className="blueprint-asset-category"
        key={c.id}
        open={!!search.trim() || expanded.includes(c.id)}
        onToggle={toggle(c.id)}
      >
        <summary>
          {c.name} <span className="muted">({visible.length})</span>
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
  };
  const groups = [
    ...catalogGroups,
    {
      id: 'other-group',
      name: 'Outros',
      categories: categories
        .filter((c) => !catalogGroups.some((g) => g.categories.includes(c.id)))
        .map((c) => c.id),
    },
  ];
  return (
    <div className="blueprint-asset-categories">
      {groups.map((g) => {
        const children = categories.filter(
          (c) => g.categories.includes(c.id) && c.items.some((id) => matches.has(id)),
        );
        if (!children.length) return null;
        return (
          <details
            className="blueprint-asset-family"
            key={g.id}
            open={!!search.trim() || expanded.includes('group-' + g.id)}
            onToggle={toggle('group-' + g.id)}
          >
            <summary>{g.name}</summary>
            <div className="blueprint-asset-children">{children.map(category)}</div>
          </details>
        );
      })}
    </div>
  );
}
