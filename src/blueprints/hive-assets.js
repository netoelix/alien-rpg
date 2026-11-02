import { body, line } from './plan-shapes.js';

const infestation = (name, w, h, shapes) => ({ name, w, h, category: 'infestation', shapes });
const place = (shapes, transform) =>
  shapes.map((s) => ({ ...s, transform: transform + ' ' + (s.transform || '') }));
const fine = (d) => ({ ...line(d), strokeWidth: 0.85 });
const rotate = (shapes, angle) => place(shapes, 'rotate(' + angle + ' 50 50)');

// Looking onto the crown: four closed seams meet at a single point.
const eggShell = body(
  'M49 9C70 7 85 24 86 48C89 73 75 90 53 92C31 94 13 78 13 54C11 31 26 11 49 9Z',
);
const closedEgg = [
  eggShell,
  line(
    'M48 49C47 39 39 28 27 21M48 49C61 45 70 37 78 26M48 49C55 57 64 66 72 82M48 49C36 52 27 63 19 70',
  ),
  fine('M29 17Q46 9 57 14M80 42Q87 64 72 77M35 83Q24 80 20 71M36 31Q42 36 44 43M55 53Q63 59 67 69'),
];
const petal = body('M35 36C29 29 27 19 31 11Q37 2 48 4Q56 6 63 13C67 20 64 29 60 36Q48 30 35 36Z');
const openEgg = [
  body('M27 25Q49 9 73 25Q90 43 78 69Q62 89 35 78Q12 65 18 41Z'),
  ...[1, 94, 181, 271].flatMap((a) =>
    rotate([petal, fine('M37 30Q33 19 39 11M44 25Q49 18 49 9M59 29Q62 22 58 16')], a),
  ),
  body('M37 38Q49 31 60 38Q69 48 61 59Q49 68 37 58Q30 48 37 38Z'),
  fine('M37 48Q38 39 48 37M59 53Q57 61 48 62'),
];

const foldedLegs = [
  body('M38 32Q30 27 27 22Q24 20 22 24L25 35L30 39L26 32L25 26Q30 34 37 37Z'),
  body('M36 40Q27 38 22 33Q18 32 18 36L22 45L28 48L23 41L21 37Q28 44 37 45Z'),
  body('M36 49Q25 51 19 46Q15 45 17 50L22 58L28 60L22 54L20 50Q27 55 37 54Z'),
  body('M39 58Q31 65 24 61L21 59Q18 60 21 65L27 70L33 69L27 66L24 64Q33 69 42 62Z'),
];
// Tapered, overlapping sheaths; the closed silhouettes mask underlying strands.
const tether = [
  body('M2 8C26 6 24 33 42 37S69 29 79 42L96 56Q84 53 74 45C63 35 52 48 38 44S20 18 2 16Z'),
  body('M3 15C24 16 22 41 42 47S64 41 77 57Q84 66 95 68Q82 70 72 61C60 48 52 57 37 53S19 27 3 22Z'),
  line('M18 18l-3 4M22 23l-4 4M26 30l-4 4M44 48v5M49 48v6M54 47v6'),
];
export const hiveAssets = {
  wallResinWeb: infestation('Resina aderida à parede', 2.6, 1, [
    body('M0 2Q20 8 38 4T72 5L99 2L97 10Q79 11 74 16Q62 24 46 16Q23 8 13 21L1 18Z'),
    ...place(tether, 'translate(32 0) scale(.69 .68)'),
    ...place(tether, 'translate(12 2) scale(.88 1.02)'),
    ...place(tether, 'translate(0 7) scale(.81 1.26)'),
    fine('M35 72q3 9 12 12M63 78q6 0 13 8M76 44q8-3 15 1'),
  ]),
  closedHiveEgg: infestation('Ovo de facehugger fechado', 0.64, 0.72, closedEgg),
  openHiveEgg: infestation('Ovo de facehugger aberto', 0.87, 0.9, openEgg),
  ovomorphClutch: infestation('Ninho de ovos · eclosão', 2, 1.6, [
    ...place(tether, 'translate(0 29) scale(.95 .9)'),
    line('M8 30Q26 56 48 60T88 87M27 12Q42 28 67 28M13 85Q29 69 45 74'),
    ...place(closedEgg, 'translate(1 10) scale(.45 .5)'),
    ...place(closedEgg, 'translate(48 2) scale(.36 .4)'),
    ...place(closedEgg, 'translate(9 58) scale(.32 .37)'),
    ...place(openEgg, 'translate(43 41) scale(.55 .56)'),
  ]),
  splitCocoon: infestation('Casulo rompido', 1.05, 2, [
    ...place(tether, 'translate(2 21) scale(.91 .63)'),
    ...place(
      [
        body(
          'M5 18Q21 22 37 16T65 16L95 19Q80 28 86 45Q94 68 74 81L69 93L57 85Q34 95 19 73Q11 62 15 45Q20 29 5 18Z',
        ),
        body('M26 35Q39 17 59 24Q77 29 78 49Q80 65 65 76Q44 88 28 70Q16 54 26 35Z'),
        body(
          'M29 42Q37 26 53 29L48 36L59 32L66 36L62 42L72 41Q78 60 64 68L63 62L55 73L49 69L42 75Q27 73 25 58L32 58L26 50L33 49Z',
        ),
        fine('M18 32Q31 17 44 20M21 60Q21 76 38 81M67 78Q84 64 82 47M35 37l7-4M31 65l6 4'),
      ],
      'translate(0 4) scale(1 .59)',
    ),
  ]),
  spentFacehugger: infestation('Facehugger morto', 0.95, 0.8, [
    body(
      'M47 63C49 83 69 91 82 81C95 70 93 48 83 45C77 43 75 49 80 52Q72 50 77 44C84 36 94 45 95 58C99 79 84 93 68 92Q45 90 40 65Z',
    ),
    ...foldedLegs,
    ...place(foldedLegs, 'translate(91 0) scale(-1 1)'),
    body('M44 20Q49 17 52 23L53 29Q62 33 59 47L56 59Q54 68 47 70Q37 68 35 58L31 43Q30 32 38 28Z'),
    line('M43 27Q37 34 36 44Q37 52 40 57M50 26Q56 35 54 43Q54 50 51 56M45 31Q42 40 45 51T46 64'),
    fine(
      'M40 35l5 3 6-3M38 43l7 3 8-4M41 53l5 3 5-4M48 75l6-4M55 82l5-5M65 87l3-5M76 87l-1-4M87 79l-3-3',
    ),
  ]),
  boundCrewCocoon: infestation('Tripulante preso à parede', 1.35, 2.05, [
    ...place(tether, 'translate(0 12) scale(.96 .68)'),
    ...place(
      [
        body(
          'M3 10Q26 17 48 9T97 13L87 23Q82 29 89 46Q95 65 78 79L85 90Q68 88 57 80Q42 87 23 82L11 91Q17 78 12 63Q3 48 14 32Q20 21 3 10Z',
        ),
        body(
          'M14 50Q15 37 32 35L44 37L61 34Q80 31 86 48L81 64Q70 62 64 55Q55 64 39 62Q31 56 24 63L17 64Z',
        ),
        line('M23 43Q30 37 37 40M66 38Q77 36 80 45M27 49l4 7M71 48l-5 9'),
        body('M37 47Q37 32 50 32Q65 32 66 47Q66 57 60 64L54 69Q48 71 42 64Q36 57 37 47Z'),
        fine('M40 46Q41 36 51 36Q60 36 62 44M43 61Q52 66 60 59'),
        line(
          'M10 18Q28 28 26 39M83 19Q70 28 74 37M13 54Q18 69 36 68T57 80M85 56Q82 68 66 71L60 77M23 78Q31 71 40 74',
        ),
      ],
      'translate(0 3) scale(1 .59)',
    ),
  ]),
  hiveRibSpan: infestation('Arco de costelas alienígenas', 3.7, 1.15, [
    body('M1 3L9 12Q17 24 19 44L17 75L9 94L7 74L2 84L5 51Z'),
    body('M99 5L94 46L98 76L93 70L92 96L81 78L79 49L82 29Z'),
    ...[0, 1, 2, 3, 4]
      .map((n) =>
        place(
          [
            body('M8 19C24 5 33 11 46 16S72 28 89 14L94 12L91 21C76 37 59 34 44 23S24 14 10 29Z'),
            fine('M13 19Q26 9 35 15M64 27Q77 30 88 20'),
          ],
          'translate(0 ' + [0, 13, 24, 39, 53][n] + ') scale(1 ' + [1, 0.8, 1.13, 0.75, 1][n] + ')',
        ),
      )
      .flat(),
    fine('M4 13q9 14 8 25M9 58l-2 18M93 18l-6 20M88 67l4 11'),
  ]),
};
