import { rect as r, line as l, body as b, circle as c } from './plan-shapes.js';
const piece = (category, name, w, h, shapes) => ({ category, name, w, h, shapes });
export const outpostTransit = {
  parcelChute: piece('transit', 'Rampa de triagem de encomendas', 2.6, 1.3, [
    b('M2 10H96L86 90H32Z'),
    l('M8 16l28 68h45l9-68M16 27h71m-66 13h64m-58 15h56'),
    r(37, 63, 26, 14, 2),
  ]),
  platformClock: piece('transit', 'Relógio duplo de plataforma', 1.4, 0.45, [
    r(43, 9, 14, 82, 2),
    r(4, 22, 39, 54, 6),
    r(57, 22, 39, 54, 6),
    l('M10 28v41m79-41v41M46 16h8m-8 67h8'),
  ]),
  boardingBridge: piece('transit', 'Passadiço telescópico de embarque', 4.4, 1.6, [
    r(1, 10, 39, 80, 2),
    r(40, 16, 35, 68),
    r(75, 22, 24, 56),
    ...[8, 17, 26, 35].map((x) => l('M' + x + ' 14v72')),
    l('M44 23h27m-27 54h27M80 31h14m-14 37h14'),
  ]),
  lockerWall: piece('transit', 'Bateria de guarda-volumes', 2.45, 0.74, [
    r(2, 9, 96, 81, 2),
    ...[6, 28, 50, 72].flatMap((x) => [
      r(x, 15, 20, 65),
      r(x + 11, 65, 5, 8, 1),
      l('M' + (x + 3) + ' 23h13'),
    ]),
  ]),
  railSignal: piece('transit', 'Sinaleiro ferroviário de três focos', 1.05, 0.55, [
    r(42, 49, 16, 44, 2),
    r(7, 13, 86, 44, 11),
    ...[24, 50, 76].flatMap((x) => [c(x, 35, 10), l('M' + (x - 9) + ' 29q9-16 18 0')]),
    r(30, 85, 40, 9),
  ]),
  cablePallet: piece('cargo', 'Palete de condutores enrolados', 1.4, 1.1, [
    r(4, 6, 92, 88, 2),
    ...[29, 68].flatMap((x) => [c(x, 48, 17), c(x, 48, 12), c(x, 48, 7), r(x - 2, 23, 4, 50)]),
    l('M9 83h82'),
  ]),
  glassCarrier: piece('cargo', 'Cavalete de painéis de vidro', 2, 0.85, [
    r(3, 10, 94, 78, 2),
    ...[22, 30, 38, 46, 54, 62].map((y) => l('M9 ' + y + 'h81')),
    r(16, 13, 6, 70),
    r(77, 13, 6, 70),
    l('M12 78l34-13m16 9 12-5'),
  ]),
  drumClamp: piece('cargo', 'Garra de içamento de tambores', 1.15, 1.15, [
    b('M6 40Q10 11 44 8L41 17Q17 22 16 44Z'),
    b('M94 40Q90 11 56 8L59 17Q83 22 84 44Z'),
    b('M12 58L42 79H58L87 56L92 65L60 91H39L5 65Z'),
    l('M13 35l36 14 36-14M49 49v32'),
    c(49, 48, 7),
  ]),
  toolTransitCase: piece('cargo', 'Maleta aberta de instrumentos', 0.85, 0.72, [
    r(6, 5, 88, 38, 4),
    r(6, 46, 88, 49, 4),
    l('M12 11h76m-76 8h76m-76 8h76'),
    r(12, 52, 26, 35, 4),
    c(25, 65, 7),
    r(44, 54, 39, 11, 3),
    r(44, 72, 32, 8, 2),
  ]),
  gasBottleNest: piece('cargo', 'Gaiola de cilindros de gás', 1.55, 1.05, [
    r(2, 4, 96, 92, 2),
    ...[20, 49, 78].flatMap((x) =>
      [23, 66].flatMap((y) => [c(x, y, 12), c(x, y, 5), l('M' + (x - 3) + ' ' + y + 'h6')]),
    ),
    l('M5 47h90M7 88h84'),
  ]),
};
