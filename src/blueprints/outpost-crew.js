import { rect as r, line as l, body as b, circle as c } from './plan-shapes.js';
const part = (category, name, w, h, shapes) => ({ category, name, w, h, shapes });
export const outpostCrew = {
  teleprinter: part('command', 'Teletipo com rolo contínuo', 0.87, 0.75, [
    r(5, 11, 89, 79, 4),
    r(13, 7, 72, 15, 5),
    b('M20 21h59l-3 29H23Z'),
    l('M28 28h39m-39 7h32'),
    r(14, 56, 71, 23, 3),
    l('M20 62h56m-56 8h48'),
  ]),
  tapeReader: part('command', 'Leitor de fita perfurada', 0.85, 0.65, [
    r(3, 12, 94, 76, 4),
    c(23, 38, 15),
    c(23, 38, 5),
    r(46, 23, 29, 32, 3),
    b('M21 50L52 42L64 49L28 59Z'),
    l('M29 53l19-6m21 7 18 10-7 8-16-10'),
    c(85, 32, 4),
  ]),
  patchBay: part('command', 'Mesa de comutação telefônica', 1.65, 0.88, [
    r(3, 8, 94, 83, 4),
    ...[18, 35, 52, 69, 83].flatMap((x) => [c(x, 31, 4), c(x, 51, 4)]),
    l('M18 31q0 46 34 20M35 51q8 39 34-20M17 73h65'),
    r(9, 14, 82, 6),
  ]),
  chartLightTable: part('command', 'Mesa luminosa de cartas estelares', 1.8, 1.15, [
    r(4, 7, 92, 86, 4),
    r(10, 14, 72, 64, 2),
    l('M15 61l15-26 18 13 27-19M18 72l43-48'),
    ...[
      [30, 35],
      [48, 48],
      [75, 29],
    ].map(([x, y]) => c(x, y, 2.4)),
    c(89, 35, 3),
    c(89, 50, 3),
    r(22, 82, 47, 4),
  ]),
  deadmanStation: part('command', 'Pedestal de autorização de lançamento', 0.8, 0.68, [
    b('M6 23L16 10H84L95 25V84H6Z'),
    r(19, 22, 61, 24, 4),
    r(25, 28, 48, 10),
    ...[23, 76].flatMap((x) => [c(x, 64, 8), l('M' + x + ' 60v8')]),
    r(40, 56, 20, 14, 2),
  ]),
  foldScreen: part('quarters', 'Divisória acústica dobrável', 1.95, 0.55, [
    b('M3 58L28 18L51 55L74 18L97 56L93 65L74 34L51 72L28 35L7 69Z'),
    ...[28, 51, 74].map((x, i) => c(x, i === 1 ? 63 : 26, 3)),
    r(3, 62, 7, 15, 2),
    r(90, 60, 7, 16, 2),
  ]),
  hammock: part('quarters', 'Rede de descanso entre suportes', 2.5, 0.88, [
    r(3, 15, 6, 71, 2),
    r(91, 15, 6, 71, 2),
    b('M7 50Q28 39 34 23Q50 12 69 25Q79 42 93 50Q79 56 68 76Q49 91 32 74Q20 55 7 50Z'),
    l('M12 50q36-28 75 0M15 51q35 23 70 0M33 30l-7 24m42-25 7 25'),
  ]),
  footlockerBench: part('quarters', 'Baú aberto de pertences', 1.15, 0.95, [
    r(6, 5, 88, 35, 4),
    r(6, 44, 88, 50, 4),
    r(12, 50, 38, 36, 3),
    b('M57 57l20-5 9 21-20 6Z'),
    l('M11 12h78m-78 7h78M16 88h66'),
    r(41, 84, 18, 6, 1),
  ]),
  bookCarousel: part('quarters', 'Biblioteca giratória de bordo', 0.95, 0.95, [
    c(50, 50, 44),
    c(50, 50, 12),
    ...[0, 90, 180, 270].flatMap((a) =>
      [r(44, 10, 7, 24, 1), r(53, 12, 6, 20, 1), r(35, 14, 6, 17, 1)].map((s) => ({
        ...s,
        transform: 'rotate(' + a + ' 50 50)',
      })),
    ),
  ]),
  chessPedestal: part('quarters', 'Mesa de xadrez magnético', 0.85, 0.85, [
    r(4, 5, 92, 90, 6),
    r(15, 15, 70, 70),
    ...Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) => ({
        ...r(15 + (2 * j + (i % 2)) * 8.75, 15 + i * 8.75, 8.75, 8.75),
        fill: 'currentColor',
        stroke: 'none',
        opacity: 0.33,
      })),
    ).flat(),
    c(37, 45, 3),
    c(62, 62, 3),
  ]),
};
