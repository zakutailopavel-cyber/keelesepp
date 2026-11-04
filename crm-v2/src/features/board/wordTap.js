// „Puuduta sõna” (owner 2026-11-04): on the lesson board a tap (a double click with a mouse) on a word of the worksheet
// or of a board text shows a small card next to the word: the word, its base form and the translation into the student's
// language, with „Lisa sõnastikku” (the student's own `studentWords`). Pure helpers here; the card is WordTapCard.jsx.
import { checkWord, findDuplicate, rememberedTarget } from '../vocabulary/ownWord.js';
import { anchorVisible, placeFloating } from '../worksheet-studio/engine/floatingNote.js';

// letters (with combining marks); a hyphen or an apostrophe inside a word belongs to it (e-post, O'Neill)
const LETTER = /[\p{L}\p{M}]/u;
const JOINER = /['’-]/;
export const WORD_MAX = 60;

// the word around a character position of a text node: { start, end, word } or null (no letter there)
export function wordAround(text = '', offset = 0) {
  const value = String(text || '');
  const at = Math.max(0, Math.min(Number(offset) || 0, value.length));
  const inWord = (i) => i >= 0 && i < value.length && (LETTER.test(value[i]) || (JOINER.test(value[i]) && LETTER.test(value[i - 1] || '') && LETTER.test(value[i + 1] || '')));
  // the caret may sit just after the last letter (a tap on the word's right half)
  let start = inWord(at) ? at : inWord(at - 1) ? at - 1 : -1;
  if (start < 0) return null;
  let end = start + 1;
  while (start > 0 && inWord(start - 1)) start -= 1;
  while (end < value.length && inWord(end)) end += 1;
  const word = value.slice(start, end);
  return word.length > WORD_MAX || !LETTER.test(word) ? null : { start, end, word };
}

function caretAt(x, y, doc) {
  if (doc?.caretRangeFromPoint) { const range = doc.caretRangeFromPoint(x, y); return range ? { node: range.startContainer, offset: range.startOffset } : null; }
  if (doc?.caretPositionFromPoint) { const pos = doc.caretPositionFromPoint(x, y); return pos ? { node: pos.offsetNode, offset: pos.offset } : null; }
  return null;
}

// The word under a point (a finger has no selection): { word, range, node }. `cover`: elements drawn over the text (the
// board's drawing layer over the worksheet) that are looked through when the first look finds no text.
export function wordRangeAt(x, y, { doc = globalThis.document, cover = [] } = {}) {
  const look = () => {
    const caret = caretAt(x, y, doc);
    if (!caret?.node || caret.node.nodeType !== 3) return null;
    const hit = wordAround(caret.node.textContent || '', caret.offset);
    if (!hit) return null;
    let range = null;
    try { range = doc.createRange(); range.setStart(caret.node, hit.start); range.setEnd(caret.node, hit.end); } catch { range = null; }
    // a point beside the text (the caret snaps to the nearest letter) is not a tap on the word
    const box = range?.getBoundingClientRect?.();
    if (box && box.width > 0 && (x < box.left - 4 || x > box.right + 4 || y < box.top - 4 || y > box.bottom + 4)) return null;
    return { word: hit.word, range, node: caret.node };
  };
  const first = look();
  if (first || !cover.length) return first;
  const saved = cover.map((el) => [el, el.style.pointerEvents]);
  try {
    saved.forEach(([el]) => { el.style.pointerEvents = 'none'; });
    return look();
  } finally {
    saved.forEach(([el, value]) => { el.style.pointerEvents = value; });
  }
}

// what the card follows: the word's range (it moves with the board's pan and zoom), seen as an element by placeFloating
export function rangeAnchor(range, node) {
  return {
    getBoundingClientRect: () => {
      const r = range?.getBoundingClientRect?.();
      return r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    },
    closest: (selector) => (node?.nodeType === 3 ? node.parentElement : node)?.closest?.(selector) || null,
    isConnected: () => Boolean(node?.isConnected),
  };
}

// Where the word card goes: beside the word, else under / over it (placeFloating, as the sheet's floating notes), hidden
// while the word is out of the board's frame.
export const CARD_WIDTH = 260;
export function wordCardSpot({ anchor, clip, bounds, height }) {
  if (!anchor || !anchorVisible(anchor, clip) || !anchorVisible(anchor, bounds)) return { hidden: true, left: 0, top: 0, width: CARD_WIDTH };
  const place = placeFloating({ anchor, size: { w: CARD_WIDTH, h: height || 150 }, bounds, gap: 8 });
  return { hidden: false, left: Math.round(place.left), top: Math.round(place.top), width: Math.round(place.width), side: place.side };
}

// controls and fields: a tap there is for them (answers, word chips, buttons), never a word lookup
export const TAP_SKIP = [
  'input', 'textarea', 'select', 'button', 'a', 'label', '[role="button"]', '[role="gridcell"]', '[role="textbox"]',
  '[contenteditable="true"]', '[contenteditable="plaintext-only"]', '[draggable="true"]',
  '.sb-editor', '.sb-format', '.sb-bookmark', '.sb-letters', '.sb-word-tap', '.ws-float-note', '.ws-word-card', '.sb-selbar',
  '.sb-scrollbar', '.sb-reading-toggle', '.sb-lause-dialog',
].join(', ');

// the tools a word may be looked up with: answering a sheet, selecting, moving the board — never while drawing
export const TAP_TOOLS = new Set(['fill', 'select', 'hand']);

export function stageTool(stage) {
  if (!stage) return '';
  if (stage.classList?.contains('is-reading')) return 'fill';
  const name = [...(stage.classList || [])].find((item) => item.startsWith('tool-'));
  return name ? name.slice(5) : '';
}

const FIELD = 'input, textarea, select, [contenteditable="true"], [contenteditable="plaintext-only"]';
export const isTypingField = (el) => Boolean(el?.matches?.(FIELD));

// Whether a tap / double click on the board is a word lookup. kind 'tap' (finger) or 'dblclick' (mouse).
// staff on a worksheet with „Täida töölehte” keep the sheet's own word tools (Viga / Märkus / Sõna).
export function tapIntent({ target, stage, staff = false, active = null }) {
  if (!target || !stage || !stage.contains?.(target)) return false;
  if (target.closest?.(TAP_SKIP)) return false;
  const tool = stageTool(stage);
  if (!TAP_TOOLS.has(tool)) return false;
  // typing in an answer field: the tap only moves on
  if (active && active !== stage && stage.contains?.(active) && isTypingField(active)) return false;
  const onSheet = Boolean(target.closest?.('.sb-underlay, .sb-reading'));
  if (staff && onSheet && tool === 'fill') return false;
  return true;
}

// a finger's tap: short and still (a drag pans, a long press selects)
export const TAP_MS = 350;
export const TAP_PX = 10;
export function isTap(down, up) {
  if (!down || !up) return false;
  return up.t - down.t <= TAP_MS && Math.hypot(up.x - down.x, up.y - down.y) <= TAP_PX;
}

// the translation language: the student card's preferredLanguage when it is one we translate into, else the language
// chosen in „Lisa oma sõna” on this device, else Russian
const TARGETS = ['ru', 'en', 'uk'];
export function translationTarget(preferred = '', storage = globalThis.localStorage) {
  const value = String(preferred || '').toLowerCase();
  return TARGETS.includes(value) ? value : rememberedTarget(storage);
}

// one lookup per word and language for the whole session (the server also caches; this saves the quota and the wait)
export function createLookupCache(check) {
  const answers = new Map();
  return {
    get(word, tgt) {
      const key = `${tgt}:${String(word || '').toLocaleLowerCase('et')}`;
      if (!answers.has(key)) {
        const pending = Promise.resolve(check(word, tgt)).then((result) => {
          if (result?.error) answers.delete(key);
          return result;
        }, (error) => { answers.delete(key); throw error; });
        answers.set(key, pending);
      }
      return answers.get(key);
    },
    size: () => answers.size,
  };
}

// the server's check (languageApi /own-word: base form + translation, nothing saved) → what the card shows
export async function lookupWord(service, word, tgt) {
  const check = await checkWord(service, { text: word, lang: 'et', tgt });
  const lemma = check.lemma || check.words?.[0]?.lemma || '';
  return {
    word,
    lemma: lemma && lemma.toLocaleLowerCase('et') !== word.toLocaleLowerCase('et') ? lemma : '',
    translation: check.translation,
    status: check.status,
    formsLine: check.formsLine,
    formItems: check.formItems,
    error: check.error,
  };
}

// „Lisa sõnastikku”: the base form goes to the student's words (a word already there — same text or base form — is not
// added twice). The student's own add is marked like „Lisa oma sõna” (source 'student'); the teacher's is a normal
// lesson word. → { already: true, word } | { added: true, word }
export async function addToDictionary(words, { studentId, user, staff = false, card }) {
  if (!studentId || !user?.uid) throw new Error('Õpilane puudub.');
  const word = card.lemma || card.word;
  const existing = typeof words.listForStudent === 'function' ? await words.listForStudent(studentId) : [];
  const duplicate = findDuplicate(existing, card.word, word);
  if (duplicate) return { already: true, word: duplicate };
  const input = { studentId, user, word, translation: card.translation || '', forms: card.formsLine || '', formItems: card.formItems || [] };
  const saved = staff || typeof words.addStudentWord !== 'function'
    ? await words.add(input)
    : await words.addStudentWord({ ...input, checked: card.status || 'unchecked' });
  return { added: true, word: saved };
}
