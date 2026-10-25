import { useMemo } from 'react';
import { Furniture } from './Furniture.jsx';
import { AssetSymbol } from './Assets.jsx';
import { assetFootprint, furniture } from './furniture.js';
import { openingCandidate } from './placement.js';
import { openingGeometry } from './wall-geometry.js';
import { persistentWallStructure, sharedWallStructures } from './shared-walls.js';
import { layerFor } from './model.js';
export function PlacementPreview({ project, point, tool, asset, width, openingType, zoom }) {
  const resolved = useMemo(
    () =>
      tool === 'door'
        ? sharedWallStructures(
            project.elements
              .filter((e) => layerFor(e.kind) === 'structure')
              .map(persistentWallStructure),
          )
        : [],
    [project.elements, tool],
  );
  const layer = project.layers.find((l) => l.id === layerFor(tool));
  const available = layer?.visible && !layer.locked;
  if (tool === 'asset') {
    const { w, h } = assetFootprint(asset),
      valid = available && point.x + w <= project.width && point.y + h <= project.height;
    return (
      <g
        data-editor-only="true"
        pointerEvents="none"
        opacity=".65"
        color={valid ? '#f1c46c' : '#ff7373'}
      >
        <svg
          x={point.x}
          y={point.y}
          width={w}
          height={h}
          viewBox={furniture[asset] ? `0 0 ${w} ${h}` : '0 0 100 100'}
          preserveAspectRatio="none"
          fill="#102c24"
          stroke="currentColor"
          strokeWidth="2"
        >
          {furniture[asset] ? <Furniture type={asset} w={w} h={h} /> : <AssetSymbol type={asset} />}
        </svg>
        <rect
          x={point.x}
          y={point.y}
          width={w}
          height={h}
          fill="none"
          stroke="currentColor"
          strokeWidth=".06"
          strokeDasharray=".2 .15"
        />
      </g>
    );
  }
  const candidate = openingCandidate(project, point, width, openingType, Math.max(0.75, 2 / zoom));
  const geometry =
    candidate.element && openingGeometry(candidate.element, project.elements, resolved);
  const valid = available && !candidate.error;
  return (
    <g
      data-editor-only="true"
      pointerEvents="none"
      color={valid ? '#f1c46c' : '#ff7373'}
      opacity=".85"
    >
      {geometry ? (
        <g
          transform={`translate(${geometry.x} ${geometry.y}) rotate(${geometry.rotation})`}
          fill="none"
          stroke="currentColor"
          strokeWidth=".12"
        >
          <rect
            x={-width / 2}
            y={-geometry.frameDepth}
            width={width}
            height={2 * geometry.frameDepth}
            fill="currentColor"
            fillOpacity=".15"
          />
          <path
            d={`M${-width / 2} ${-geometry.frameDepth}V${geometry.frameDepth} M${width / 2} ${-geometry.frameDepth}V${geometry.frameDepth} M${-width / 2} -.12H${width / 2} M${-width / 2} .12H${width / 2}`}
            strokeDasharray={openingType === 'window' ? '.2 .1' : undefined}
          />
        </g>
      ) : (
        <path
          d={`M${point.x - 0.25} ${point.y - 0.25}l.5 .5m0 -.5l-.5 .5`}
          stroke="currentColor"
          strokeWidth=".1"
        />
      )}
    </g>
  );
}
