export const levelAssets = {
  raisedPlatform: { name: 'Plataforma elevada · visual', w: 3, h: 2 },
  gratedPlatform: { name: 'Plataforma gradeada · visual', w: 3, h: 2 },
  shortSteps: { name: 'Degraus de acesso · visual', w: 1.4, h: 0.9 },
  stairFlight: { name: 'Lance de escada · visual', w: 1.2, h: 3 },
  accessRamp: { name: 'Rampa de acesso · visual', w: 1.5, h: 3 },
  levelEdge: { name: 'Borda de desnível · visual', w: 3, h: 0.3 },
};
export function stepPositions(length) {
  const count = Math.min(40, Math.max(2, Math.round(length / 0.3)));
  return Array.from({ length: count }, (_, i) => ((i + 1) * length) / (count + 1));
}
export function isPlatform(type) {
  return type === 'raisedPlatform' || type === 'gratedPlatform';
}
