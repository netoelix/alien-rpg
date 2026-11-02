import { rect as r, line as l, body as b, circle as c } from './plan-shapes.js';
const part = (category, name, w, h, shapes) => ({ category, name, w, h, shapes });
export const outpostServices = {
  ballisticScreen: part('security', 'Biombo balístico sobre rodízios', 1.5, 0.68, [
    r(5, 28, 90, 16, 3),
    r(22, 23, 56, 7, 1),
    r(12, 17, 7, 61, 1),
    r(81, 17, 7, 61, 1),
    ...[12, 81].flatMap((x) => [c(x + 3, 16, 4), c(x + 3, 80, 4)]),
    l('M30 36h40'),
  ]),
  keyCabinet: part('security', 'Claviculário de custódia', 0.78, 0.58, [
    r(5, 8, 60, 84, 3),
    b('M66 10l29 13v69L66 80Z'),
    ...[17, 34, 51].flatMap((x) =>
      [24, 54].flatMap((y) => [c(x, y, 3), l('M' + x + ' ' + (y + 3) + 'v12h5v-4')]),
    ),
    l('M73 27l15 6m-15 4 15 6'),
  ]),
  shieldBarrier: part('security', 'Bloqueador veicular retrátil', 3.1, 1.2, [
    r(2, 9, 96, 82, 2),
    b('M8 20H92L83 69H17Z'),
    ...[16, 32, 48, 64, 80].map((x) => l('M' + x + ' 26l-4 26')),
    l('M10 78h80'),
    c(8, 84, 2),
    c(91, 84, 2),
  ]),
  restraintChair: part('detention', 'Cadeira de contenção com travas', 0.95, 1.1, [
    r(20, 10, 60, 77, 8),
    r(26, 6, 47, 17, 5),
    r(28, 36, 44, 38, 5),
    ...[12, 75].flatMap((x) => [r(x, 33, 13, 37, 4), r(x - 1, 42, 15, 7, 2)]),
    r(26, 66, 49, 7, 1),
    r(27, 82, 18, 11, 2),
    r(55, 82, 18, 11, 2),
  ]),
  passThrough: part('detention', 'Guichê de transferência de bandejas', 1.1, 0.55, [
    r(3, 10, 94, 81, 3),
    r(11, 18, 78, 62, 2),
    r(19, 26, 59, 45, 4),
    l('M7 44h7m71 0h7M27 34h42'),
    r(37, 77, 24, 6, 2),
  ]),
  eyeWash: part('sanitary', 'Lava-olhos de emergência', 0.65, 0.55, [
    b('M5 27Q50 5 95 27V53Q91 87 50 90Q8 87 5 53Z'),
    c(29, 46, 9),
    c(71, 46, 9),
    l('M29 55q21 24 42 0'),
    c(50, 76, 4),
    r(78, 15, 12, 10, 2),
  ]),
  bootWasher: part('sanitary', 'Passagem de lavagem de botas', 1.5, 0.85, [
    r(3, 8, 94, 83, 2),
    ...[18, 40, 62].flatMap((x) => [
      r(x, 17, 13, 63, 4),
      ...[26, 38, 50, 62, 73].map((y) => l('M' + (x - 3) + ' ' + y + 'h19')),
    ]),
    l('M87 14v71M8 16v68'),
  ]),
  linenPress: part('sanitary', 'Prensa de rouparia', 1.6, 0.85, [
    r(5, 11, 90, 78, 3),
    r(12, 19, 70, 43, 13),
    r(14, 66, 66, 10, 3),
    l('M22 40h50M24 71h46'),
    r(86, 25, 5, 24),
    c(88, 65, 4),
  ]),
  oarTrainer: part('fitness', 'Remo ergométrico', 2.3, 0.65, [
    c(17, 48, 14),
    r(26, 43, 68, 11, 2),
    r(54, 28, 19, 40, 5),
    r(31, 16, 7, 22, 2),
    r(31, 61, 7, 22, 2),
    l('M19 36l16-15m-5-5 12 11M89 26v46'),
  ]),
  boxingBag: part('fitness', 'Saco de boxe com suporte', 1.05, 1.18, [
    b('M8 8H86V17H48L38 34L29 31L34 17H8Z'),
    c(51, 60, 25),
    c(51, 60, 19),
    l('M32 35l13 8m4-26 4 20M60 40l6-15M43 80q7 8 15-1'),
  ]),
};
