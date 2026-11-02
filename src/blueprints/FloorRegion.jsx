import { HiveFloor } from './HiveFloor.jsx';
import { WaterRegion } from './WaterRegion.jsx';
import { FloorFinish } from './FloorFinish.jsx';
export function FloorRegion({ element, floor = '#0b2019', ink = 'currentColor' }) {
  if (['pool', 'lake'].includes(element.floorFinish?.type))
    return <WaterRegion element={element} floor={floor} ink={ink} />;
  return (
    <g data-object={element.id}>
      <polygon
        points={element.points.map((p) => p.x + ',' + p.y).join(' ')}
        fill={floor}
        stroke="none"
      />
      {element.floorFinish?.type === 'hive' ? (
        <HiveFloor element={element} ink={ink} floor={floor} />
      ) : (
        <FloorFinish element={element} ink={ink} />
      )}
    </g>
  );
}
