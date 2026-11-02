import { rect, line, body, circle } from './plan-shapes.js';

const command = (name, w, h, shapes) => ({ name, w, h, category: 'command', shapes });
const quarters = (name, w, h, shapes) => ({ name, w, h, category: 'quarters', shapes });

const pilotControls = (x) => [
  rect(x, 20, 23, 20, 3),
  rect(x + 3, 23, 17, 11, 2),
  line('M' + (x + 4) + ' 30h5l3-3 3 3h4'),
  rect(x + 8, 52, 7, 15, 2),
  body('M' + (x + 1) + ' 49h4v7l6 3 7-3v-7h4v11l-11 5-10-5Z'),
];

export const crewDeckAssets = {
  twinFlightDeck: command('Posto duplo de pilotagem', 3.1, 1.35, [
    body('M2 23L11 8H89L98 23V85H89L81 72H62L58 88H42L38 72H19L11 85H2Z'),
    ...pilotControls(13),
    ...pilotControls(64),
    rect(44, 22, 12, 45, 2),
    line('M47 28v22m5-22v22'),
    rect(45, 36, 4, 7, 1),
    rect(50, 40, 4, 7, 1),
    line('M7 28v31M93 28v31'),
  ]),
  arcCommandDesk: command('Console de comando em arco', 3.4, 1.65, [
    body('M2 79Q6 12 50 8Q94 12 98 79L79 90Q75 42 50 39Q25 42 21 90Z'),
    body('M12 55Q16 36 29 26L33 37Q24 46 22 62Z'),
    body('M36 22Q50 15 64 22L61 34Q50 29 39 34Z'),
    body('M71 26Q84 36 88 55L78 62Q76 46 67 37Z'),
    line('M8 72l11 5M81 77l11-5M42 25q8-3 16 0'),
    circle(15, 66, 2),
    circle(85, 66, 2),
  ]),
  damageControlBoard: command('Estação de controle de avarias', 1.9, 0.95, [
    rect(2, 5, 96, 90, 4),
    rect(7, 12, 59, 55, 3),
    rect(11, 16, 51, 47, 2),
    line('M15 36l7-9h28l8 9-8 13H22ZM25 28v20m11-20v20m11-20v20M16 37h40'),
    ...[16, 32, 48].map((y) => rect(73, y, 16, 8, 1)),
    ...[12, 24, 36, 48, 60].map((x) => rect(x, 76, 7, 9, 1)),
    circle(83, 78, 6),
  ]),
  curtainBerth: quarters('Beliche de bordo com cortina', 2.25, 1.05, [
    rect(2, 4, 96, 92, 5),
    rect(7, 10, 86, 76, 7),
    rect(12, 17, 18, 55, 5),
    line('M37 14v66M87 16v61'),
    rect(4, 85, 92, 7, 2),
    body('M58 82Q64 73 68 81Q72 72 77 80Q82 72 86 81L94 77V93H58Z'),
    line('M65 84v6m8-7v7m9-7v7M9 7v6m83-6v6'),
  ]),
  foldingCabinDesk: quarters('Escrivaninha rebatível de cabine', 1.25, 1.15, [
    rect(5, 6, 90, 9, 1),
    rect(8, 15, 84, 40, 3),
    rect(17, 16, 11, 5, 1),
    rect(72, 16, 11, 5, 1),
    body('M20 29l23-3 2 14-23 3Z'),
    line('M53 44h23M15 50h70'),
    rect(28, 60, 44, 33, 6),
    rect(30, 84, 40, 10, 3),
    line('M23 60v23m54-23v23M35 55v6m30-6v6'),
  ]),
  lockerSeatBank: quarters('Banco com gavetões de tripulação', 2.1, 0.7, [
    rect(2, 8, 96, 83, 4),
    rect(5, 13, 90, 10, 2),
    ...[5, 36, 67].flatMap((x) => [
      rect(x, 27, 28, 40, 4),
      rect(x, 72, 28, 14, 1),
      rect(x + 8, 75, 12, 4, 1),
    ]),
  ]),
};
