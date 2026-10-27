export const pathTools = ['corridor', 'vent', 'trace'];
export const pathChoices = [
  ['corridor', 'Corredor'],
  ['vent', 'Ventilação'],
  ['path', 'Caminho'],
  ['sidewalk', 'Calçada'],
  ['road', 'Rua'],
  ['rail', 'Trilhos'],
  ['channel', 'Canaleta'],
  ['gratedChannel', 'Canaleta gradeada'],
  ['hazardLine', 'Faixa de segurança'],
  ['walkwayLine', 'Faixa de circulação'],
  ['river', 'Rio'],
  ['ledge', 'Borda de desnível'],
];
export function pathPreset(value) {
  if (!pathChoices.some(([id]) => id === value)) throw new Error('Percurso desconhecido.');
  const widths = {
    corridor: 2,
    vent: 1,
    path: 1.5,
    sidewalk: 2,
    road: 6,
    rail: 0.9,
    channel: 0.4,
    gratedChannel: 0.4,
    hazardLine: 0.3,
    walkwayLine: 1.2,
    river: 3,
    ledge: 1,
  };
  return {
    tool: ['corridor', 'vent'].includes(value) ? value : 'trace',
    width: widths[value],
    style: { traceType: value, rounded: true, side: 1 },
  };
}
