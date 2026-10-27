import { DestinationBox } from './DestinationBox.jsx';
import { portDestinations } from './vent-links.js';
import { ventPortPosition } from './vent-ports.js';
import { ventRoomName } from './vent-room-name.js';
import { ventBranch } from './vent-branches.js';
import { ventAccess } from './ventilation.js';
export function VentDestinationLabels({ project, elements, ink }) {
  return elements
    .filter((e) => e.kind === 'vent')
    .flatMap((e) => {
      const labels = (e.ports || []).flatMap((port) => {
        const p = ventPortPosition(e.points, port, e.width);
        if (!p) return [];
        const branch = ventBranch(e, port, elements),
          position = branch?.end || p;
        const linked = portDestinations(project, e.id, port.id);
        const local = port.label || ventRoomName(elements, position);
        return linked.length
          ? linked.map((l) => ({ id: port.id, p: position, text: l.label }))
          : local
            ? [{ id: port.id, p: position, text: 'Saída · ' + local }]
            : [];
      });
      if (e.points.length >= 2)
        for (const i of [0, 1]) {
          const p = ventAccess(e, i, elements);
          if (!['grille', 'hatch', 'ceiling', 'floor'].includes(p.type)) continue;
          const name = ventRoomName(elements, p);
          if (name) labels.push({ id: 'end-' + i, p, text: 'Saída · ' + name });
        }
      return labels.map((l) => (
        <DestinationBox
          key={e.id + l.id}
          element={e}
          labelKey={l.id}
          text={l.text}
          x={l.p.x}
          y={l.p.y + e.width / 2 + 0.4}
          ink={ink}
        />
      ));
    });
}
