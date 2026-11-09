// Item types of the practice engine (docs/PRACTICE_ENGINE.md „Item types”). Pure models: an item carries its prompt and
// every right answer from the course; `checkItem` grades a response.
//
//   build      Lauseehitus — tap the word tiles into the right order (all orders the source lists are right)
//   transform  Ütle teisiti — rewrite a sentence by an instruction; typed, or built from tiles on easier steps
//   form       Õige vorm — the right case / verb form in a sentence gap; options from the source, or typed
//   connector  Sidesõna — the right linking word for a gap
//   listen     Kuula ja ehita — a build item heard, not read (only where an Estonian voice exists; lesson.js)
import { compareAnswer, compareOrder, normalizeAnswer } from './compare.js';

export const ITEM_TYPES = ['build', 'transform', 'form', 'connector', 'listen'];

export const TYPE_LABELS = {
  build: { et: 'Pane lause kokku', ru: 'Собери предложение', en: 'Build the sentence' },
  transform: { et: 'Ütle teisiti', ru: 'Перестрой предложение', en: 'Rewrite the sentence' },
  form: { et: 'Vali õige vorm', ru: 'Выбери правильную форму', en: 'Choose the right form' },
  connector: { et: 'Vali sidesõna', ru: 'Выбери союз', en: 'Choose the linking word' },
  listen: { et: 'Kuula ja pane kokku', ru: 'Послушай и собери', en: 'Listen and build' },
};

const EDGE = /^[.,!?;:„”“"«»‚‘’'()[\]…–—-]+|[.,!?;:„”“"«»‚‘’'()[\]…–—-]+$/g;

// the word tiles of a sentence: words without the punctuation around them („aega,” → „aega”); a source line written
// with „ | ” keeps its own chunks („Eile | ärkas | Sofia | kell | pool | kaheksa”)
export function tilesOf(sentence) {
  const s = String(sentence || '').trim();
  const parts = s.includes('|') ? s.split('|') : s.split(/\s+/);
  return parts.map((p) => p.trim().replace(EDGE, '').trim()).filter(Boolean);
}

const bagKey = (tiles) => tiles.map(normalizeAnswer).sort().join(' ');
// the answers that use exactly the same tiles as the first one — the valid orders of one tile set
export function ordersOf(answers) {
  const all = (answers || []).map(tilesOf).filter((t) => t.length);
  if (!all.length) return [];
  const bag = bagKey(all[0]);
  const seen = new Set();
  return all.filter((t) => bagKey(t) === bag).filter((t) => { const k = t.join(' '); if (seen.has(k)) return false; seen.add(k); return true; });
}

// the answer as a sentence on screen (first right answer; a chunked word-order line read with spaces)
export const sentenceOf = (s) => String(s || '').split('|').map((p) => p.trim()).filter(Boolean).join(' ');

// how a learner answers this item: 'tiles' | 'options' | 'type'
export function inputOf(item) {
  if (item.type === 'build' || item.type === 'listen') return 'tiles';
  if (item.type === 'transform') return item.input === 'tiles' && item.orders?.length ? 'tiles' : 'type';
  return item.options?.length ? 'options' : 'type';
}

// the tiles shown for a tile item, in their (stable) mixed order
export function tileSet(item) {
  if (item.type === 'transform') return item.orders?.[0] || [];
  return item.tiles || item.orders?.[0] || [];
}

// response: { tiles: [...] } | { option: '…' } | { text: '…' } → { verdict: 'correct'|'almost'|'wrong', expected, letters }
export function checkItem(item, response = {}) {
  const mode = inputOf(item);
  if (mode === 'tiles') {
    const r = compareOrder(response.tiles || [], item.orders || []);
    return { verdict: r.verdict, expected: item.answers?.[0] ? sentenceOf(item.answers[0]) : (r.expected || []).join(' '), letters: [] };
  }
  if (mode === 'options') {
    const ok = (item.answers || []).some((a) => normalizeAnswer(a) === normalizeAnswer(response.option));
    return { verdict: ok ? 'correct' : 'wrong', expected: item.answers?.[0] || '', letters: [] };
  }
  return compareAnswer(response.text, item.answers || []);
}

// the whole sentence with the right answer in place (for feedback and listening)
export function fullSentence(item) {
  if (item.type === 'form' || item.type === 'connector') return [item.before, item.answers?.[0], item.after].filter((x) => x).join(' ').replace(/\s+([.,!?;:])/g, '$1');
  return sentenceOf(item.answers?.[0] || item.sentence || '');
}
