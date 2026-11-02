import { rect, line, body, circle } from './plan-shapes.js';
const stage = (name, w, h, shapes) => ({
  name,
  w,
  h,
  category: 'entertainment',
  subgroup: 'Palco e bastidores',
  shapes,
});
// Full-bleed edges tile on the metre grid. Only exposed sides carry a fascia.
const fabric = { ...rect(0, 0, 100, 100), stroke: 'none' };
const deck = [fabric, line('M0 1h100M0 5h100M0 95h100M0 99h100')];
export const stageAssets = {
  stageClothCenter: stage('Palco · piso sem borda', 2, 2, [fabric]),
  stageClothEdge: stage('Palco · uma lateral', 2, 2, [fabric, line('M0 1H100M0 5H100')]),
  stageClothCorner: stage('Palco · quina externa em L', 2, 2, [
    fabric,
    line('M1 100V1H100M5 100V5H100'),
  ]),
  stageClothReturn: stage('Palco · quina interna de recuo', 2, 2, [
    fabric,
    line('M100 99H99V100M100 95H95V100'),
  ]),
  stageDeckBay: stage('Tablado · módulo central', 2, 2, deck),
  stageWing: stage('Tablado · lateral reversível', 1, 2, [
    ...deck,
    line('M1 0v100M7 1v94'),
    line('M2 14l4 7-4 7m0 42 4 7-4 7'),
  ]),
  stageAccessSteps: stage('Escada avulsa de palco', 2, 1, [
    rect(0, 0, 100, 100),
    line('M0 20h100M0 45h100M0 70h100M0 95h100'),
    line('M4 4v90M96 4v90'),
  ]),
  runwayBay: stage('Passarela · trecho reto', 2, 2, [
    fabric,
    line('M1 0v100M5 0v100M95 0v100M99 0v100'),
  ]),
  runwayHead: stage('Passarela · cabeceira', 2, 2, [
    { ...body('M0 0H100V75L76 100H24L0 75Z'), stroke: 'none' },
    line('M1 0V75L24 99H76L99 75V0M5 0V73L26 95H74L95 73V0'),
  ]),
  poleStage: stage('Palco de pole dance', 2, 2, [
    body('M3 19Q3 8 16 8H84Q97 8 97 19V53C97 75 81 91 62 92H38C19 91 3 75 3 53Z'),
    line('M4 56Q10 84 38 87H62Q88 83 96 56'),
    {
      ...body('M49 48Q50 47 52 49L67 69Q68 72 65 70Z'),
      fill: 'currentColor',
      opacity: 0.24,
      stroke: 'none',
    },
    circle(50, 48, 4.8),
    { ...circle(50, 48, 2), fill: 'currentColor' },
    ...[19, 32, 68, 81].map((x) => ({
      ...circle(x, 14, 1.2),
      fill: 'currentColor',
      stroke: 'none',
    })),
  ]),
  commandPitShell: {
    name: 'Poço de comando · acesso rebaixado',
    category: 'command',
    w: 5,
    h: 4,
    shapes: [
      rect(0, 0, 100, 100, 4),
      line('M34 98H3V3H97V98H66M34 94H7V7H93V94H66M34 89H11V11H89V89H66'),
      line('M34 99V76H66V99M34 81h32M34 87h32M34 93h32'),
      ...[18, 75].map((x) => rect(x, 5, 7, 2, 1)),
    ],
  },
};
