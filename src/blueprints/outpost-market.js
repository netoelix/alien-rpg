import { rect as r, line as l, body as b, circle as c } from './plan-shapes.js';
const part = (category, name, w, h, shapes) => ({ category, name, w, h, shapes });
export const outpostMarket = {
  textileRolls: part('market', 'Expositor de rolos de tecido', 1.3, 0.8, [
    r(3, 9, 94, 82, 2),
    ...[23, 43, 64].flatMap((y) => [
      r(12, y, 75, 13, 5),
      c(84, y + 6, 4),
      l('M17 ' + (y + 4) + 'h52'),
    ]),
    b('M19 69h37l8 19H26Z'),
  ]),
  weighScale: part('market', 'Balança de balcão com pesos', 0.9, 0.5, [
    r(4, 54, 92, 35, 4),
    c(26, 42, 19),
    c(72, 42, 16),
    l('M25 44l23-22 24 21M48 24v44'),
    ...[52, 65, 80].map((x, i) => c(x, 70, 3 + i)),
  ]),
  spiceBins: part('market', 'Ilha de dispensadores a granel', 1.44, 0.68, [
    r(3, 8, 94, 83, 3),
    ...[8, 37, 66].flatMap((x) => [
      b('M' + x + ' 14h25v32l-8 15h-9l-8-15Z'),
      r(x + 7, 61, 11, 8, 1),
      r(x + 2, 76, 22, 6, 1),
    ]),
  ]),
  fishIceBed: part('market', 'Mostruário de pescado em gelo', 1.55, 0.78, [
    r(2, 6, 96, 87, 5),
    r(7, 12, 86, 73, 3),
    ...[
      [14, 35],
      [46, 59],
    ].map(([x, y]) => b('M' + x + ' ' + y + 'q13-16 29 0-14 13-29 0l-7 6v-13Z')),
    l('M67 24l6-5 8 8-7 4ZM13 66l9-4 5 8-10 6Z'),
  ]),
  pressureKegs: part('market', 'Expositor de refis de oxigênio', 0.98, 0.66, [
    r(3, 9, 94, 82, 3),
    ...[18, 40, 62, 82].flatMap((x) => [
      r(x - 7, 24, 14, 50, 6),
      r(x - 3, 16, 6, 10, 1),
      l('M' + (x - 5) + ' 41h10m-10 6h10'),
    ]),
  ]),
  parcelWrap: part('market', 'Estação de embrulho e lacre', 1.1, 0.65, [
    r(3, 9, 94, 84, 3),
    r(9, 16, 12, 65, 5),
    b('M20 20l46 8-4 48-42-7Z'),
    r(65, 19, 25, 12, 3),
    c(80, 60, 10),
    c(80, 60, 4),
    l('M69 61l-9 7'),
  ]),
  musicStand: part('decor', 'Estante de partituras', 0.68, 0.55, [
    l('M50 55L17 87M50 55l34 30M50 55V13'),
    b('M8 23Q30 16 49 23Q70 16 92 23V62Q71 57 49 64Q28 57 8 63Z'),
    l('M50 25v32M16 33h26m-26 7h26m16-7h25m-25 7h25'),
  ]),
  umbrellaRack: part('decor', 'Porta-guarda-chuvas coletivo', 0.83, 0.44, [
    r(5, 11, 90, 78, 6),
    ...[
      [22, 37],
      [43, 59],
      [66, 35],
      [80, 61],
    ].flatMap(([x, y]) => [c(x, y, 8), l('M' + x + ' ' + y + 'q-3-14 4-14t5 8')]),
  ]),
  modelShipCase: part('decor', 'Maquete de nave em redoma', 1.18, 0.65, [
    r(3, 9, 94, 83, 8),
    r(8, 15, 84, 69, 7),
    b('M14 52l14-12 29-4 23 6 9 8-17 7-25 3-16-2-11 6 3-11Z'),
    l('M34 45l31-3m-25 12 25-4M18 76h16'),
  ]),
  rugRollCart: part('decor', 'Carrinho de cenografia com tapetes', 1.4, 0.8, [
    r(3, 17, 94, 71, 3),
    ...[24, 44, 65].flatMap((y) => [r(10, y, 76, 15, 6), c(82, y + 7, 4)]),
    r(22, 15, 5, 72),
    r(65, 15, 5, 72),
    l('M89 30l7-13V9H78'),
  ]),
};
