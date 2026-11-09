// Open reading answers checked against a model answer (owner 2026-11-04: more lenient).
//
// Both strings come in already normalised (`norm`: lower case, no punctuation, single spaces). The answer is right when
// the KEY words of the model answer are in the learner's answer: stop words do not count, a key word may stand in
// another case or inside a compound, and digits equal number words. Up to 3 key words: all of them; more: at least 70 %.
//
// The rule only ever accepts more than the rule before it (2026-10-27, `legacySameMeaning`: every ≥ 4-letter word with
// the same stem): an answer that rule accepted stays right.

// function words that carry no meaning of the answer (Estonian + English)
export const STOP_WORDS = new Set([
  'ja', 'et', 'on', 'see', 'ka', 'ning', 'kui', 'aga', 'sest', 'mis', 'oli', 'olid', 'ei', 'ta', 'nad', 'ma', 'me',
  'seda', 'selle', 'need', 'siis', 'kuid', 'mida', 'või', 'ehk', 'ega', 'kes', 'kus', 'kas', 'oma', 'olla', 'olema',
  'the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'it', 'that', 'this', 'with', 'for',
]);

// trivial number words (Estonian base forms + common stems, English) → digits
const NUMBER_WORDS = {
  null: '0', zero: '0',
  üks: '1', ühe: '1', one: '1',
  kaks: '2', kahe: '2', two: '2',
  kolm: '3', kolme: '3', three: '3',
  neli: '4', nelja: '4', four: '4',
  viis: '5', viie: '5', five: '5',
  kuus: '6', kuue: '6', six: '6',
  seitse: '7', seitsme: '7', seven: '7',
  kaheksa: '8', eight: '8',
  üheksa: '9', nine: '9',
  kümme: '10', kümne: '10', ten: '10',
};

const isNumber = (word) => /^\d+$/.test(word);
const canon = (word) => NUMBER_WORDS[word] || word;
const fold = (word) => word.replace(/õ/g, 'o').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/š/g, 's').replace(/ž/g, 'z');
const commonPrefix = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i += 1; return i; };

// (one exception: a model answer with a number in digits now needs that number — „kell 8” is no longer right for „kell 7”)

// the 2026-10-27 rule for one word: same stem (≈ 70 % of the word) — kept so nothing it accepted becomes wrong
const stemOf = (word) => word.slice(0, Math.max(3, Math.ceil(word.length * 0.7)));
const legacyWordMatch = (word, other) => other.startsWith(stemOf(word)) || (word.startsWith(stemOf(other)) && other.length >= 3);

export function legacySameMeaning(right, answer) {
  const words = String(right).split(' ').filter((word) => word.length >= 4);
  const given = String(answer).split(' ');
  return words.length > 0 && words.every((word) => given.some((other) => legacyWordMatch(word, other)));
}

// key words of a model answer: no stop words, no 1–3-letter words (they say little), digits always
export function keyWords(right) {
  const words = String(right || '').split(' ').filter(Boolean).filter((word) => !STOP_WORDS.has(word))
    .filter((word) => isNumber(word) || word.length >= 4);
  return [...new Set(words)];
}

// does one key word appear in one word of the answer?
export function wordMatches(key, other) {
  if (key === other) return true;
  // numbers: digits = number words (kaks = 2), and never by stem (2 ≠ 20)
  if (isNumber(canon(key)) && canon(key) === canon(other)) return true;
  if (isNumber(key) || isNumber(other)) return false;
  const given = other;
  if (given.length >= 3 && legacyWordMatch(key, given)) return true;
  // same stem: a long common beginning, or most of the shorter word (case endings: lõuna / lõunat, buss / bussiga)
  const shared = commonPrefix(key, given);
  if (shared >= 5 || (shared >= 4 && shared >= Math.ceil(Math.min(key.length, given.length) * 0.7))) return true;
  // compound: „rannavõrkpalli” holds „võrkpall”, „võrkpalliturniiri” holds „turniir”
  if (key.length >= 4 && given.length > key.length && given.includes(key.length >= 6 ? key.slice(0, Math.max(5, Math.ceil(key.length * 0.8))) : key)) return true;
  // õ/ä/ö/ü typed without the marks: only the whole word or a long common beginning
  const a = fold(key);
  const b = fold(given);
  if (a !== key || b !== given) return a === b || commonPrefix(a, b) >= 5;
  return false;
}

// the model answer (`right`) and the learner's answer, both normalised
export function sameMeaningWords(right, answer) {
  const keys = keyWords(right);
  const given = String(answer || '').split(' ').filter(Boolean);
  const found = keys.filter((key) => given.some((other) => wordMatches(key, other)));
  // a number written in digits is the fact asked for: a different number is wrong (the old rule ignored „7” in „kell 7”)
  if (keys.some((key) => isNumber(key) && !found.includes(key))) return false;
  if (legacySameMeaning(right, answer)) return true;
  if (!keys.length) return false;
  return keys.length <= 3 ? found.length === keys.length : found.length / keys.length >= 0.7;
}
