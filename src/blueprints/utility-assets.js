const rect = (x, y, width, height, rx = 1) => ({ tag: 'rect', x, y, width, height, rx });
const path = (d) => ({ tag: 'path', d, fill: 'none' });
const circle = (cx, cy, r) => ({ tag: 'circle', cx, cy, r });
const asset = (name, w, h, shapes) => ({ name, w, h, category: 'exterior', shapes });
export const utilityAssets = {
  distributionPole: asset('Poste elétrico · cruzetas e luminária', 2.4, 2.6, [
    circle(50, 50, 10),
    circle(50, 50, 6),
    rect(46, 14, 8, 70, 1),
    rect(12, 20, 76, 6, 1),
    rect(12, 42, 76, 6, 1),
    ...[20, 50, 80].flatMap((x) => [
      circle(x, 20, 4),
      circle(x, 20, 2),
      circle(x, 42, 4),
      circle(x, 42, 2),
    ]),
    path('M48 56L21 75M52 59L24 78'),
    rect(9, 73, 22, 11, 4),
    rect(12, 76, 16, 5, 2),
    path('M15 76v5M20 76v5M25 76v5'),
    rect(43, 70, 14, 15, 2),
    path('M47 74h6M47 78h6'),
  ]),
  plazaLantern: asset('Poste de praça · lanterna retrô', 0.75, 0.75, [
    circle(50, 50, 36),
    circle(50, 50, 31),
    { tag: 'path', d: 'M50 10L82 28V72L50 90L18 72V28Z' },
    { tag: 'path', d: 'M50 18L75 32V68L50 82L25 68V32Z', fill: 'none' },
    path('M50 18V82M25 32L75 68M75 32L25 68'),
    circle(50, 50, 8),
    circle(50, 50, 4),
  ]),

  streetLamp: asset('Poste de iluminação · braço duplo', 1.2, 3, [
    rect(39, 37, 22, 26, 3),
    circle(50, 50, 8),
    rect(47, 12, 6, 76),
    rect(25, 4, 50, 16, 4),
    rect(29, 7, 42, 10, 2),
    rect(25, 80, 50, 16, 4),
    rect(29, 83, 42, 10, 2),
    path('M36 7v10M50 7v10M64 7v10M36 83v10M50 83v10M64 83v10'),
  ]),
  distributionTransformer: asset('Transformador de distribuição', 2, 1.5, [
    rect(5, 8, 90, 84, 3),
    rect(14, 18, 50, 62, 3),
    ...Array.from({ length: 7 }, (_, i) => path('M' + (18 + i * 7) + ' 23v52')),
    ...[28, 50, 72].flatMap((y) => [circle(80, y, 7), circle(80, y, 3)]),
    path('M18 86h64'),
  ]),
  roundManhole: asset('Tampa de bueiro circular', 0.9, 0.9, [
    circle(50, 50, 45),
    circle(50, 50, 39),
    ...Array.from({ length: 7 }, (_, i) => path('M25 ' + (27 + i * 8) + 'h50')),
    rect(40, 16, 20, 5, 1),
    rect(40, 79, 20, 5, 1),
  ]),
  serviceManhole: asset('Tampa de inspeção dupla', 1.6, 0.9, [
    rect(4, 6, 92, 88, 3),
    rect(10, 12, 38, 76, 1),
    rect(52, 12, 38, 76, 1),
    path('M15 20l28 60M57 20l28 60'),
    rect(35, 43, 7, 14, 1),
    rect(58, 43, 7, 14, 1),
  ]),
};
