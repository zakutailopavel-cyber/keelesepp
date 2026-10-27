// Vocabulary pictures for the children's groups (people, animals, food, clothes, toys, school, home, weather, body):
// the same line art and region format as kidsPictures.js, so every word picture can also be coloured. viewBox 0 0 300 300.
const P = (d) => ['p', d];
const eye = (x, y, r = 3) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const VOCAB_PICTURES = {
  mother: {
    label: 'Ema', words: ['ema'],
    regions: [
      { name: 'kleit', at: [150, 230], shapes: [P('M112 160 L188 160 L215 285 L85 285 Z')] },
      { name: 'juuksed', at: [150, 40], shapes: [P('M98 100 C90 40 210 40 202 100 L212 175 L190 175 L186 110 L114 110 L110 175 L88 175 Z')] },
      { name: 'nägu', at: [150, 112], shapes: [['c', 150, 106, 38]] },
    ],
    lines: [eye(136, 100), eye(164, 100), 'M138 122 C145 130 155 130 162 122'],
  },
  father: {
    label: 'Isa', words: ['isa'],
    regions: [
      { name: 'särk', at: [150, 220], shapes: [P('M100 160 L200 160 L222 285 L78 285 Z')] },
      { name: 'nägu', at: [150, 118], shapes: [['c', 150, 110, 40]] },
      { name: 'juuksed', at: [150, 54], shapes: [P('M108 100 C104 50 196 50 192 100 C175 80 125 80 108 100 Z')] },
    ],
    lines: [eye(136, 106), eye(164, 106), 'M134 128 C145 138 155 138 166 128'],
  },
  girl: {
    label: 'Tüdruk', words: ['tüdruk', 'õde'],
    regions: [
      { name: 'kleit', at: [150, 235], shapes: [P('M120 175 L180 175 L205 280 L95 280 Z')] },
      { name: 'patsid', at: [88, 140], shapes: [['e', 92, 140, 14, 26], ['e', 208, 140, 14, 26]] },
      { name: 'nägu', at: [150, 136], shapes: [['c', 150, 128, 36]] },
      { name: 'juuksed', at: [150, 70], shapes: [P('M108 120 C100 60 200 60 192 120 C175 98 125 98 108 120 Z')] },
    ],
    lines: [eye(137, 128), eye(163, 128), 'M140 144 C146 150 154 150 160 144'],
  },
  boy: {
    label: 'Poiss', words: ['poiss', 'vend'],
    regions: [
      { name: 'särk', at: [150, 235], shapes: [P('M112 175 L188 175 L198 280 L102 280 Z')] },
      { name: 'nägu', at: [150, 140], shapes: [['c', 150, 132, 36]] },
      { name: 'müts', at: [150, 74], shapes: [P('M110 116 C108 64 192 64 190 116 Z'), P('M186 110 L232 116 L190 120 Z')] },
    ],
    lines: [eye(137, 132), eye(163, 132), 'M138 148 C146 156 154 156 162 148'],
  },
  grandmother: {
    label: 'Vanaema', words: ['vanaema'],
    regions: [
      { name: 'kampsun', at: [150, 235], shapes: [P('M105 170 L195 170 L220 285 L80 285 Z')] },
      { name: 'rätik', at: [150, 54], shapes: [P('M100 120 C95 40 205 40 200 120 L215 165 L85 165 Z')] },
      { name: 'nägu', at: [150, 120], shapes: [['c', 150, 115, 36]] },
    ],
    lines: [eye(130, 112, 9), eye(170, 112, 9), 'M139 112 L161 112', 'M138 134 C145 140 155 140 162 134'],
  },
  grandfather: {
    label: 'Vanaisa', words: ['vanaisa'],
    regions: [
      { name: 'jakk', at: [150, 240], shapes: [P('M100 175 L200 175 L222 285 L78 285 Z')] },
      { name: 'nägu', at: [118, 118], shapes: [['c', 150, 118, 36]] },
      { name: 'habe', at: [150, 160], shapes: [P('M116 128 C120 182 180 182 184 128 C170 150 130 150 116 128 Z')] },
      { name: 'kübar', at: [150, 50], shapes: [['r', 112, 34, 76, 40, 6], ['r', 92, 70, 116, 12, 4]] },
    ],
    lines: [eye(138, 112), eye(162, 112), 'M150 175 L150 285'],
  },
  baby: {
    label: 'Beebi', words: ['beebi'],
    regions: [
      { name: 'tekk', at: [150, 228], shapes: [P('M80 190 C80 150 220 150 220 190 L210 270 L90 270 Z')] },
      { name: 'nägu', at: [150, 100], shapes: [['c', 150, 120, 50]] },
      { name: 'lutt', at: [150, 146], shapes: [['c', 150, 146, 10]] },
    ],
    lines: ['M132 112 C136 106 142 106 146 112', 'M154 112 C158 106 164 106 168 112', 'M150 70 C140 60 150 50 158 58'],
  },
  dog: {
    label: 'Koer', words: ['koer'],
    regions: [
      { name: 'keha', at: [150, 236], shapes: [['e', 150, 228, 66, 52]] },
      { name: 'pea', at: [150, 84], shapes: [['e', 150, 112, 52, 50]] },
      { name: 'kõrvad', at: [84, 108], shapes: [P('M100 70 C70 70 66 120 84 140 C96 130 104 104 108 82 Z'), P('M200 70 C230 70 234 120 216 140 C204 130 196 104 192 82 Z')] },
      { name: 'nina', at: [150, 128], shapes: [['e', 150, 128, 12, 9]] },
    ],
    lines: [eye(132, 104, 4), eye(168, 104, 4), 'M150 137 L150 146 M138 150 C145 156 155 156 162 150', 'M214 220 C240 210 248 190 240 176'],
  },
  pig: {
    label: 'Siga', words: ['siga', 'põrsas'],
    regions: [
      { name: 'siga', at: [160, 200], shapes: [P('M70 210 L70 270 L95 270 L95 230 Z'), P('M205 225 L205 270 L230 270 L228 220 Z'), ['e', 160, 190, 100, 70]] },
      { name: 'kõrv', at: [98, 128], shapes: [P('M84 140 L94 100 L122 128 Z')] },
      { name: 'kärss', at: [60, 188], shapes: [['e', 60, 188, 20, 24]] },
    ],
    lines: [eye(54, 182, 2), eye(66, 182, 2), eye(100, 165, 4), 'M258 180 C276 170 270 156 262 160 C254 164 266 150 276 158'],
  },
  hen: {
    label: 'Kana', words: ['kana'],
    regions: [
      { name: 'jalad', at: [150, 270], shapes: [['r', 128, 234, 6, 40, 2], ['r', 166, 234, 6, 40, 2]] },
      { name: 'kana', at: [170, 196], shapes: [P('M70 120 C70 80 120 76 126 120 C150 140 220 120 250 90 C260 170 220 240 150 240 C90 240 60 190 70 120 Z')] },
      { name: 'hari', at: [96, 72], shapes: [P('M80 86 C78 66 92 62 96 74 C100 60 116 62 112 80 Z')] },
      { name: 'nokk', at: [56, 112], shapes: [P('M70 104 L46 112 L70 120 Z')] },
    ],
    lines: [eye(96, 104, 4), 'M140 170 C160 200 200 200 220 170'],
  },
  rabbit: {
    label: 'Jänes', words: ['jänes'],
    regions: [
      { name: 'kõrvad', at: [128, 50], shapes: [['e', 128, 64, 16, 48], ['e', 172, 64, 16, 48]] },
      { name: 'jänes', at: [150, 236], shapes: [['e', 150, 230, 62, 54], ['c', 150, 132, 44]] },
      { name: 'saba', at: [214, 244], shapes: [['c', 214, 244, 14]] },
    ],
    lines: [eye(135, 126), eye(165, 126), 'M144 142 L150 148 L156 142', 'M120 150 L96 146 M180 150 L204 146'],
  },
  bear: {
    label: 'Karu', words: ['karu', 'kaisukaru'],
    regions: [
      { name: 'kõrvad', at: [100, 60], shapes: [['c', 100, 60, 20], ['c', 200, 60, 20]] },
      { name: 'karu', at: [96, 210], shapes: [['e', 150, 228, 72, 60], ['c', 150, 104, 54]] },
      { name: 'kõht', at: [150, 236], shapes: [['e', 150, 236, 36, 34]] },
      { name: 'koon', at: [150, 124], shapes: [['e', 150, 124, 20, 15]] },
    ],
    lines: [eye(130, 96, 4), eye(170, 96, 4), 'M144 118 L156 118 L150 126 Z'],
  },
  mouse: {
    label: 'Hiir', words: ['hiir'],
    regions: [
      { name: 'saba', at: [270, 250], shapes: [P('M248 226 C280 230 290 260 270 270 L266 262 C280 254 274 240 248 236 Z')] },
      { name: 'kõrvad', at: [104, 98], shapes: [['c', 104, 104, 26], ['c', 160, 92, 26]] },
      { name: 'hiir', at: [170, 196], shapes: [P('M70 200 C70 140 120 110 170 120 C230 130 260 180 250 230 L80 230 C72 222 70 212 70 200 Z')] },
    ],
    lines: [eye(108, 168, 4), eye(72, 196, 5), 'M80 186 L50 176 M80 196 L48 198'],
  },
  bird: {
    label: 'Lind', words: ['lind'],
    regions: [
      { name: 'lind', at: [110, 180], shapes: [P('M80 150 C80 100 140 80 175 110 C210 130 250 120 270 100 C265 170 220 210 150 210 C100 210 80 185 80 150 Z')] },
      { name: 'tiib', at: [170, 156], shapes: [P('M130 150 C150 120 200 130 210 150 C190 175 150 175 130 150 Z')] },
      { name: 'nokk', at: [62, 138], shapes: [P('M84 128 L56 138 L84 146 Z')] },
    ],
    lines: [eye(108, 128, 4), 'M140 210 L132 250 M170 208 L178 250', 'M40 255 L260 255'],
  },
  banana: {
    label: 'Banaan', words: ['banaan'],
    regions: [{ name: 'banaan', at: [150, 200], shapes: [P('M60 110 C60 220 180 270 250 200 C260 190 255 180 245 185 C180 225 100 190 84 110 C82 96 62 96 60 110 Z')] }],
    lines: ['M60 110 L52 92 L68 92 L72 106'],
  },
  bread: {
    label: 'Leib', words: ['leib', 'sai'],
    regions: [
      { name: 'leib', at: [150, 190], shapes: [P('M50 160 C50 110 250 110 250 160 L250 240 L50 240 Z')] },
      { name: 'viil', at: [150, 266], shapes: [['r', 90, 248, 120, 34, 10]] },
    ],
    lines: ['M100 150 L120 130 M150 150 L170 130 M200 150 L220 130'],
  },
  milk: {
    label: 'Piim', words: ['piim'],
    regions: [
      { name: 'pakk', at: [150, 256], shapes: [P('M90 110 L210 110 L210 280 L90 280 Z')] },
      { name: 'katus', at: [150, 86], shapes: [P('M90 110 L120 60 L180 60 L210 110 Z')] },
      { name: 'silt', at: [150, 196], shapes: [['r', 110, 160, 80, 70, 8]] },
    ],
    lines: ['M120 60 L120 44 L180 44 L180 60'],
  },
  cheese: {
    label: 'Juust', words: ['juust'],
    regions: [{ name: 'juust', at: [140, 230], shapes: [P('M40 200 L240 110 L260 200 L260 250 L40 250 Z')] }],
    lines: ['M40 200 L260 200', eye(100, 225, 10), eye(190, 170, 12), eye(214, 228, 7)],
  },
  carrot: {
    label: 'Porgand', words: ['porgand'],
    regions: [
      { name: 'porgand', at: [140, 180], shapes: [P('M110 110 C150 90 200 110 200 130 L110 280 C100 250 96 140 110 110 Z')] },
      { name: 'lehed', at: [196, 70], shapes: [P('M160 110 C150 70 160 40 175 30 C178 60 176 90 170 108 Z'), P('M175 112 C190 80 220 60 245 62 C230 90 205 110 182 118 Z')] },
    ],
    lines: ['M130 150 L150 150 M125 190 L142 190 M120 230 L134 230'],
  },
  strawberry: {
    label: 'Maasikas', words: ['maasikas'],
    regions: [
      { name: 'maasikas', at: [150, 180], shapes: [P('M70 120 C70 100 230 100 230 120 C230 200 180 260 150 270 C120 260 70 200 70 120 Z')] },
      { name: 'lehed', at: [150, 94], shapes: [P('M100 112 L130 80 L150 104 L170 80 L200 112 Z')] },
    ],
    lines: ['M110 150 l2 6 M190 150 l2 6 M125 200 l2 6 M175 200 l2 6 M150 236 l2 6'],
  },
  egg: {
    label: 'Muna', words: ['muna'],
    regions: [{ name: 'muna', at: [150, 170], shapes: [P('M150 50 C210 50 240 150 240 190 C240 250 200 280 150 280 C100 280 60 250 60 190 C60 150 90 50 150 50 Z')] }],
    lines: [],
  },
  cookie: {
    label: 'Küpsis', words: ['küpsis'],
    regions: [{ name: 'küpsis', at: [150, 236], shapes: [['c', 150, 150, 100]] }],
    lines: [eye(110, 110, 9), eye(180, 120, 9), eye(140, 170, 9), eye(200, 190, 9), eye(110, 200, 9)],
  },
  pear: {
    label: 'Pirn', words: ['pirn'],
    regions: [
      { name: 'pirn', at: [150, 210], shapes: [P('M150 70 C180 70 185 110 190 140 C240 170 250 270 150 275 C50 270 60 170 110 140 C115 110 120 70 150 70 Z')] },
      { name: 'leht', at: [190, 52], shapes: [P('M156 66 C170 40 205 36 220 46 C206 70 180 74 156 66 Z')] },
    ],
    lines: ['M150 72 L146 46'],
  },
  trousers: {
    label: 'Püksid', words: ['püksid'],
    regions: [{ name: 'püksid', at: [110, 200], shapes: [P('M90 50 L210 50 L230 280 L165 280 L150 130 L135 280 L70 280 Z')] }],
    lines: ['M90 72 L210 72', 'M150 72 L150 130'],
  },
  hat: {
    label: 'Müts', words: ['müts'],
    regions: [
      { name: 'müts', at: [150, 168], shapes: [P('M70 210 C70 110 230 110 230 210 Z')] },
      { name: 'äär', at: [150, 224], shapes: [['r', 60, 206, 180, 36, 12]] },
      { name: 'tutt', at: [150, 100], shapes: [['c', 150, 100, 22]] },
    ],
    lines: [],
  },
  mittens: {
    label: 'Kindad', words: ['kindad', 'kinnas'],
    regions: [
      { name: 'kinnas 1', at: [92, 150], shapes: [P('M60 230 L60 120 C60 80 120 80 120 120 L120 150 C140 130 155 150 140 170 L120 200 L120 230 Z')] },
      { name: 'kinnas 2', at: [208, 150], shapes: [P('M240 230 L240 120 C240 80 180 80 180 120 L180 150 C160 130 145 150 160 170 L180 200 L180 230 Z')] },
    ],
    lines: ['M60 212 L120 212', 'M180 212 L240 212'],
  },
  boots: {
    label: 'Saapad', words: ['saapad', 'saabas'],
    regions: [
      { name: 'saabas 1', at: [80, 160], shapes: [P('M50 80 L110 80 L110 210 L150 230 L150 260 L50 260 Z')] },
      { name: 'saabas 2', at: [196, 160], shapes: [P('M166 80 L226 80 L226 210 L266 230 L266 260 L166 260 Z')] },
    ],
    lines: ['M50 244 L150 244', 'M166 244 L266 244'],
  },
  dress: {
    label: 'Kleit', words: ['kleit'],
    regions: [{ name: 'kleit', at: [150, 220], shapes: [P('M120 50 L180 50 L190 110 L250 280 L50 280 L110 110 Z')] }],
    lines: ['M110 110 L190 110', 'M120 50 C135 70 165 70 180 50'],
  },
  sock: {
    label: 'Sokk', words: ['sokk', 'sokid'],
    regions: [
      { name: 'sokk', at: [134, 160], shapes: [P('M100 50 L170 50 L170 190 L230 230 C250 245 240 280 210 275 L120 250 C100 245 100 230 100 210 Z')] },
      { name: 'triibud', at: [135, 70], shapes: [['r', 100, 60, 70, 18, 0], ['r', 100, 96, 70, 18, 0]] },
    ],
    lines: [],
  },
  jacket: {
    label: 'Jope', words: ['jope'],
    regions: [{ name: 'jope', at: [110, 200], shapes: [P('M110 50 L190 50 L260 90 L250 280 L50 280 L40 90 Z')] }],
    lines: ['M150 70 L150 280', 'M110 50 L150 90 L190 50', eye(164, 130, 4), eye(164, 180, 4)],
  },
  doll: {
    label: 'Nukk', words: ['nukk'],
    regions: [
      { name: 'juuksed', at: [104, 140], shapes: [P('M100 110 C90 40 210 40 200 110 L200 150 L100 150 Z')] },
      { name: 'kleit', at: [150, 230], shapes: [P('M125 140 L175 140 L215 270 L85 270 Z')] },
      { name: 'nägu', at: [150, 108], shapes: [['c', 150, 104, 36]] },
    ],
    lines: [eye(138, 100), eye(162, 100), 'M142 118 C146 122 154 122 158 118', 'M100 180 L70 214 M200 180 L230 214'],
  },
  blocks: {
    label: 'Klotsid', words: ['klotsid', 'klots'],
    regions: [
      { name: 'klots 1', at: [100, 230], shapes: [['r', 50, 180, 100, 100, 8]] },
      { name: 'klots 2', at: [200, 230], shapes: [['r', 150, 180, 100, 100, 8]] },
      { name: 'klots 3', at: [150, 130], shapes: [['r', 100, 80, 100, 100, 8]] },
    ],
    lines: [],
  },
  train: {
    label: 'Rong', words: ['rong'],
    regions: [
      { name: 'vedur', at: [90, 190], shapes: [['r', 40, 150, 110, 80, 6], ['r', 90, 100, 60, 50, 4]] },
      { name: 'vagun', at: [216, 196], shapes: [['r', 166, 160, 100, 70, 6]] },
      { name: 'rattad', at: [70, 246], shapes: [['c', 70, 246, 18], ['c', 125, 246, 18], ['c', 190, 246, 18], ['c', 242, 246, 18]] },
    ],
    lines: ['M150 200 L166 200', 'M56 150 L56 120 L76 120 L76 150', 'M20 266 L285 266'],
  },
  pencil: {
    label: 'Pliiats', words: ['pliiats'],
    regions: [
      { name: 'pliiats', at: [146, 154], shapes: [P('M70 200 L190 80 L220 110 L100 230 Z')] },
      { name: 'kumm', at: [215, 85], shapes: [P('M190 80 L210 60 L240 90 L220 110 Z')] },
      { name: 'ots', at: [72, 228], shapes: [P('M70 200 L100 230 L50 250 Z')] },
    ],
    lines: [],
  },
  book: {
    label: 'Raamat', words: ['raamat'],
    regions: [
      { name: 'kaas', at: [160, 220], shapes: [P('M60 70 L240 70 L240 250 L60 250 Z')] },
      { name: 'silt', at: [150, 145], shapes: [['r', 100, 120, 100, 50, 6]] },
    ],
    lines: ['M80 70 L80 250', 'M240 250 L250 240 L250 60 L240 70'],
  },
  scissors: {
    label: 'Käärid', words: ['käärid'],
    regions: [
      { name: 'terad', at: [200, 110], shapes: [P('M110 205 L240 60 L250 70 L130 215 Z'), P('M150 215 L250 110 L255 125 L165 225 Z')] },
      { name: 'sangad', at: [90, 270], shapes: [['c', 90, 230, 30], ['c', 170, 240, 30]] },
    ],
    lines: [eye(90, 230, 14), eye(170, 240, 14)],
  },
  notebook: {
    label: 'Vihik', words: ['vihik'],
    regions: [
      { name: 'vihik', at: [170, 230], shapes: [['r', 70, 50, 170, 220, 8]] },
      { name: 'silt', at: [160, 110], shapes: [['r', 110, 90, 100, 40, 4]] },
    ],
    lines: ['M90 60 L90 260'],
  },
  clock: {
    label: 'Kell', words: ['kell'],
    regions: [
      { name: 'kellad', at: [80, 64], shapes: [['c', 80, 64, 24], ['c', 220, 64, 24]] },
      { name: 'kell', at: [110, 210], shapes: [['c', 150, 160, 100]] },
    ],
    lines: ['M150 160 L150 100', 'M150 160 L195 160', 'M150 70 L150 80 M240 160 L230 160 M150 250 L150 240 M60 160 L70 160'],
  },
  sun: {
    label: 'Päike', words: ['päike'],
    regions: [{ name: 'päike', at: [150, 150], shapes: [['c', 150, 150, 60]] }],
    lines: ['M150 40 L150 70', 'M150 230 L150 260', 'M40 150 L70 150', 'M230 150 L260 150', 'M72 72 L94 94', 'M206 206 L228 228', 'M72 228 L94 206', 'M206 94 L228 72'],
  },
  rain: {
    label: 'Vihm', words: ['vihm', 'pilv'],
    regions: [
      { name: 'pilv', at: [150, 116], shapes: [P('M70 150 C40 150 40 100 80 100 C85 60 140 50 160 80 C190 50 250 70 240 110 C270 115 270 150 240 150 Z')] },
      { name: 'tilgad', at: [150, 224], shapes: [P('M100 180 C90 200 90 214 100 214 C110 214 110 200 100 180 Z'), P('M150 200 C140 220 140 234 150 234 C160 234 160 220 150 200 Z'), P('M200 180 C190 200 190 214 200 214 C210 214 210 200 200 180 Z'), P('M125 240 C115 260 115 274 125 274 C135 274 135 260 125 240 Z'), P('M180 240 C170 260 170 274 180 274 C190 274 190 260 180 240 Z')] },
    ],
    lines: [],
  },
  snowflake: {
    label: 'Lumehelves', words: ['lumi', 'lumehelves'],
    regions: [{ name: 'süda', at: [150, 150], shapes: [['c', 150, 150, 20]] }],
    lines: ['M150 40 L150 260', 'M55 95 L245 205', 'M55 205 L245 95', 'M150 70 L130 50 M150 70 L170 50', 'M150 230 L130 250 M150 230 L170 250', 'M80 110 L60 120 M80 110 L76 88', 'M220 190 L240 180 M220 190 L224 212', 'M80 190 L76 212 M80 190 L60 180', 'M220 110 L224 88 M220 110 L240 120'],
  },
  child: {
    label: 'Laps (keha)', words: ['pea', 'käsi', 'jalg', 'kõht', 'silm', 'nina', 'suu', 'kõrv'],
    regions: [
      { name: 'käed', at: [70, 150], shapes: [P('M112 116 L70 170 L82 180 L114 140 Z'), P('M188 116 L230 170 L218 180 L186 140 Z')] },
      { name: 'särk', at: [150, 150], shapes: [P('M112 112 L188 112 L196 190 L104 190 Z')] },
      { name: 'püksid', at: [150, 212], shapes: [P('M104 190 L196 190 L192 270 L160 270 L150 220 L140 270 L108 270 Z')] },
      { name: 'kingad', at: [120, 292], shapes: [['e', 120, 278, 22, 10], ['e', 180, 278, 22, 10]] },
      { name: 'pea', at: [196, 44], shapes: [['c', 150, 72, 36]] },
      { name: 'juuksed', at: [150, 32], shapes: [P('M112 64 C110 22 190 22 188 64 C170 50 130 50 112 64 Z')] },
    ],
    lines: [eye(138, 68), eye(162, 68), 'M148 74 L150 82 L152 74', 'M140 90 C146 96 154 96 160 90', 'M114 70 C106 66 106 82 114 80', 'M186 70 C194 66 194 82 186 80', eye(70, 176, 8), eye(230, 176, 8)],
  },
  toothbrush: {
    label: 'Hambahari', words: ['hambahari'],
    regions: [
      { name: 'vars', at: [120, 200], shapes: [P('M60 250 L200 110 L214 124 L74 264 Z')] },
      { name: 'harjased', at: [226, 96], shapes: [P('M196 104 L234 66 L256 88 L218 126 Z')] },
    ],
    lines: [],
  },
  bed: {
    label: 'Voodi', words: ['voodi'],
    regions: [
      { name: 'voodi', at: [150, 214], shapes: [['r', 40, 90, 30, 170, 4], ['r', 230, 150, 30, 110, 4], ['r', 70, 190, 160, 40, 4]] },
      { name: 'tekk', at: [176, 174], shapes: [P('M110 190 C120 150 230 150 230 190 Z')] },
      { name: 'padi', at: [92, 176], shapes: [['e', 92, 176, 22, 14]] },
    ],
    lines: ['M20 262 L280 262'],
  },
  table: {
    label: 'Laud', words: ['laud'],
    regions: [
      { name: 'laud', at: [150, 116], shapes: [['r', 40, 100, 220, 26, 4], ['r', 60, 126, 18, 140, 2], ['r', 222, 126, 18, 140, 2]] },
      { name: 'taldrik', at: [150, 74], shapes: [['e', 150, 92, 40, 8]] },
    ],
    lines: ['M20 266 L280 266'],
  },
  chair: {
    label: 'Tool', words: ['tool'],
    regions: [{ name: 'tool', at: [140, 85], shapes: [['r', 90, 50, 20, 210, 3], ['r', 90, 160, 120, 20, 3], ['r', 190, 180, 20, 80, 3], ['r', 90, 60, 100, 50, 6]] }],
    lines: ['M60 262 L240 262'],
  },
  star: {
    label: 'Täht', words: ['täht'],
    regions: [{ name: 'täht', at: [150, 160], shapes: [P('M150 40 L178 112 L256 116 L196 166 L216 242 L150 200 L84 242 L104 166 L44 116 L122 112 Z')] }],
    lines: [],
  },
  heart: {
    label: 'Süda', words: ['süda'],
    regions: [{ name: 'süda', at: [150, 150], shapes: [P('M150 260 C60 200 40 150 40 110 C40 70 70 50 100 50 C125 50 142 66 150 84 C158 66 175 50 200 50 C230 50 260 70 260 110 C260 150 240 200 150 260 Z')] }],
    lines: [],
  },
};
