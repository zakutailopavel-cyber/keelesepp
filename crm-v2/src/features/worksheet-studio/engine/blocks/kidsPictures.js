// Colouring pictures for the children's groups (owner 2026-10-28: „раскраски”): simple line art in the textbook style
// (black outline, white — the child brings the colour). Every picture is a list of regions; a region is one or more
// shapes filled with one colour and carries the place of its number. viewBox 0 0 300 300.
// shape: ['c', cx, cy, r] circle · ['e', cx, cy, rx, ry] ellipse · ['r', x, y, w, h, rx] rect · ['p', d] path
// lines: outlines that are not coloured (strings, rays, faces).

import { VOCAB_PICTURES } from './kidsVocabPictures.js';

const P = (d) => ['p', d];

export const COLORING_PICTURES = {
  apple: {
    label: 'Õun', words: ['õun', 'leht', 'vars'],
    regions: [
      { name: 'õun', at: [150, 190], shapes: [P('M150 95 C105 70 52 100 58 170 C64 240 115 270 150 252 C185 270 236 240 242 170 C248 100 195 70 150 95 Z')] },
      { name: 'leht', at: [196, 62], shapes: [P('M158 82 C170 45 215 35 238 48 C222 82 190 92 158 82 Z')] },
      { name: 'vars', at: [140, 60], shapes: [P('M146 98 C144 80 140 62 132 46 L142 42 C152 60 156 80 156 98 Z')] },
    ],
    lines: [],
  },
  house: {
    label: 'Maja', words: ['maja', 'katus', 'uks', 'aken', 'korsten', 'päike'],
    regions: [
      { name: 'maja', at: [92, 230], shapes: [['r', 60, 140, 180, 130, 0]] },
      { name: 'katus', at: [150, 112], shapes: [P('M40 145 L150 60 L260 145 Z')] },
      { name: 'uks', at: [176, 240], shapes: [['r', 158, 200, 40, 70, 4]] },
      { name: 'aken', at: [104, 186], shapes: [['r', 82, 166, 46, 40, 3]] },
      { name: 'korsten', at: [214, 82], shapes: [['r', 200, 60, 28, 52, 0]] },
      { name: 'päike', at: [48, 42], shapes: [['c', 48, 42, 24]] },
    ],
    lines: ['M105 166 L105 206', 'M82 186 L128 186', 'M150 60 L150 60', 'M20 270 L280 270'],
  },
  fish: {
    label: 'Kala', words: ['kala', 'saba', 'uim', 'mull'],
    regions: [
      { name: 'uim', at: [132, 85], shapes: [P('M100 102 C115 70 160 68 175 102 Z')] },
      { name: 'saba', at: [248, 150], shapes: [P('M215 150 L275 100 L262 150 L275 200 Z')] },
      { name: 'kala', at: [130, 150], shapes: [['e', 135, 150, 85, 55]] },
      { name: 'mull', at: [40, 70], shapes: [['c', 40, 70, 14], ['c', 62, 40, 9], ['c', 30, 30, 6]] },
    ],
    lines: ['M86 140 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', 'M60 168 C70 176 82 176 92 170', 'M150 120 C160 140 160 160 150 180'],
  },
  balloons: {
    label: 'Õhupallid', words: ['õhupall', 'üks', 'kaks', 'kolm'],
    regions: [
      { name: 'õhupall 1', at: [90, 95], shapes: [['e', 90, 95, 42, 52]] },
      { name: 'õhupall 2', at: [160, 75], shapes: [['e', 160, 75, 42, 52]] },
      { name: 'õhupall 3', at: [225, 110], shapes: [['e', 225, 110, 42, 52]] },
    ],
    lines: ['M90 147 C95 190 135 220 150 270', 'M160 127 C150 180 150 230 150 270', 'M225 162 C215 200 170 230 150 270'],
  },
  flower: {
    label: 'Lill', words: ['lill', 'õieleht', 'vars', 'leht'],
    regions: [
      { name: 'õielehed', at: [150, 52], shapes: [['c', 150, 62, 30], ['c', 196, 96, 30], ['c', 178, 150, 30], ['c', 122, 150, 30], ['c', 104, 96, 30]] },
      { name: 'keskkoht', at: [150, 108], shapes: [['c', 150, 106, 26]] },
      { name: 'vars', at: [158, 230], shapes: [['r', 144, 170, 12, 115, 4]] },
      { name: 'lehed', at: [98, 222], shapes: [P('M144 230 C110 200 80 205 70 220 C95 245 125 245 144 230 Z'), P('M156 250 C190 220 220 225 230 240 C205 265 175 265 156 250 Z')] },
    ],
    lines: ['M20 285 L280 285'],
  },
  car: {
    label: 'Auto', words: ['auto', 'ratas', 'aken'],
    regions: [
      { name: 'auto', at: [70, 190], shapes: [P('M30 200 L40 160 L90 150 L120 105 L200 105 L235 150 L270 162 L272 205 Z')] },
      { name: 'aknad', at: [140, 135], shapes: [P('M100 150 L126 116 L156 116 L156 150 Z'), P('M168 150 L168 116 L196 116 L222 150 Z')] },
      { name: 'rattad', at: [88, 212], shapes: [['c', 88, 212, 26], ['c', 218, 212, 26]] },
    ],
    lines: ['M88 212 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0', 'M218 212 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0', 'M15 240 L285 240'],
  },
  cat: {
    label: 'Kass', words: ['kass', 'pea', 'kõrv', 'saba'],
    regions: [
      { name: 'keha', at: [150, 228], shapes: [['e', 150, 225, 70, 60]] },
      { name: 'saba', at: [252, 200], shapes: [P('M215 240 C260 240 275 200 262 160 C255 140 240 150 246 165 C255 195 245 222 212 226 Z')] },
      { name: 'kõrvad', at: [96, 48], shapes: [P('M92 92 L100 30 L135 70 Z'), P('M208 92 L200 30 L165 70 Z')] },
      { name: 'pea', at: [150, 70], shapes: [['c', 150, 105, 62]] },
    ],
    lines: ['M128 98 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', 'M172 98 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0', 'M143 118 L150 126 L157 118 Z', 'M150 126 C146 136 136 138 130 132', 'M150 126 C154 136 164 138 170 132', 'M100 118 L70 112', 'M100 126 L70 130', 'M200 118 L230 112', 'M200 126 L230 130'],
  },
  tree: {
    label: 'Õunapuu', words: ['puu', 'tüvi', 'õun'],
    regions: [
      { name: 'võra', at: [150, 60], shapes: [P('M70 150 C30 140 35 80 80 78 C82 35 140 20 165 50 C195 25 255 45 245 95 C285 110 270 170 225 165 C200 190 110 190 70 150 Z')] },
      { name: 'tüvi', at: [150, 240], shapes: [P('M132 175 L168 175 L172 270 L128 270 Z')] },
      { name: 'õunad', at: [106, 118], shapes: [['c', 106, 118, 13], ['c', 190, 100, 13], ['c', 160, 145, 13], ['c', 222, 140, 13]] },
    ],
    lines: ['M40 272 L260 272'],
  },
  butterfly: {
    label: 'Liblikas', words: ['liblikas', 'tiib'],
    regions: [
      { name: 'ülemised tiivad', at: [88, 92], shapes: [P('M146 140 C110 60 40 40 40 100 C40 150 100 160 146 150 Z'), P('M154 140 C190 60 260 40 260 100 C260 150 200 160 154 150 Z')] },
      { name: 'alumised tiivad', at: [100, 205], shapes: [P('M146 155 C100 160 60 200 85 235 C110 262 140 220 146 170 Z'), P('M154 155 C200 160 240 200 215 235 C190 262 160 220 154 170 Z')] },
      { name: 'keha', at: [150, 248], shapes: [['e', 150, 160, 9, 70]] },
    ],
    lines: ['M146 92 C138 70 130 60 118 54', 'M154 92 C162 70 170 60 182 54', 'M80 100 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0', 'M220 100 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0'],
  },
  backpack: {
    label: 'Seljakott', words: ['seljakott', 'tasku', 'rihm'],
    regions: [
      { name: 'seljakott', at: [100, 120], shapes: [['r', 70, 70, 160, 200, 40]] },
      { name: 'tasku', at: [150, 228], shapes: [['r', 100, 190, 100, 64, 14]] },
      { name: 'rihm', at: [150, 40], shapes: [P('M115 74 C115 30 185 30 185 74 L172 74 C172 46 128 46 128 74 Z')] },
    ],
    lines: ['M100 212 L200 212', 'M100 110 L100 170', 'M200 110 L200 170'],
  },
  shirt: {
    label: 'T-särk', words: ['särk', 'varrukas', 'tasku'],
    regions: [
      { name: 'särk', at: [150, 200], shapes: [P('M100 60 C120 80 180 80 200 60 L270 100 L245 150 L215 135 L215 270 L85 270 L85 135 L55 150 L30 100 Z')] },
      { name: 'tasku', at: [186, 152], shapes: [['r', 168, 130, 36, 40, 6]] },
    ],
    lines: ['M100 60 C120 95 180 95 200 60'],
  },
  umbrella: {
    label: 'Vihmavari', words: ['vihmavari', 'vihm', 'pilv'],
    regions: [
      { name: 'vihmavari', at: [150, 110], shapes: [P('M40 160 C40 80 100 50 150 50 C200 50 260 80 260 160 C240 145 215 145 197 160 C180 145 160 145 150 160 C140 145 120 145 103 160 C85 145 60 145 40 160 Z')] },
      { name: 'käepide', at: [170, 252], shapes: [P('M146 160 L154 160 L154 250 C154 272 128 272 128 252 L136 252 C136 262 146 262 146 250 Z')] },
      { name: 'pilv', at: [60, 28], shapes: [P('M22 40 C10 40 10 20 26 20 C30 6 52 6 56 18 C68 10 84 18 80 32 C92 34 92 48 80 48 L28 48 C18 48 16 40 22 40 Z')] },
    ],
    lines: ['M220 30 L214 46', 'M240 42 L234 58', 'M262 24 L256 40', 'M150 50 L150 160'],
  },
  ball: {
    label: 'Pall', words: ['pall'],
    regions: [
      { name: 'ülemine pool', at: [150, 90], shapes: [P('M60 140 C60 90 100 50 150 50 C200 50 240 90 240 140 Z')] },
      { name: 'vööt', at: [150, 152], shapes: [['r', 60, 140, 180, 24, 0]] },
      { name: 'alumine pool', at: [150, 210], shapes: [P('M60 164 L240 164 C240 214 200 250 150 250 C100 250 60 214 60 164 Z')] },
    ],
    lines: ['M150 50 m0 0'],
  },
  snowman: {
    label: 'Lumememm', words: ['lumememm', 'müts', 'nina', 'sall'],
    regions: [
      { name: 'lumememm', at: [150, 230], shapes: [['c', 150, 225, 60], ['c', 150, 135, 44], ['c', 150, 70, 32]] },
      { name: 'müts', at: [150, 26], shapes: [['r', 122, 12, 56, 30, 4], ['r', 108, 40, 84, 10, 3]] },
      { name: 'nina', at: [184, 76], shapes: [P('M150 74 L190 80 L150 86 Z')] },
      { name: 'sall', at: [118, 106], shapes: [P('M112 98 C135 110 165 110 188 98 L190 112 C165 124 135 124 110 112 Z'), P('M166 112 L182 112 L186 146 L170 146 Z')] },
    ],
    lines: ['M138 62 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', 'M162 62 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', 'M150 130 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', 'M150 150 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', 'M20 285 L280 285'],
  },
  christmastree: {
    label: 'Kuusk', words: ['kuusk', 'täht', 'kuul', 'kingitus'],
    regions: [
      { name: 'kuusk', at: [150, 176], shapes: [P('M150 40 L210 120 L180 120 L235 190 L200 190 L255 255 L45 255 L100 190 L65 190 L120 120 L90 120 Z')] },
      { name: 'täht', at: [150, 24], shapes: [P('M150 8 L156 22 L171 22 L159 31 L164 45 L150 37 L136 45 L141 31 L129 22 L144 22 Z')] },
      { name: 'kuulid', at: [122, 160], shapes: [['c', 122, 160, 9], ['c', 178, 150, 9], ['c', 150, 205, 9], ['c', 98, 228, 9], ['c', 205, 226, 9]] },
      { name: 'kingitus', at: [236, 272], shapes: [['r', 214, 255, 44, 34, 3]] },
    ],
    lines: ['M138 255 L138 285 L162 285 L162 255', 'M236 255 L236 289', 'M214 270 L258 270'],
  },
};

Object.assign(COLORING_PICTURES, VOCAB_PICTURES);

export const PICTURE_OPTIONS = Object.entries(COLORING_PICTURES).map(([value, pic]) => [value, pic.label]);

// the colours a child knows, with the swatch drawn on screen and on paper
export const COLORS = {
  punane: '#e5484d', sinine: '#3b82f6', kollane: '#facc15', roheline: '#22c55e', oranž: '#f97316', lilla: '#a855f7',
  roosa: '#f472b6', pruun: '#92400e', must: '#1f2937', hall: '#9ca3af', valge: '#ffffff', helesinine: '#7dd3fc',
};
export const COLOR_NAMES = Object.keys(COLORS);
