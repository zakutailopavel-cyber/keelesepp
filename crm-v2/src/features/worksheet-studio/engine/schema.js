// KeeleSepp worksheet document — schema "keelesepp.worksheet/2" (draft).
// A document is page meta + an ordered list of blocks. Layout, colours and typography are NOT stored per
// document: they come from the fixed design system, so every sheet keeps the house style.

export const SCHEMA = 'keelesepp.worksheet/2';

// Fixed palette: authors choose a tone, never a free colour.
export const TONES = {
  blue: { card: '#edf5fd', badge: '#173a63', label: 'Sinine' },
  green: { card: '#ecf6e9', badge: '#2f7d4c', label: 'Roheline' },
  peach: { card: '#fcf3e4', badge: '#7f582a', label: 'Virsik' },
  cream: { card: '#fdf8ee', badge: '#7f582a', label: 'Kreem' },
  sky: { card: '#eaf4fc', badge: '#173a63', label: 'Taevas' },
  white: { card: '#ffffff', badge: '#173a63', label: 'Valge' },
};
export const TONE_ORDER = ['blue', 'green', 'peach', 'sky', 'cream', 'white'];

// Image slots have fixed aspect ratios so any uploaded photo fits the layout.
export const ASPECTS = { '4:3': 4 / 3, '3:2': 3 / 2, '1:1': 1, '16:9': 16 / 9, '3:4': 3 / 4 };

let counter = 0;
export const newId = (prefix = 'b') => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

export function newDocument() {
  return {
    schema: SCHEMA,
    id: newId('ws'),
    meta: {
      title: 'Uus tööleht',
      subtitle: '',
      level: 'A2',
      module: '',
      canDo: '',
      badge: 'Iga päev on uus võimalus rääkida eesti keeles!',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
      goals: {},
    },
    blocks: [],
  };
}

// Normalised, deterministic answer comparison for Estonian.
export const norm = (s) =>
  String(s ?? '')
    .toLocaleLowerCase('et-EE')
    .replace(/[.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const splitList = (s) =>
  String(s || '')
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
