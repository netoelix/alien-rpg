// Metre-authored top views. Solid furniture inherits the map floor; glazing uses open strokes.
const R = (x, y, width, height, rx = 0, fill) => ({
  tag: 'rect',
  x,
  y,
  width,
  height,
  rx,
  ...(fill ? { fill } : {}),
});
const C = (cx, cy, r, fill) => ({ tag: 'circle', cx, cy, r, ...(fill ? { fill } : {}) });
const P = (d, fill = 'none') => ({ tag: 'path', d, fill });
const seat = (x, y, w = 0.5, h = 0.55, facing = 'down') => [
  R(x, y, w, h, 0.08),
  R(x + 0.03, facing === 'up' ? y + h - 0.14 : y + 0.02, w - 0.06, 0.12, 0.04),
  P('M' + (x + 0.04) + ' ' + (facing === 'up' ? y + 0.06 : y + h - 0.06) + 'h' + (w - 0.08)),
];
const table = (x, y, w, h) => [
  R(x, y, w, h, 0.08),
  R(x + 0.04, y + 0.04, w - 0.08, h - 0.08, 0.06, 'none'),
];
const add = (name, category, w, h, shapes) => ({
  name,
  category,
  w,
  h,
  shapes: shapes.flat(Infinity).map((s) => ({
    ...s,
    transform: 'scale(' + 100 / w + ' ' + 100 / h + ')',
    strokeWidth: s.strokeWidth ?? 0.025,
  })),
});
// Quilted mattress only: no bed frame, pillow or bedding.
const mattress = (w, h) => [
  R(0.02, 0.02, w - 0.04, h - 0.04, 0.1),
  R(0.06, 0.06, w - 0.12, h - 0.12, 0.08, 'none'),
  ...Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: w > 1 ? 3 : 2 }, (_, col) => {
      const x = 0.2 + (col * (w - 0.4)) / (w > 1 ? 2 : 1),
        y = 0.3 + (row * (h - 0.6)) / 3;
      return P('M' + (x - 0.055) + ' ' + y + 'q.055-.08 .11 0q-.055 .08-.11 0');
    }),
  ).flat(),
  P('M.025 .7v.3M' + (w - 0.025) + ' .7v.3'),
];
export const hospitalityAssets = {
  diningFour: add('Mesa de restaurante · quatro lugares', 'restaurant', 2.2, 2, [
    ...seat(0.25, 0.02),
    ...seat(1.45, 0.02),
    ...seat(0.25, 1.43, 0.5, 0.55, 'up'),
    ...seat(1.45, 1.43, 0.5, 0.55, 'up'),
    ...table(0.14, 0.59, 1.92, 0.8),
  ]),
  diningRound: add('Mesa redonda · seis lugares', 'restaurant', 2.8, 2.8, [
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      const x = 1.4 + 1.12 * Math.cos(a);
      const y = 1.4 + 1.12 * Math.sin(a);
      return [C(x, y, 0.24), C(x, y, 0.19, 'none')];
    }).flat(),
    C(1.4, 1.4, 0.7),
    C(1.4, 1.4, 0.65, 'none'),
  ]),
  diningBooth: add('Cabine de restaurante · bancos frente a frente', 'restaurant', 2.4, 2.2, [
    R(0.03, 0.03, 0.53, 2.14, 0.1),
    R(0.06, 0.08, 0.14, 2.04, 0.05),
    P('M.2 .74h.3M.2 1.46h.3'),
    R(1.84, 0.03, 0.53, 2.14, 0.1),
    R(2.2, 0.08, 0.14, 2.04, 0.05),
    P('M1.89 .74h.31M1.89 1.46h.31'),
    ...table(0.76, 0.25, 0.88, 1.7),
  ]),
  diningBanquette: add('Banco estofado modular · restaurante', 'restaurant', 2, 0.65, [
    R(0.02, 0.02, 1.96, 0.61, 0.06),
    R(0.05, 0.05, 1.9, 0.14, 0.04),
    P('M.67 .21v.35M1.33 .21v.35'),
    R(0.05, 0.22, 1.9, 0.36, 0.03, 'none'),
  ]),
  hostStand: add('Recepção de restaurante · púlpito', 'restaurant', 0.85, 0.65, [
    R(0.03, 0.03, 0.79, 0.59, 0.05),
    R(0.08, 0.08, 0.69, 0.38, 0.03, 'none'),
    P('M.12 .12h.61M.12 .18h.61'),
    R(0.16, 0.49, 0.53, 0.08, 0.02),
  ]),
  buffetIsland: add('Ilha de buffet · proteção de vidro', 'restaurant', 3, 1.2, [
    R(0.03, 0.03, 2.94, 1.14, 0.08),
    ...Array.from({ length: 4 }, (_, i) => R(0.18 + i * 0.68, 0.2, 0.58, 0.6, 0.06, 'none')),
    P('M.12 .93H2.88M.12 .98H2.88'),
    ...[
      [0.12, 0.12],
      [2.88, 0.12],
      [0.12, 1.06],
      [2.88, 1.06],
    ].map(([x, y]) => C(x, y, 0.035)),
  ]),
  waiterStation: add('Estação de serviço · talheres e louça', 'restaurant', 1.4, 0.7, [
    R(0.03, 0.03, 1.34, 0.64, 0.04),
    R(0.1, 0.12, 0.55, 0.45, 0.02, 'none'),
    C(0.38, 0.35, 0.18, 'none'),
    C(0.38, 0.35, 0.13, 'none'),
    R(0.77, 0.12, 0.53, 0.45, 0.02, 'none'),
    P('M.94 .14v.41M1.11 .14v.41'),
  ]),
  servingTrolley: add('Carrinho de serviço', 'restaurant', 0.9, 0.6, [
    R(0.08, 0.06, 0.74, 0.48, 0.04),
    R(0.14, 0.11, 0.62, 0.38, 0.03, 'none'),
    P('M.03 .14v.32M.87 .14v.32'),
    ...[
      [0.16, 0.03],
      [0.74, 0.03],
      [0.16, 0.57],
      [0.74, 0.57],
    ].map(([x, y]) => R(x - 0.05, y - 0.02, 0.1, 0.04, 0.01)),
  ]),
  prisonBunk: add('Beliche de cela · metal', 'detention', 0.9, 2.15, [
    R(0.03, 0.03, 0.84, 2.09, 0.03),
    R(0.1, 0.12, 0.7, 1.91, 0.04),
    R(0.17, 0.2, 0.56, 0.35, 0.04),
    P('M.12 .69h.66M.12 1.86h.66'),
    ...Array.from({ length: 5 }, (_, i) => P('M.68 ' + (0.85 + i * 0.21) + 'h.18')),
  ]),
  prisonBench: add('Banco fixo · contenção', 'detention', 1.8, 0.45, [
    R(0.04, 0.05, 1.72, 0.35, 0.02),
    P('M.1 .17h1.6M.1 .28h1.6'),
    ...[
      [0.12, 0.1],
      [1.68, 0.1],
      [0.12, 0.35],
      [1.68, 0.35],
    ].map(([x, y]) => C(x, y, 0.025)),
  ]),
  cellSanitary: add('Módulo sanitário de cela', 'detention', 0.85, 1.1, [
    R(0.03, 0.03, 0.79, 1.04, 0.04),
    R(0.12, 0.1, 0.61, 0.3, 0.06, 'none'),
    C(0.425, 0.25, 0.025),
    P('M.425 .07v.14'),
    { tag: 'ellipse', cx: 0.425, cy: 0.74, rx: 0.25, ry: 0.25 },
    { tag: 'ellipse', cx: 0.425, cy: 0.74, rx: 0.15, ry: 0.18, fill: 'none' },
    R(0.2, 0.43, 0.45, 0.11, 0.02),
  ]),
  visitingDesk: add('Bancada de visita · divisória envidraçada', 'detention', 1.8, 1.9, [
    ...seat(0.25, 0.05),
    ...seat(1.05, 1.3, 0.5, 0.55, 'up'),
    ...table(0.08, 0.66, 1.64, 0.55),
    P('M.13 .91h1.54M.13 .96h1.54'),
    R(0.14, 0.72, 0.18, 0.12, 0.03),
    R(1.48, 1.03, 0.18, 0.12, 0.03),
  ]),
  barredPartition: add('Grade de contenção · painel decorativo', 'detention', 2, 0.3, [
    R(0.03, 0.03, 1.94, 0.24, 0.01),
    P('M.08 .09h1.84M.08 .21h1.84'),
    ...Array.from({ length: 12 }, (_, i) => P('M' + (0.12 + i * 0.16) + ' .04v.22')),
  ]),
  restraintDesk: add('Mesa fixa de entrevista', 'detention', 1.8, 2, [
    ...seat(0.65, 0.03),
    ...seat(0.65, 1.42, 0.5, 0.55, 'up'),
    ...table(0.12, 0.68, 1.56, 0.64),
    ...[
      [0.22, 0.78],
      [1.58, 0.78],
      [0.22, 1.22],
      [1.58, 1.22],
    ].map(([x, y]) => C(x, y, 0.025)),
  ]),
  roundFountain: add('Fonte ornamental · bacia circular', 'decor', 3, 3, [
    C(1.5, 1.5, 1.47),
    C(1.5, 1.5, 1.34),
    C(1.5, 1.5, 0.55),
    C(1.5, 1.5, 0.43),
    C(1.5, 1.5, 0.12),
    P('M.35 1.5a1.15 1.15 0 0 1 .6-1M2.65 1.5a1.15 1.15 0 0 1-.6 1'),
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return C(1.5 + 0.79 * Math.cos(a), 1.5 + 0.79 * Math.sin(a), 0.04);
    }),
  ]),
  wallFountain: add('Fonte de parede · cascata', 'decor', 2.4, 0.8, [
    R(0.03, 0.03, 2.34, 0.74, 0.08),
    R(0.13, 0.2, 2.14, 0.47, 0.06, 'none'),
    R(0.12, 0.07, 2.16, 0.11, 0.02),
    ...Array.from({ length: 7 }, (_, i) => P('M' + (0.4 + i * 0.26) + ' .19v.22')),
    P('M.3 .54q.2-.08 .4 0t.4 0t.4 0t.4 0'),
  ]),
  standingStatue: add('Estátua em pedestal · vista superior', 'decor', 1.2, 1.2, [
    R(0.03, 0.03, 1.14, 1.14, 0.05),
    R(0.12, 0.12, 0.96, 0.96, 0.03),
    R(0.33, 0.82, 0.2, 0.2, 0.05),
    R(0.67, 0.82, 0.2, 0.2, 0.05),
    { tag: 'ellipse', cx: 0.6, cy: 0.6, rx: 0.38, ry: 0.22 },
    C(0.6, 0.5, 0.19),
    P('M.27 .66l-.07 .2M.93 .66l.07 .2'),
  ]),
  abstractSculpture: add('Escultura orbital · pedestal', 'decor', 1.5, 1.5, [
    C(0.75, 0.75, 0.7),
    C(0.75, 0.75, 0.6, 'none'),
    { tag: 'ellipse', cx: 0.75, cy: 0.75, rx: 0.46, ry: 0.18, fill: 'none' },
    { tag: 'ellipse', cx: 0.75, cy: 0.75, rx: 0.18, ry: 0.46, fill: 'none' },
    C(0.75, 0.75, 0.12),
  ]),
  wallArtwork: add('Quadro de parede · moldura dupla', 'decor', 1.4, 0.25, [
    R(0.02, 0.02, 1.36, 0.12, 0.01),
    R(0.08, 0.045, 1.24, 0.07, 0, 'none'),
    P('M.18 .06h1.04'),
  ]),
  artDisplay: add('Painel artístico autoportante', 'decor', 1.6, 0.5, [
    R(0.08, 0.04, 0.2, 0.42, 0.03),
    R(1.32, 0.04, 0.2, 0.42, 0.03),
    R(0.03, 0.19, 1.54, 0.12, 0.02),
    R(0.1, 0.22, 1.4, 0.06, 0, 'none'),
  ]),
  vipSofa: add('Sofá VIP · bancos costas com costas', 'casino', 2.4, 2.4, [
    R(0.04, 0.3, 2.32, 1.8, 0.16),
    ...[0.31, 1.4].flatMap((y) =>
      Array.from({ length: 3 }, (_, i) => [
        R(0.25 + i * 0.64, y + 0.07, 0.6, 0.62, 0.09),
        R(0.29 + i * 0.64, y + 0.11, 0.52, 0.54, 0.07, 'none'),
        P('M' + (0.39 + i * 0.64) + ' ' + (y + 0.2) + 'h.32'),
      ]),
    ),
    R(0.2, 1.03, 2, 0.34, 0.12),
    R(0.28, 1.1, 1.84, 0.2, 0.07, 'none'),
    P('M.87 1.07v.26M1.53 1.07v.26'),
    ...[0.07, 2.13].flatMap((x) => [R(x, 0.4, 0.2, 0.58, 0.07), R(x, 1.42, 0.2, 0.58, 0.07)]),
  ]),
  conciergeDesk: add('Balcão de concierge · cassino', 'casino', 2.6, 1.3, [
    R(0.03, 0.03, 2.54, 1.24, 0.18),
    R(0.15, 0.16, 2.3, 0.62, 0.1, 'none'),
    R(0.28, 0.27, 0.55, 0.32, 0.03),
    R(0.34, 0.31, 0.43, 0.15, 0.02, 'none'),
    R(1.75, 0.27, 0.55, 0.32, 0.03),
    R(1.81, 0.31, 0.43, 0.15, 0.02, 'none'),
    P('M.16 1.08H2.44'),
  ]),
  coatCheck: add('Chapelaria · balcão e cabideiro', 'casino', 2.8, 1.4, [
    R(0.03, 0.03, 2.74, 0.47, 0.04),
    P('M.13 .18H2.67'),
    ...Array.from({ length: 9 }, (_, i) => P('M' + (0.26 + i * 0.28) + ' .12v.26')),
    R(0.03, 0.78, 2.74, 0.59, 0.06),
    R(0.13, 0.88, 2.54, 0.34, 0.03, 'none'),
  ]),
  velvetBarrier: add('Balizadores com cordão · fila VIP', 'casino', 1.8, 0.3, [
    C(0.15, 0.15, 0.13),
    C(1.65, 0.15, 0.13),
    C(0.15, 0.15, 0.045),
    C(1.65, 0.15, 0.045),
    P('M.18 .15Q.9 .29 1.62 .15'),
  ]),
  luggageCart: add('Carrinho de bagagens · hotel', 'quarters', 1.2, 0.8, [
    R(0.1, 0.05, 1, 0.7, 0.1),
    R(0.17, 0.12, 0.86, 0.56, 0.06, 'none'),
    P('M.07 .17v.46M1.13 .17v.46'),
    R(0.25, 0.21, 0.4, 0.39, 0.04),
    R(0.69, 0.21, 0.25, 0.39, 0.04),
    P('M.32 .18h.22M.75 .18h.13'),
  ]),
  laundryMachine: add('Lavadora industrial · vista superior', 'sanitary', 1.2, 1, [
    R(0.03, 0.03, 1.14, 0.94, 0.04),
    R(0.09, 0.1, 1.02, 0.17, 0.03),
    C(0.23, 0.18, 0.04),
    R(0.38, 0.14, 0.35, 0.08, 0.01, 'none'),
    R(0.11, 0.33, 0.98, 0.56, 0.06, 'none'),
    C(0.6, 0.61, 0.21, 'none'),
    P('M.15 .94h.9'),
  ]),
  baggageScanner: add('Inspeção de bagagens · esteira', 'security', 2.4, 1.1, [
    R(0.03, 0.17, 2.34, 0.76, 0.04),
    ...Array.from({ length: 15 }, (_, i) => P('M' + (0.14 + i * 0.15) + ' .22v.66')),
    R(0.77, 0.03, 0.86, 1.04, 0.09),
    R(0.87, 0.12, 0.66, 0.86, 0.04, 'none'),
    R(1.02, 0.24, 0.36, 0.26, 0.03),
    P('M1.08 .32h.24M1.08 .4h.24'),
  ]),
  gymTreadmill: add('Esteira ergométrica · painel analógico', 'fitness', 0.9, 2.1, [
    R(0.06, 0.09, 0.78, 1.96, 0.08),
    R(0.18, 0.48, 0.54, 1.47, 0.03),
    P('M.22 .6h.46M.22 1.82h.46M.23 .65v1.1M.67 .65v1.1'),
    R(0.09, 0.04, 0.72, 0.38, 0.06),
    R(0.19, 0.11, 0.27, 0.17, 0.02),
    P('M.22 .2h.2M.27 .16v.06M.35 .14v.08'),
    C(0.58, 0.19, 0.055),
    C(0.71, 0.19, 0.035),
    R(0.08, 0.43, 0.055, 0.83, 0.02),
    R(0.765, 0.43, 0.055, 0.83, 0.02),
    P('M.13 .49h.06M.71 .49h.06'),
  ]),
  gymCycle: add('Bicicleta ergométrica · resistência mecânica', 'fitness', 0.75, 1.3, [
    R(0.06, 0.1, 0.63, 0.09, 0.03),
    R(0.06, 1.1, 0.63, 0.09, 0.03),
    R(0.31, 0.15, 0.13, 0.98, 0.03),
    R(0.27, 0.22, 0.21, 0.5, 0.06),
    P('M.32 .26v.4M.38 .26v.4M.43 .26v.4'),
    R(0.12, 0.74, 0.13, 0.18, 0.03),
    R(0.5, 0.54, 0.13, 0.18, 0.03),
    P('M.25 .83h.12v-.2h.13'),
    P('M.14 .38V.12Q.375 -.02 .61 .12V.38'),
    R(0.28, 0.08, 0.19, 0.14, 0.02),
    P('M.31 .14h.13'),
    P('M.26 1.06Q.19 .86 .375 .86Q.56 .86 .49 1.06Z', 'currentColor'),
  ]),
  gymBenchPress: add('Banco de supino · barra e anilhas', 'fitness', 1.8, 2, [
    R(0.45, 0.2, 0.9, 0.09, 0.02),
    R(0.45, 0.24, 0.09, 1.32, 0.02),
    R(1.26, 0.24, 0.09, 1.32, 0.02),
    R(0.62, 0.48, 0.56, 1.05, 0.07),
    R(0.64, 1.59, 0.52, 0.3, 0.06),
    R(0.68, 0.54, 0.44, 0.92, 0.05, 'none'),
    P('M.9 1.89v.07M.64 1.96h.52'),
    R(0.03, 0.34, 1.74, 0.045, 0.01),
    ...[0.17, 0.27, 1.48, 1.58].map((x) => R(x, 0.16, 0.07, 0.4, 0.02)),
    R(0.49, 0.27, 0.12, 0.18, 0.02),
    R(1.19, 0.27, 0.12, 0.18, 0.02),
  ]),
  gymWeightStation: add('Estação de musculação · torre e polias', 'fitness', 1.4, 2, [
    R(0.08, 0.08, 1.24, 0.55, 0.05),
    R(0.21, 0.15, 0.98, 0.35, 0.03),
    ...Array.from({ length: 5 }, (_, i) => P('M.27 ' + (0.2 + i * 0.055) + 'h.86')),
    R(0.15, 0.63, 0.08, 1.25, 0.02),
    R(1.17, 0.63, 0.08, 1.25, 0.02),
    P('M.19 1.85h1.02M.31 .67H.09v.38M1.09 .67h.22v.38'),
    C(0.46, 0.56, 0.09),
    C(0.94, 0.56, 0.09),
    P('M.46 .65v.45M.94 .65v.45'),
    R(0.48, 0.78, 0.44, 0.6, 0.06),
    R(0.44, 1.43, 0.52, 0.4, 0.07),
    R(0.53, 0.84, 0.34, 0.47, 0.04, 'none'),
    P('M.7 1.87v.08M.43 1.95h.54'),
  ]),
  gymDumbbellRack: add('Suporte de halteres · pares organizados', 'fitness', 1.8, 0.65, [
    R(0.03, 0.04, 0.12, 0.57, 0.02),
    R(1.65, 0.04, 0.12, 0.57, 0.02),
    R(0.15, 0.12, 1.5, 0.4, 0.03),
    P('M.16 .2h1.48M.16 .45h1.48'),
    ...Array.from({ length: 5 }, (_, i) => {
      const x = 0.25 + i * 0.3;
      return [
        R(x, 0.2, 0.045, 0.25, 0.01),
        R(x + 0.12, 0.2, 0.045, 0.25, 0.01),
        R(x + 0.045, 0.3, 0.075, 0.045, 0.01),
      ];
    }),
  ]),
  detentionDining: add('Mesa de refeitório · bancos ancorados', 'detention', 2.4, 1.8, [
    ...[0.35, 1.92].map((x) => R(x, 0.12, 0.13, 1.56, 0.02)),
    R(0.08, 0.06, 2.24, 0.33, 0.03),
    R(0.08, 1.41, 2.24, 0.33, 0.03),
    ...table(0.05, 0.58, 2.3, 0.64),
    ...[0.22, 2.18].flatMap((x) => [C(x, 0.21, 0.035), C(x, 1.57, 0.035)]),
    P('M.17 .31h2.06M.17 1.49h2.06'),
  ]),
  detentionBed: add('Cama de cela · estrutura fixa', 'detention', 0.95, 2.1, [
    ...[0.19, 1.75].map((y) => R(0.01, y, 0.92, 0.12, 0.02)),
    R(0.07, 0.03, 0.85, 2.04, 0.025),
    R(0.13, 0.12, 0.72, 1.86, 0.07),
    R(0.19, 0.2, 0.6, 0.36, 0.07),
    P('M.18 .69h.62M.18 1.81h.62'),
    ...[0.23, 1.79].flatMap((y) => [C(0.04, y, 0.018), C(0.88, y, 0.018)]),
    P('M.11 .75v.93M.87 .75v.93'),
  ]),
  cleaningCart: add('Carrinho de limpeza · saco e compartimentos', 'quarters', 0.75, 1.25, [
    ...[0.12, 0.58].flatMap((x) => [R(x, 0.06, 0.07, 0.14, 0.02), R(x, 1.06, 0.07, 0.14, 0.02)]),
    R(0.07, 0.14, 0.61, 0.97, 0.05),
    R(0.12, 0.23, 0.51, 0.43, 0.03),
    R(0.16, 0.27, 0.19, 0.34, 0.02),
    R(0.4, 0.27, 0.19, 0.34, 0.02),
    P('M.17 .34h.17M.41 .34h.17M.12 .17v-.13h.51v.13'),
    P('M.13 .72Q.38 .65 .62 .72L.58 1.07Q.38 1.14 .16 1.07Z'),
    R(0.11, 0.7, 0.53, 0.08, 0.025),
    P('M.2 .8l.04 .22M.53 .8l-.04 .22'),
    P('M.71 .24v.79M.69 .27h.04M.69 .98h.04'),
  ]),
  mattressSingle: add('Colchão avulso · solteiro', 'quarters', 0.88, 1.88, mattress(0.88, 1.88)),
  mattressDouble: add('Colchão avulso · casal', 'quarters', 1.38, 1.88, mattress(1.38, 1.88)),
};
