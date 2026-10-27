import { stairDestinations } from './stair-destinations.js';
import { DestinationBox } from './DestinationBox.jsx';
export function StairDestinationLabels({ project, elements, ink, background }) {
  return elements
    .filter((e) => e.kind === 'asset' && e.asset === 'stairs' && !e.connectionLabel?.hidden)
    .map((e) => {
      const text = stairDestinations(project, e).join(' · ');
      return text ? (
        <DestinationBox
          key={e.id}
          element={e}
          labelKey="stairs"
          text={text}
          x={e.x + e.w / 2 + (e.connectionLabel?.dx || 0)}
          y={e.y + e.h + 0.65 + (e.connectionLabel?.dy || 0)}
          ink={ink}
          background={background}
          editorOnly={e.connectionLabel?.export === false}
        />
      ) : null;
    });
}
