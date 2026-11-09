// Tolerant answer checking for the practice engine (docs/PRACTICE_ENGINE.md „Answer checking”). Pure.
//
//   correct  the same words after ignoring capital letters, punctuation, quotes and extra spaces
//   almost   the same words once õ/ä/ö/ü/š/ž are read as o/a/o/u/s/z — the learner typed without the Estonian letters;
//            shown with a hint, never full credit
//   wrong    anything else (a wrong ending is a grammar error, so no typo tolerance)

const PUNCT = /[.,!?;:„”“"«»‚‘’'()[\]…]/g;
const DASHES = /\s[–—-]\s|^[–—-]\s|\s[–—-]$/g;

export function normalizeAnswer(value) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(DASHES, ' ')
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('et');
}

const FOLD = { õ: 'o', ä: 'a', ö: 'o', ü: 'u', š: 's', ž: 'z' };
export const foldLetters = (value) => String(value ?? '').replace(/[õäöüšž]/g, (ch) => FOLD[ch]);

// the letters of the expected answer that the learner typed without their marks („tanan” → „tänan”: ä)
function missingMarks(input, expected) {
  const out = new Set();
  const a = [...input];
  const b = [...expected];
  if (a.length !== b.length) return [];
  b.forEach((ch, i) => { if (ch !== a[i] && FOLD[ch]) out.add(ch); });
  return [...out];
}

export const ALMOST_HINT = {
  et: 'Kontrolli täpitähti: õ, ä, ö, ü.',
  ru: 'Проверь буквы с точками: õ, ä, ö, ü.',
  en: 'Check the letters õ, ä, ö, ü.',
};

// accepts: every right answer the source lists. Returns { verdict, expected, letters }.
export function compareAnswer(input, accepts) {
  const list = (Array.isArray(accepts) ? accepts : [accepts]).map((a) => String(a ?? '')).filter((a) => a.trim());
  const given = normalizeAnswer(input);
  if (!given || !list.length) return { verdict: 'wrong', expected: list[0] || '', letters: [] };
  const exact = list.find((a) => normalizeAnswer(a) === given);
  if (exact) return { verdict: 'correct', expected: exact, letters: [] };
  const folded = foldLetters(given);
  const near = list.find((a) => foldLetters(normalizeAnswer(a)) === folded);
  if (near) return { verdict: 'almost', expected: near, letters: missingMarks(given, normalizeAnswer(near)) };
  return { verdict: 'wrong', expected: list[0], letters: [] };
}

// word tiles: the order of the tiles is compared with every valid order the source lists (each a list of tiles)
export function compareOrder(chosen, orders) {
  const key = (tiles) => tiles.map(normalizeAnswer).join(' ');
  const given = key(chosen || []);
  const match = (orders || []).find((order) => key(order) === given);
  return match ? { verdict: 'correct', expected: match } : { verdict: 'wrong', expected: (orders || [])[0] || [] };
}
