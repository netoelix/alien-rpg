import { rect as r, line as l, body as b, circle as c } from './plan-shapes.js';
const part = (name, w, h, shapes) => ({ name, w, h, category: 'engineering', shapes });
export const outpostEngineering = {
  flywheelBank: part('Banco de volantes de inércia', 3, 1.25, [
    r(5, 36, 90, 25, 3),
    r(2, 42, 96, 12),
    ...[22, 41, 60, 79].flatMap((x) => [r(x - 5, 7, 10, 85, 5), l('M' + x + ' 13v74')]),
  ]),
  airScrubber: part('Depurador de ar com cartuchos', 1.8, 1.25, [
    r(7, 6, 85, 88, 5),
    ...[25, 48, 71].flatMap((x) => [r(x - 7, 20, 15, 55, 6), l('M' + (x - 4) + ' 26v41m5-41v41')]),
    r(2, 34, 8, 29),
    r(90, 34, 8, 29),
    l('M16 82h66'),
  ]),
  centrifugalSeparator: part('Separador ciclônico', 1.9, 1.42, [
    c(48, 50, 33),
    c(48, 50, 22),
    c(48, 50, 9),
    b('M5 9H48Q73 11 80 32L63 29Q54 21 39 22H5Z'),
    r(65, 67, 25, 13, 2),
    l('M29 60q5 14 23 12'),
  ]),
  batterySled: part('Trenó de baterias de emergência', 1.85, 1.04, [
    r(3, 7, 94, 86, 4),
    ...[10, 37, 64].flatMap((x) => [
      r(x, 16, 24, 58, 2),
      c(x + 5, 24, 2),
      c(x + 18, 24, 2),
      l('M' + (x + 4) + ' 61h15'),
    ]),
    l('M15 81h65M15 24h12m15 0h12m15 0h12'),
  ]),
  busbarCabinet: part('Armário de barramentos elétricos', 1.6, 0.78, [
    r(3, 8, 94, 85, 2),
    ...[24, 48, 72].flatMap((y) => [
      r(11, y, 77, 6, 1),
      ...[20, 48, 78].map((x) => c(x, y + 3, 2)),
    ]),
    l('M6 14v68M94 14v68'),
  ]),
  expansionBellows: part('Compensador de dilatação axial', 1.65, 0.8, [
    r(2, 30, 96, 42, 4),
    r(6, 17, 7, 67),
    r(87, 17, 7, 67),
    ...[23, 32, 41, 50, 59, 68, 77].map((x) => b('M' + x + ' 19l4 6v51l-4 6-3-6V25Z')),
  ]),
  hoseReel: part('Carretel de mangueira de incêndio', 0.92, 0.72, [
    r(7, 13, 80, 72, 5),
    c(45, 47, 30),
    c(45, 47, 23),
    c(45, 47, 16),
    c(45, 47, 7),
    l('M21 66q8 22 38 15t29-15'),
    b('M82 68l5-12 7 3-6 12Z'),
  ]),
  lubeSkid: part('Unidade de lubrificação central', 1.45, 0.95, [
    r(3, 7, 94, 85, 3),
    c(29, 43, 19),
    c(29, 43, 6),
    r(56, 22, 28, 32, 5),
    l('M48 42h7M70 55v16H24'),
    ...[29, 44, 59, 74].map((x) => r(x, 68, 5, 14)),
  ]),
  furnaceCrucible: part('Cadinho de indução', 1.65, 1.45, [
    r(4, 18, 18, 61, 4),
    c(55, 50, 37),
    c(55, 50, 29),
    c(55, 50, 20),
    b('M74 24l12-12-3 20Z'),
    l('M8 31h10m-10 9h10m-10 9h10M21 66q12 13 19 8'),
  ]),
  umbilicalDock: part('Tomada de umbilical de serviço', 1.1, 0.75, [
    r(3, 7, 94, 84, 6),
    c(32, 48, 21),
    ...[
      [25, 45],
      [39, 45],
      [32, 55],
    ].map(([x, y]) => c(x, y, 3)),
    r(61, 19, 25, 56, 4),
    l('M65 28h17m-17 10h17m-17 10h17m-17 10h17'),
  ]),
};
