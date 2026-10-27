import { Furniture } from './Furniture.jsx';
import { furniture } from './furniture.js';
import { legacyAssets } from './legacy-assets.js';
export const assetNames = {
  ...Object.fromEntries(Object.entries(furniture).map(([k, v]) => [k, v.name])),
  ...Object.fromEntries(
    Object.entries(legacyAssets).map(([k, v]) => [k, furniture[v].name + ' (compatibilidade)']),
  ),
};
export function AssetSymbol({ type }) {
  const resolved = legacyAssets[type] || type,
    item = furniture[resolved];
  if (!item) return null;
  return (
    <svg viewBox={`0 0 ${item.w} ${item.h}`} width="100" height="100" overflow="visible">
      <Furniture type={resolved} />
    </svg>
  );
}
