// External silhouettes in normalized coordinates; footprints are metres.
const rect = (x, y, width, height, rx = 0) => ({ tag: 'rect', x, y, width, height, rx });
const line = (d) => ({ tag: 'path', d, fill: 'none' });
const circle = (cx, cy, r) => ({ tag: 'circle', cx, cy, r });
const ribs = (x, y, w, h, count) =>
  Array.from({ length: count }, (_, i) =>
    line('M' + (x + (i * w) / (count - 1)) + ' ' + y + 'v' + h),
  );
// Common roof vocabulary: thick parapets, raised curbs, glazing and fan blades.
const stroke = (shape, width) => ({ ...shape, strokeWidth: width });
const roof = (x, y, w, h) => [
  stroke(rect(x, y, w, h, 2), 1.5),
  rect(x + 2, y + 2, w - 4, h - 4, 1),
  line('M' + (x + 3) + ' ' + (y + h - 5) + 'h' + (w - 6)),
];
const skylight = (x, y, w, h) => [
  stroke(rect(x, y, w, h, 1), 1.1),
  rect(x + 2, y + 2, w - 4, h - 5),
  ...Array.from({ length: 3 }, (_, i) =>
    line('M' + (x + 2 + ((i + 1) * (w - 4)) / 4) + ' ' + (y + 2) + 'v' + (h - 5)),
  ),
  line('M' + (x + 3) + ' ' + (y + 6) + 'l3-3M' + (x + w - 7) + ' ' + (y + h - 5) + 'l3-3'),
];
const fan = (x, y) => [
  stroke(rect(x - 7, y - 7, 14, 14, 1), 1),
  rect(x - 5.5, y - 5.5, 11, 11, 1),
  circle(x, y, 4.5),
  ...[0, 120, 240].map((a) => ({
    tag: 'path',
    d: 'M' + x + ' ' + y + 'q-5-1-3-4q4-1 3 4Z',
    transform: 'rotate(' + a + ' ' + x + ' ' + y + ')',
    fill: 'currentColor',
    stroke: 'none',
  })),
  circle(x, y, 1.1),
];
const pipe = (d) => [stroke(line(d), 3), stroke(line(d), 1.3)];
const tank = (x, y, r) => [
  stroke(circle(x, y, r), 1.4),
  circle(x, y, r - 2),
  line('M' + (x - r + 3) + ' ' + y + 'Q' + x + ' ' + (y - r + 2) + ' ' + (x + r - 3) + ' ' + y),
  circle(x + 3, y - 2, 2.5),
  stroke(line('M' + (x - r - 2) + ' ' + (y - 7) + 'v14'), 1.3),
  ...[-5, -2, 1, 4].map((v) => line('M' + (x - r - 3) + ' ' + (y + v) + 'h3')),
];
const asset = (name, w, h, shapes) => ({
  name,
  w,
  h,
  category: 'settlement',
  exterior: true,
  shapes,
});

const grille = (x, y, w, h) => [rect(x, y, w, h, 1), ...ribs(x + 2, y + 2, w - 4, h - 4, 6)];
const cross = (x, y, size = 10) => [
  stroke(
    line('M' + (x - size / 2) + ' ' + y + 'h' + size + 'M' + x + ' ' + (y - size / 2) + 'v' + size),
    2,
  ),
];
const dome = (x, y, r) => [
  stroke(circle(x, y, r), 1.7),
  circle(x, y, r - 2),
  line('M' + (x - r + 3) + ' ' + y + 'Q' + x + ' ' + (y - r + 1) + ' ' + (x + r - 3) + ' ' + y),
  line('M' + x + ' ' + (y - r + 3) + 'Q' + (x - r / 2) + ' ' + y + ' ' + x + ' ' + (y + r - 3)),
  circle(x, y, 3),
];
const awning = (x, y, w, h) => [rect(x, y, w, h, 1), ...ribs(x + 2, y + 1, w - 4, h - 2, 5)];
const buildings = {
  colonyReactor: asset('Contenção de reator', 44, 44, [
    ...pipe('M48 50H88V82'),
    ...roof(8, 16, 72, 68),
    ...dome(43, 48, 31),
    ...roof(78, 58, 18, 32),
    ...fan(87, 70),
    ...[0, 90, 180, 270].map((a) => ({
      ...stroke(rect(39, 13, 8, 7, 1), 1.2),
      transform: 'rotate(' + a + ' 43 48)',
    })),
    ...roof(24, 82, 38, 14),
    ...grille(30, 86, 26, 6),
  ]),
  colonyLaboratory: asset('Laboratório de pesquisa', 32, 26, [
    ...roof(6, 14, 58, 70),
    ...roof(64, 27, 30, 46),
    ...skylight(15, 23, 39, 20),
    ...roof(14, 51, 40, 24),
    ...fan(25, 63),
    ...fan(43, 63),
    ...grille(70, 34, 18, 13),
    ...grille(70, 53, 18, 13),
    ...roof(28, 83, 22, 13),
    line('M33 87h12M33 91h12'),
    rect(77, 16, 10, 11, 1),
    circle(82, 21, 2),
  ]),
  colonyAdministration: asset('Prédio administrativo', 36, 28, [
    ...roof(8, 8, 84, 30),
    ...roof(8, 38, 26, 49),
    ...roof(66, 38, 26, 49),
    ...skylight(20, 15, 60, 15),
    ...roof(34, 38, 32, 22),
    ...skylight(40, 42, 20, 14),
    ...fan(21, 52),
    ...fan(79, 52),
    ...grille(15, 66, 12, 12),
    ...grille(73, 66, 12, 12),
    ...awning(37, 65, 26, 9),
    rect(37, 79, 26, 10, 1),
    line('M41 82h18M41 86h18'),
  ]),
  colonyClinic: asset('Posto médico', 20, 16, [
    ...roof(8, 12, 84, 72),
    ...roof(58, 23, 24, 46),
    ...fan(70, 36),
    ...grille(63, 49, 14, 14),
    ...cross(32, 37, 19),
    ...skylight(18, 57, 29, 15),
    ...awning(25, 84, 48, 12),
  ]),
  colonyHospital: asset('Hospital colonial', 52, 40, [
    ...roof(6, 8, 28, 82),
    ...roof(66, 8, 28, 82),
    ...roof(34, 28, 32, 44),
    ...skylight(12, 18, 16, 26),
    ...skylight(72, 18, 16, 26),
    ...fan(20, 60),
    ...fan(80, 60),
    ...grille(13, 72, 14, 11),
    ...grille(73, 72, 14, 11),
    ...roof(39, 34, 22, 31),
    ...cross(50, 49, 15),
    ...awning(37, 76, 26, 13),
    line('M42 92h16M42 95h16'),
  ]),
  colonySecurity: asset('Posto de segurança', 28, 24, [
    ...roof(9, 13, 82, 72),
    ...roof(3, 7, 21, 23),
    ...roof(76, 7, 21, 23),
    ...roof(3, 70, 21, 23),
    ...roof(76, 70, 21, 23),
    ...roof(31, 27, 38, 40),
    ...fan(42, 40),
    ...grille(52, 33, 10, 23),
    ...awning(35, 77, 30, 13),
    stroke(line('M36 20h28'), 1.3),
    ...[13, 86].map((x) => rect(x, 16, 4, 4)),
    ...[13, 86].map((x) => rect(x, 79, 4, 4)),
  ]),
  colonySmallResidence: asset('Habitação compacta', 14, 10, [
    ...roof(8, 14, 84, 68),
    ...skylight(17, 25, 35, 24),
    ...fan(72, 35),
    ...grille(62, 54, 20, 16),
    ...awning(27, 82, 46, 12),
    line('M18 61h34M18 66h34'),
  ]),
  colonyDenseResidence: asset('Habitação de alta densidade', 48, 36, [
    ...roof(6, 8, 88, 84),
    ...roof(12, 14, 76, 72),
    ...roof(18, 20, 64, 60),
    ...[26, 48, 70].flatMap((x) => [rect(x - 6, 27, 12, 43, 1), ...ribs(x - 4, 30, 8, 37, 4)]),
    ...roof(35, 41, 30, 27),
    ...fan(43, 54),
    ...fan(57, 54),
    ...awning(34, 87, 32, 10),
    line('M7 30h5M7 50h5M7 70h5M88 30h5M88 50h5M88 70h5'),
  ]),
  colonyWarehouse: asset('Armazém de cargas', 44, 30, [
    ...roof(5, 8, 90, 72),
    ...ribs(12, 14, 76, 60, 12),
    ...skylight(18, 32, 64, 14),
    ...[15, 38, 61].flatMap((x) => [
      ...roof(x, 80, 18, 16),
      line('M' + (x + 3) + ' 84h12M' + (x + 3) + ' 89h12'),
    ]),
  ]),
  colonyColdStore: asset('Armazém refrigerado', 34, 26, [
    ...roof(5, 10, 90, 70),
    ...roof(11, 17, 25, 55),
    ...fan(23, 31),
    ...fan(23, 56),
    ...[45, 60, 75].map((x) => rect(x, 20, 9, 49, 1)),
    ...roof(40, 80, 43, 15),
    line('M45 85h33M45 90h33'),
  ]),
  colonyAtmosphere: asset('Processador atmosférico', 70, 48, [
    ...roof(7, 9, 86, 82),
    ...roof(14, 17, 72, 66),
    ...roof(33, 10, 34, 80),
    ...grille(39, 18, 22, 28),
    ...grille(39, 54, 22, 28),
    ...[22, 78].flatMap((x) => [...fan(x, 29), ...fan(x, 50), ...fan(x, 71)]),
    ...[3, 89].flatMap((x) => [rect(x, 35, 8, 30, 1), ...ribs(x + 2, 38, 4, 24, 3)]),
    ...awning(35, 91, 30, 7),
  ]),
  colonyHydroponics: asset('Fazenda hidropônica', 54, 38, [
    ...roof(5, 6, 90, 88),
    ...[12, 39, 66].flatMap((x) => [
      ...skylight(x, 13, 22, 59),
      ...[28, 43, 58].map((y) => line('M' + (x + 2) + ' ' + y + 'h18')),
    ]),
    ...pipe('M16 80H84'),
    ...tank(22, 82, 8),
    ...tank(78, 82, 8),
    ...roof(40, 75, 20, 16),
    ...grille(44, 79, 12, 8),
  ]),
  colonyWaterPlant: asset('Estação de tratamento de água', 42, 32, [
    ...pipe('M22 25H76V73H22'),
    ...[25, 73].flatMap((y) => [
      stroke(rect(7, y - 17, 43, 34, 8), 1.4),
      rect(10, y - 14, 37, 28, 7),
      line('M16 ' + (y - 8) + 'q6-4 12 0t12 0M16 ' + (y + 6) + 'q6-4 12 0t12 0'),
    ]),
    ...roof(61, 11, 32, 78),
    ...fan(77, 26),
    ...grille(68, 42, 18, 32),
  ]),
  colonySubstation: asset('Subestação elétrica', 30, 24, [
    ...roof(5, 9, 90, 82),
    ...[15, 55].flatMap((x) => [
      ...roof(x, 20, 30, 54),
      ...grille(x + 5, 26, 20, 26),
      ...[x + 7, x + 15, x + 23].flatMap((cx) => [circle(cx, 62, 3), circle(cx, 62, 1)]),
    ]),
    ...pipe('M10 81H90'),
    ...awning(37, 89, 26, 8),
  ]),
  colonyGarage: asset('Oficina e garagem de veículos', 40, 28, [
    ...roof(6, 10, 88, 66),
    ...skylight(15, 20, 48, 15),
    ...fan(79, 28),
    ...grille(15, 45, 70, 19),
    ...[10, 38, 66].flatMap((x) => [
      ...roof(x, 76, 24, 20),
      line('M' + (x + 3) + ' 82h18M' + (x + 3) + ' 88h18'),
    ]),
  ]),
  colonyComms: asset('Estação de comunicações', 30, 30, [
    ...roof(10, 14, 80, 70),
    ...roof(18, 22, 44, 54),
    rect(25, 29, 30, 37, 2),
    { tag: 'ellipse', cx: 40, cy: 43, rx: 14, ry: 10 },
    { tag: 'ellipse', cx: 40, cy: 43, rx: 11, ry: 7, fill: 'none' },
    stroke(line('M27 48L40 35L53 48M40 53v10M32 63h16'), 1.2),
    circle(40, 35, 2),
    ...fan(76, 37),
    ...fan(76, 63),
    ...roof(37, 84, 26, 12),
    stroke(line('M22 14V4M16 8h12'), 1.3),
  ]),

  colonyHabitat: asset('Bloco habitacional · cobertura', 28, 20, [
    ...roof(5, 12, 90, 76),
    ...skylight(14, 24, 40, 24),
    ...roof(62, 23, 24, 45),
    ...fan(74, 36),
    ...fan(74, 54),
    rect(14, 59, 36, 17, 1),
    rect(17, 62, 30, 11),
    ...ribs(22, 62, 20, 11, 5),
    line('M17 67h30'),
    ...roof(1, 36, 10, 28),
    ...roof(89, 36, 10, 28),
    line('M19 18h36M19 81h36'),
  ]),
  colonyHangar: asset('Hangar industrial · cobertura', 40, 28, [
    ...roof(5, 8, 90, 78),
    ...ribs(13, 14, 74, 65, 9).map((p) => stroke(p, 0.8)),
    ...skylight(22, 35, 56, 16),
    rect(16, 86, 68, 9, 1),
    line('M20 89h60M20 92h60'),
    ...roof(1, 23, 11, 16),
    ...roof(88, 60, 11, 16),
  ]),
  colonyFactory: asset('Usina de processamento · exterior', 42, 30, [
    ...pipe('M56 29H82V72H56'),
    ...roof(4, 12, 56, 76),
    ...roof(10, 19, 19, 61),
    ...fan(19.5, 31),
    ...fan(19.5, 49),
    ...fan(19.5, 67),
    rect(36, 21, 16, 52, 2),
    ...ribs(39, 25, 10, 44, 4),
    line('M36 38h16M36 56h16'),
    ...tank(81, 27, 15),
    ...tank(81, 73, 15),
    ...roof(10, 89, 44, 8),
  ]),
  colonyGreenhouse: asset('Estufas de cultivo · conjunto', 30, 24, [
    ...[5, 37, 69].flatMap((x) => [
      stroke(rect(x, 7, 25, 73, 6), 1.4),
      rect(x + 2, 9, 21, 69, 5),
      line('M' + (x + 12.5) + ' 10v66'),
      ...[22, 36, 50, 64].map((y) => stroke(line('M' + (x + 2) + ' ' + y + 'h21'), 1)),
      ...[14, 28, 42, 56, 70].flatMap((y) => [
        line('M' + (x + 4) + ' ' + (y + 4) + 'l4-4'),
        line('M' + (x + 16) + ' ' + (y + 4) + 'l4-4'),
      ]),
      rect(x + 8, 80, 9, 6),
    ]),
    ...roof(10, 86, 80, 10),
    ...roof(38, 87, 24, 12),
  ]),
  colonyLandingPad: asset('Plataforma de pouso · espaço-porto', 48, 48, [
    stroke({ tag: 'path', d: 'M25 5H75L95 25V75L75 95H25L5 75V25Z' }, 1.5),
    line('M26 8H74L92 26V74L74 92H26L8 74V26Z'),
    line('M28 12H72L88 28V72L72 88H28L12 72V28Z'),
    // Recessed deck edge and segmented approach markings.
    stroke(line('M13 73L28 87H72L87 73'), 1.1),
    stroke({ ...circle(50, 50, 30), fill: 'none' }, 1.2),
    { ...circle(50, 50, 27.5), fill: 'none' },
    stroke(line('M43 38v24M57 38v24M43 50h14'), 1.8),
    ...[
      [50, 18],
      [82, 50],
      [50, 82],
      [18, 50],
    ].flatMap(([x, y]) => [
      stroke(rect(x - 3, y - 2, 6, 4, 1), 1),
      rect(x - 1.8, y - 1, 3.6, 2, 0.5),
    ]),
    ...[0, 90, 180, 270].flatMap((angle) => [
      {
        ...stroke(line('M20 20l5 5M23 17l5 5M17 23l5 5'), 1.2),
        transform: 'rotate(' + angle + ' 50 50)',
      },
      { ...rect(36, 7.5, 8, 3, 0.5), transform: 'rotate(' + angle + ' 50 50)' },
      { ...line('M38 8.5h4'), transform: 'rotate(' + angle + ' 50 50)' },
    ]),
  ]),
  colonyMarket: asset('Mercado coberto · pavilhão', 32, 24, [
    ...roof(6, 8, 88, 84),
    ...[10, 59].flatMap((x) => [
      rect(x, 13, 31, 74, 1),
      stroke(line('M' + (x + 15.5) + ' 13v74'), 1.1),
      ...[27, 42, 57, 72].map((y) => line('M' + x + ' ' + y + 'l15.5-3L' + (x + 31) + ' ' + y)),
    ]),
    ...skylight(43, 24, 14, 52),
    rect(43, 4, 14, 8, 1),
    rect(43, 88, 14, 8, 1),
  ]),
  colonySilo: asset('Silos de armazenamento · conjunto', 24, 20, [
    rect(46, 13, 8, 74, 1),
    ...[
      [25, 27],
      [75, 27],
      [25, 73],
      [75, 73],
    ].flatMap(([x, y]) => [
      ...tank(x, y, 20),
      ...[45, 135, 225, 315].map((a) =>
        line(
          'M' +
            (x + 5 * Math.cos((a * Math.PI) / 180)) +
            ' ' +
            (y + 5 * Math.sin((a * Math.PI) / 180)) +
            'L' +
            (x + 17 * Math.cos((a * Math.PI) / 180)) +
            ' ' +
            (y + 17 * Math.sin((a * Math.PI) / 180)),
        ),
      ),
    ]),
    line('M45 27h10M45 73h10'),
  ]),
  colonyControl: asset('Posto de controle · cobertura', 18, 16, [
    ...roof(8, 14, 84, 72),
    ...roof(18, 22, 48, 49),
    rect(27, 30, 29, 32, 3),
    { tag: 'ellipse', cx: 41, cy: 43, rx: 13, ry: 9 },
    { tag: 'ellipse', cx: 41, cy: 43, rx: 10, ry: 6, fill: 'none' },
    stroke(line('M29 48L41 36L53 48'), 1.2),
    circle(41, 36, 2),
    stroke(line('M41 51v8M34 59h14'), 1.8),
    ...fan(78, 36),
    ...fan(78, 60),
    ...roof(40, 80, 20, 16),
    line('M44 85h12M44 90h12'),
  ]),
};

const buildingCategories = {
  'settlement-living': [
    'colonyHabitat',
    'colonySmallResidence',
    'colonyDenseResidence',
    'colonyAdministration',
    'colonyMarket',
  ],
  'settlement-care': [
    'colonyLaboratory',
    'colonyClinic',
    'colonyHospital',
    'colonySecurity',
    'colonyControl',
    'colonyComms',
  ],
  'settlement-services': [
    'colonyGreenhouse',
    'colonyHydroponics',
    'colonyWaterPlant',
    'colonySubstation',
  ],
};
export const settlementAssets = Object.fromEntries(
  Object.entries(buildings).map(([id, asset]) => [
    id,
    {
      ...asset,
      category:
        Object.entries(buildingCategories).find(([, ids]) => ids.includes(id))?.[0] || 'settlement',
    },
  ]),
);
