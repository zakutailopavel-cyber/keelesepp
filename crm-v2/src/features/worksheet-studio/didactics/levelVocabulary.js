// The EKI level vocabularies (A1, A2, B1; Kallas & Koppel 2018, CC BY 4.0) as word forms (Vabamorf), built by
// tools/lexicon/build_level_forms.py. Loaded lazily (≈290 kB gz), only when a sheet is checked.
let loading = null;
export function loadLevelForms() {
  if (!loading) {
    loading = import('./levelForms.json').then((mod) => {
      const levels = (mod.default || mod).levels || {};
      return Object.fromEntries(Object.entries(levels).map(([level, text]) => [level, new Set(String(text).split('\n'))]));
    }).catch(() => null);
  }
  return loading;
}

const ORDER = ['A1', 'A2', 'B1'];
// the level a word (any form) first appears on; a compound of two known parts counts as its harder part
// („keskkonnasõbralik” = keskkonna + sõbralik); null = not in the lists up to B1
export function wordLevel(word, forms) {
  const w = String(word || '').toLocaleLowerCase('et');
  if (!forms || !w) return null;
  const direct = ORDER.find((level) => forms[level]?.has(w));
  if (direct) return direct;
  for (let i = 3; i <= w.length - 3; i += 1) {
    const a = ORDER.findIndex((level) => forms[level]?.has(w.slice(0, i)));
    const b = ORDER.findIndex((level) => forms[level]?.has(w.slice(i)));
    if (a >= 0 && b >= 0) return ORDER[Math.max(a, b)];
  }
  return null;
}
