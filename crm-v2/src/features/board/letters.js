// „õ ä ö ü” (owner 2026-11-04): a small bar over the field being typed in on the lesson board (a worksheet answer, a
// board text) puts the Estonian letters at the caret — a phone or a Russian / English keyboard has no õ. Pure helpers;
// the bar is LetterBar.jsx.

export const LETTERS = Object.freeze(['õ', 'ä', 'ö', 'ü', 'š', 'ž']);
export const upper = (letter, on) => (on ? letter.toLocaleUpperCase('et') : letter);

// text fields the letters go into (not numbers, dates, checkboxes…)
const TEXT_TYPES = new Set(['', 'text', 'search']);
export function isLetterField(el) {
  if (!el || el.disabled || el.readOnly) return false;
  const tag = String(el.tagName || '').toLowerCase();
  if (tag === 'textarea') return true;
  if (tag === 'input') return TEXT_TYPES.has(String(el.getAttribute?.('type') || '').toLowerCase());
  return el.isContentEditable === true || ['true', 'plaintext-only'].includes(el.getAttribute?.('contenteditable'));
}

// the value with `text` in place of start…end, cut to maxLength; the caret goes after the inserted text
export function spliceText(value = '', start = null, end = null, text = '', maxLength = -1) {
  const current = String(value ?? '');
  const from = Math.max(0, Math.min(Number.isInteger(start) ? start : current.length, current.length));
  const to = Math.max(from, Math.min(Number.isInteger(end) ? end : from, current.length));
  const room = maxLength >= 0 ? Math.max(0, maxLength - (current.length - (to - from))) : Infinity;
  const insert = String(text).slice(0, room);
  return { value: current.slice(0, from) + insert + current.slice(to), caret: from + insert.length, inserted: insert.length > 0 };
}

// React keeps its own copy of an input's value: the value is set through the prototype's setter and an `input` event
// follows, so a controlled field's onChange sees the new text exactly as if it was typed
function setNativeValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value); else el.value = value;
}

export function insertLetter(el, letter, doc = el?.ownerDocument || globalThis.document) {
  if (!el || !letter) return false;
  const tag = String(el.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') {
    const max = typeof el.maxLength === 'number' ? el.maxLength : -1;
    const next = spliceText(el.value, el.selectionStart, el.selectionEnd, letter, max);
    if (!next.inserted) return false;
    setNativeValue(el, next.value);
    try { el.setSelectionRange(next.caret, next.caret); } catch { /* a field without a caret */ }
    el.dispatchEvent(new (doc.defaultView?.InputEvent || globalThis.InputEvent || globalThis.Event)('input', { bubbles: true, inputType: 'insertText', data: letter }));
    return true;
  }
  // contenteditable (the board's rich text): the browser's own insert keeps the undo and fires `input`
  if (el.focus && doc.activeElement !== el) el.focus();
  try { if (doc.execCommand?.('insertText', false, letter)) return true; } catch { /* not supported: below */ }
  const selection = doc.getSelection?.();
  if (!selection || !selection.rangeCount || !el.contains(selection.anchorNode)) return false;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = doc.createTextNode(letter);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  el.dispatchEvent(new (doc.defaultView?.InputEvent || globalThis.InputEvent || globalThis.Event)('input', { bubbles: true, inputType: 'insertText', data: letter }));
  return true;
}

// Where the bar goes: under the field, else over it, left edges together, always on screen.
// field, bounds: { left, top, right, bottom } screen px; size: { w, h }.
export function barSpot({ field, size, bounds, gap = 6, margin = 6 }) {
  const maxLeft = bounds.right - margin - size.w;
  const left = Math.round(Math.max(bounds.left + margin, Math.min(field.left, maxLeft)));
  const below = field.bottom + gap;
  const above = field.top - gap - size.h;
  if (below + size.h <= bounds.bottom - margin) return { left, top: Math.round(below), side: 'below' };
  if (above >= bounds.top + margin) return { left, top: Math.round(above), side: 'above' };
  // a tall field (or the keyboard took the screen): inside the screen's bottom edge
  return { left, top: Math.round(Math.max(bounds.top + margin, bounds.bottom - margin - size.h)), side: 'inside' };
}

// what the bar is placed beside: a field inside a small dialog (the bookmark sheet, `data-letters-box`) → the whole
// dialog, so the bar (or the folded „õ”) never lies over the dialog's own buttons (owner 2026-11-09 screenshot)
export function letterBox(field) {
  return field?.closest?.('[data-letters-box]') || field;
}

// the teacher can fold the bar on this device (remembered; a private window forgets)
const HIDDEN_KEY = 'keelesepp.letterBar.hidden';
export function lettersHidden(storage = globalThis.localStorage) {
  try { return storage?.getItem?.(HIDDEN_KEY) === '1'; } catch { return false; }
}
export function rememberLettersHidden(hidden, storage = globalThis.localStorage) {
  try { if (hidden) storage?.setItem?.(HIDDEN_KEY, '1'); else storage?.removeItem?.(HIDDEN_KEY); } catch { /* not kept */ }
}
