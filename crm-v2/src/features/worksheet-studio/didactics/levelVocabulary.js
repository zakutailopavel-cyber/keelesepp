// The EKI level vocabularies A1–C1 (etLex, Sõnaveeb „Õpetaja tööriistad”, CC BY) as word forms (Vabamorf), built by
// tools/lexicon/build_level_forms.py into one file per level. Only the levels up to a sheet's level are loaded
// (A2: ≈115 kB gz, C1: ≈745 kB gz), once per session.
export const FORM_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LOADERS = {
  A1: () => import('./levelForms.A1.json'),
  A2: () => import('./levelForms.A2.json'),
  B1: () => import('./levelForms.B1.json'),
  B2: () => import('./levelForms.B2.json'),
  C1: () => import('./levelForms.C1.json'),
};
const cache = {};
const loadOne = (level) => {
  if (!cache[level]) cache[level] = LOADERS[level]().then((mod) => new Set(String((mod.default || mod).forms || '').split('\n'))).catch(() => null);
  return cache[level];
};
// the profile key of a sheet (levels.js levelKey) → the vocabulary levels it may use
export const VOCABULARY_FOR = { A1: ['A1'], A2: ['A1', 'A2'], 'A2+': ['A1', 'A2'], 'B1-': ['A1', 'A2', 'B1'], B1: ['A1', 'A2', 'B1'], 'B1+': ['A1', 'A2', 'B1'], 'B2-': ['A1', 'A2', 'B1', 'B2'], B2: ['A1', 'A2', 'B1', 'B2'], C1: FORM_LEVELS };

// { A1: Set, A2: Set, … } for the given levels (missing ones are left out); null when nothing could be loaded
export async function loadLevelForms(levels = FORM_LEVELS) {
  const sets = await Promise.all(levels.map(loadOne));
  const forms = Object.fromEntries(levels.map((level, i) => [level, sets[i]]).filter(([, set]) => set));
  return Object.keys(forms).length ? forms : null;
}

// the level a word (any form) first appears on, among the loaded levels; a compound of two known parts counts as its
// harder part („keskkonnasõbralik” = keskkonna + sõbralik); null = not in the loaded lists
export function wordLevel(word, forms) {
  const w = String(word || '').toLocaleLowerCase('et');
  if (!forms || !w) return null;
  const order = FORM_LEVELS.filter((level) => forms[level]);
  const direct = order.find((level) => forms[level].has(w));
  if (direct) return direct;
  // a -mine noun in any form counts as its verb („raiskamisest” → raiskama), the lists keep only the verb
  const mine = /^(.{2,})mi(ne|se|st|sel|sele|selt|ses|sesse|sest|seks|seni|sena|seta|sega|sed|ste|si|sid|sile|sil|silt|sis|sisse|sist|siks)$/.exec(w);
  if (mine) { const verb = order.find((level) => forms[level].has(`${mine[1]}ma`)); if (verb) return verb; }
  for (let i = 3; i <= w.length - 3; i += 1) {
    const a = order.findIndex((level) => forms[level].has(w.slice(0, i)));
    const b = order.findIndex((level) => forms[level].has(w.slice(i)));
    if (a >= 0 && b >= 0) return order[Math.max(a, b)];
  }
  return null;
}
