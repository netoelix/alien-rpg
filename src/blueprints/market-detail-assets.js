import { rect, line, body, circle } from './plan-shapes.js';
const item = (category, name, w, h, shapes) => ({ category, name, w, h, shapes });
const crate = [rect(2, 4, 96, 92, 2), rect(7, 10, 86, 80, 1), line('M4 18h3m86 0h3M4 82h3m86 0h3')];
const fruit = (x, y, r) => [circle(x, y, r), line('M' + x + ' ' + (y - 1) + 'q-2-5 2-6')];
const tin = (x, y) => [circle(x, y, 11), circle(x, y, 8.7), rect(x - 2, y - 4, 4, 6, 2)];
const page = (x, y, w, h) => [
  rect(x, y, w, h, 1),
  line('M' + (x + 4) + ' ' + (y + 8) + 'h' + w * 0.57 + 'm-' + w * 0.57 + ' 6h' + w * 0.72),
];
const rotate = (shapes, deg, x, y) =>
  shapes.map((s) => ({ ...s, transform: 'rotate(' + deg + ' ' + x + ' ' + y + ')' }));
export const marketDetailAssets = {
  cannedGoodsCase: item('market', 'Caixa de conservas', 0.62, 0.42, [
    ...crate,
    ...[20, 49, 78].flatMap((x) => [tin(x, 32), tin(x, 67)]).flat(),
  ]),
  orchardProduceCrate: item('market', 'Engradado de frutas', 0.8, 0.6, [
    ...crate,
    ...[
      [21, 33, 11],
      [44, 25, 10],
      [67, 33, 12],
      [80, 55, 10],
      [54, 58, 12],
      [29, 57, 10],
      [17, 74, 8],
      [45, 78, 8],
      [68, 79, 9],
    ].flatMap((a) => fruit(...a)),
    rect(2, 42, 6, 16, 2),
    rect(92, 42, 6, 16, 2),
  ]),
  fieldRationLot: item('market', 'Lote de rações seladas', 0.76, 0.5, [
    ...[
      [5, 12],
      [37, 6],
      [66, 18],
    ].flatMap(([x, y]) => [
      body('M' + x + ' ' + y + 'h27l-2 8 2 54h-27l2-8Z'),
      line('M' + (x + 3) + ' ' + (y + 6) + 'h21m-21 50h21'),
      rect(x + 5, y + 20, 16, 18, 1),
    ]),
  ]),
  vacuumPackTray: item('market', 'Bandeja de pacotes a vácuo', 0.7, 0.48, [
    rect(2, 6, 96, 88, 6),
    rect(6, 11, 88, 78, 4),
    ...[10, 52].flatMap((x) => [
      rect(x, 17, 37, 64, 2),
      body('M' + (x + 6) + ' 58q-2-13 9-26l11 3 4 17-12 14Z'),
      line('M' + (x + 3) + ' 21h30m-30 55h30'),
      rect(x + 20, 62, 11, 8, 1),
    ]),
  ]),
  stackedTravelCases: item('cargo', 'Malas rígidas empilhadas', 1.05, 0.75, [
    rect(3, 32, 91, 62, 6),
    rect(8, 37, 80, 50, 4),
    rect(40, 88, 19, 9, 3),
    ...rotate(
      [
        rect(10, 9, 78, 57, 7),
        rect(15, 14, 68, 44, 4),
        rect(36, 4, 23, 7, 2),
        line('M23 20v32m7-32v32m38-32v32m7-32v32'),
        rect(21, 59, 9, 6),
        rect(67, 59, 9, 6),
      ],
      -7,
      48,
      37,
    ),
  ]),
  tiedMailSacks: item('cargo', 'Malotes de despacho', 0.95, 0.72, [
    ...[
      [4, 20],
      [48, 9],
    ].flatMap(([x, y]) => [
      body(
        'M' +
          (x + 12) +
          ' ' +
          (y + 10) +
          'l-4-9 19 1-4 9q18 13 16 44-2 16-19 18-20-2-20-17 0-31 12-46Z',
      ),
      line('M' + (x + 10) + ' ' + (y + 10) + 'h15m-13 4h10'),
      rect(x + 10, y + 33, 16, 13, 2),
    ]),
  ]),
  towBaggageDolly: item('transit', 'Carro rebocável de bagagem', 2.8, 1.25, [
    body('M2 49L20 27V34L8 50L20 66V73L2 52Z'),
    circle(3, 50, 2),
    ...[24, 78].flatMap((x) => [rect(x, 4, 13, 9, 2), rect(x, 87, 13, 9, 2)]),
    rect(18, 11, 79, 78, 3),
    rect(22, 16, 71, 68, 1),
    ...Array.from({ length: 6 }, (_, i) => line('M' + (28 + i * 11) + ' 19v62')),
    rect(19, 12, 3, 75),
    rect(93, 12, 3, 75),
  ]),
  utilityWasteBin: item('decor', 'Lixeira interna com pedal', 0.44, 0.43, [
    rect(10, 6, 80, 80, 12),
    rect(16, 12, 68, 66, 9),
    rect(27, 6, 46, 7, 2),
    rect(33, 82, 34, 13, 4),
    line('M39 89h22M24 23h52'),
  ]),
  dispatchClipboard: item('decor', 'Prancheta com formulários', 0.28, 0.36, [
    ...rotate(page(7, 14, 73, 77), -6, 41, 51),
    rect(17, 5, 76, 89, 3),
    ...page(22, 14, 65, 72),
    rect(37, 8, 32, 10, 3),
    ...[44, 56, 68].flatMap((y) => [rect(28, y, 5, 5), line('M38 ' + (y + 2) + 'h36')]),
  ]),
  deskManuals: item('decor', 'Manuais e caderno aberto', 0.63, 0.42, [
    ...rotate([rect(5, 9, 40, 61, 2), line('M11 12v54'), rect(17, 22, 20, 12, 1)], -6, 24, 39),
    body('M26 36Q43 30 60 38Q77 31 96 36V91Q76 86 60 94Q42 87 26 91Z'),
    line('M60 39v51M31 46q12-3 23 1m-23 9q12-3 23 1M65 47q10-4 24-2m-24 10q10-4 24-2'),
  ]),
  loosePaperwork: item('decor', 'Papéis soltos de expediente', 0.64, 0.46, [
    ...rotate(page(8, 10, 31, 58), -10, 23, 38),
    ...rotate(page(35, 32, 36, 59), 12, 52, 61),
    ...rotate(page(60, 9, 32, 52), -5, 75, 33),
  ]),
};
