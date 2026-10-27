// Measure intent in screen pixels so selecting off-grid objects never snaps them.
export function beginObjectDrag(element, point, event) {
  return {
    kind: 'move',
    element,
    start: point,
    end: point,
    clientX: event.clientX,
    clientY: event.clientY,
    dragging: false,
  };
}
export function objectDragStarted(gesture, event) {
  return (
    gesture.dragging ||
    Math.hypot(event.clientX - gesture.clientX, event.clientY - gesture.clientY) >= 4
  );
}
