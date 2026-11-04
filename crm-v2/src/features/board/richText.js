// Rich text in board text elements (owner 2026-11-04: select a word or one letter and change its colour, bold, italic,
// underline, highlight, font and size). Backward compatible: `text` always holds the plain text (search, old clients,
// v1 board); `spans` is an optional list of runs whose texts joined are exactly `text`. An element without `spans`, or
// whose spans no longer match its text (an old client edited the text), is shown as plain text in the element's style.
//
// A span: { t: text, b?: true, i?: true, u?: true, c?: '#rrggbb' colour, h?: '#rrggbb' highlight, f?: font key, s?: size }

import { FONTS } from './boardModel.js';

export const MAX_SPANS = 400;
export const STYLE_KEYS = ['b', 'i', 'u', 'c', 'h', 'f', 's'];
export const HIGHLIGHTS = ['#FEF08A', '#BBF7D0', '#FBCFE8', '#BFDBFE'];
const HEX = /^#[0-9a-f]{6}$/i;

function cleanStyle(span = {}) {
  const out = {};
  if (span.b === true) out.b = true;
  if (span.i === true) out.i = true;
  if (span.u === true) out.u = true;
  if (HEX.test(String(span.c || ''))) out.c = String(span.c);
  if (HEX.test(String(span.h || ''))) out.h = String(span.h);
  if (span.f && FONTS[span.f]) out.f = span.f;
  const size = Number(span.s);
  if (Number.isFinite(size) && size >= 8 && size <= 96) out.s = Math.round(size);
  return out;
}
const sameStyle = (a, b) => STYLE_KEYS.every((key) => a[key] === b[key]);
export const hasStyle = (span) => STYLE_KEYS.some((key) => span[key] !== undefined);

// clean values, drop empty runs, merge neighbours with the same style
export function normalizeSpans(spans = []) {
  const out = [];
  for (const raw of Array.isArray(spans) ? spans : []) {
    const t = String(raw?.t ?? '');
    if (!t) continue;
    const span = { t, ...cleanStyle(raw) };
    const last = out[out.length - 1];
    if (last && sameStyle(last, span)) last.t += t;
    else out.push(span);
  }
  return out;
}

export const plainText = (spans = []) => spans.map((span) => span.t).join('');
// any styled run at all: only then are the spans stored
export const isRich = (spans = []) => spans.some(hasStyle);

// the runs of an element: its own spans when they still match its text, otherwise the plain text
export function spansOf(element = {}) {
  const text = String(element.text || '');
  if (Array.isArray(element.spans) && element.spans.length) {
    const spans = normalizeSpans(element.spans);
    if (plainText(spans) === text) return spans;
  }
  return text ? [{ t: text }] : [];
}

// split the runs so that `at` is a boundary
function splitAt(spans, at) {
  const out = [];
  let pos = 0;
  for (const span of spans) {
    const end = pos + span.t.length;
    if (at > pos && at < end) {
      out.push({ ...span, t: span.t.slice(0, at - pos) }, { ...span, t: span.t.slice(at - pos) });
    } else out.push({ ...span });
    pos = end;
  }
  return out;
}

// set (value) or clear (null / false / undefined) style keys on the characters start … end
export function applyStyle(spans, start, end, patch) {
  const from = Math.max(0, Math.min(start, end));
  const to = Math.max(start, end);
  if (to <= from) return normalizeSpans(spans);
  const parts = splitAt(splitAt(normalizeSpans(spans), from), to);
  let pos = 0;
  const next = parts.map((span) => {
    const inside = pos >= from && pos + span.t.length <= to;
    pos += span.t.length;
    if (!inside) return span;
    const styled = { ...span };
    for (const [key, value] of Object.entries(patch)) {
      if (!STYLE_KEYS.includes(key)) continue;
      if (value === null || value === false || value === undefined || value === '') delete styled[key];
      else styled[key] = value;
    }
    return styled;
  });
  return normalizeSpans(next);
}

// the sizes A− / A+ step through
export const FORMAT_SIZES = [10, 12, 14, 16, 18, 22, 26, 32, 40, 48, 64, 80, 96];
export function stepSize(size, direction) {
  const list = direction > 0 ? FORMAT_SIZES.filter((value) => value > size) : FORMAT_SIZES.filter((value) => value < size).reverse();
  return list[0] || size;
}

// what the characters start … end have in common (for the format bar: is the selection bold?)
export function styleAt(spans, start, end) {
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  let pos = 0;
  const covered = [];
  for (const span of normalizeSpans(spans)) {
    const a = pos;
    const b = pos + span.t.length;
    pos = b;
    if (to === from ? (from > a && from <= b) || (from === 0 && a === 0) : b > from && a < to) covered.push(span);
  }
  if (!covered.length) return {};
  return Object.fromEntries(STYLE_KEYS.filter((key) => covered.every((span) => span[key] === covered[0][key]) && covered[0][key] !== undefined).map((key) => [key, covered[0][key]]));
}

// a toggle (bold / italic / underline): on unless every selected character already has it
export function toggleStyle(spans, start, end, key) {
  const on = styleAt(spans, start, end)[key] === true;
  return applyStyle(spans, start, end, { [key]: !on });
}

// the element-wide size or font replaces what single runs had
export const clearKey = (spans, key) => normalizeSpans(spans.map((span) => { const next = { ...span }; delete next[key]; return next; }));

// the text element's fields after editing: `spans` only when something is styled; an element that had spans and lost
// all its styling gets an empty list (the rules allow it; plain text is shown)
export function textPatch(element, spans) {
  const clean = normalizeSpans(spans).slice(0, MAX_SPANS);
  const text = plainText(clean);
  if (isRich(clean)) return { text, spans: clean };
  return Array.isArray(element?.spans) && element.spans.length ? { text, spans: [] } : { text };
}

// CSS of a run, relative to the element (sizes in em, so the editor's zoom and the board render the same)
export function spanCss(span, baseSize = 18) {
  const css = {};
  if (span.b) css.fontWeight = 700;
  if (span.i) css.fontStyle = 'italic';
  if (span.u) css.textDecoration = 'underline';
  if (span.c) css.color = span.c;
  if (span.h) { css.backgroundColor = span.h; css.borderRadius = '2px'; }
  if (span.f) css.fontFamily = FONTS[span.f].css;
  if (span.s) css.fontSize = `${Math.round((span.s / (baseSize || 18)) * 1000) / 1000}em`;
  return css;
}

// ── the editor (contenteditable) ─────────────────────────────────
const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cssText = (css) => Object.entries(css).map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${value}`).join(';');

// the editor's HTML: one <span data-rt="{style}"> per run; a trailing newline gets a <br> so the caret can sit on the
// empty last line
export function spansToHtml(spans, baseSize = 18) {
  const list = normalizeSpans(spans);
  const html = list.map((span) => {
    const style = cleanStyle(span);
    return `<span data-rt="${escapeHtml(JSON.stringify(style))}" style="${escapeHtml(cssText(spanCss(style, baseSize)))}">${escapeHtml(span.t)}</span>`;
  }).join('');
  return plainText(list).endsWith('\n') ? `${html}<br data-rt-end="1">` : html;
}

const BLOCKS = /^(DIV|P|LI)$/;
const styleOfNode = (node, root) => {
  for (let el = node.parentNode; el && el !== root; el = el.parentNode) {
    const raw = el.getAttribute?.('data-rt');
    if (raw) { try { return cleanStyle(JSON.parse(raw)); } catch { return {}; } }
  }
  return {};
};

// the runs in an editor element (or a fragment of it): text nodes take the style of their <span data-rt>; <br> and the
// start of a block (Chrome wraps new lines in <div>) are newlines
export function domToSpans(root) {
  const spans = [];
  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) { if (child.nodeValue) spans.push({ t: child.nodeValue, ...styleOfNode(child, root) }); return; }
      if (child.nodeType !== 1) return;
      if (child.tagName === 'BR') {
        // the end marker, and the placeholder <br> closing a block line (the block already started the line), are no text
        const closesBlock = node !== root && BLOCKS.test(node.tagName) && child === node.lastChild;
        if (!child.hasAttribute('data-rt-end') && !closesBlock) spans.push({ t: '\n', ...styleOfNode(child, root) });
        return;
      }
      const text = plainText(spans);
      if (BLOCKS.test(child.tagName) && text && !text.endsWith('\n')) spans.push({ t: '\n' });
      walk(child);
    });
  };
  walk(root);
  // a lone <br> Chrome leaves in an emptied editor is not a line
  const out = normalizeSpans(spans);
  return plainText(out) === '\n' ? [] : out;
}

// caret / selection as character offsets in the editor's text (null when it is not inside)
export function selectionOffsets(root, selection = globalThis.getSelection?.()) {
  if (!root || !selection || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const offsetOf = (node, offset) => {
    const before = root.ownerDocument.createRange();
    before.selectNodeContents(root);
    before.setEnd(node, offset);
    return plainText(domToSpans(before.cloneContents())).length;
  };
  return { start: offsetOf(range.startContainer, range.startOffset), end: offsetOf(range.endContainer, range.endOffset) };
}

// put the selection back at character offsets (after the editor's HTML was rebuilt)
export function setSelectionOffsets(root, start, end, selection = globalThis.getSelection?.()) {
  if (!root || !selection) return;
  const find = (target) => {
    let pos = 0;
    const walker = root.ownerDocument.createTreeWalker(root, 1 | 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeType === 3) {
        const len = node.nodeValue.length;
        if (target <= pos + len) return [node, target - pos];
        pos += len;
      } else if (node.tagName === 'BR' && !node.hasAttribute('data-rt-end')) {
        if (target <= pos) return [node.parentNode, [...node.parentNode.childNodes].indexOf(node)];
        pos += 1;
      }
    }
    return [root, root.childNodes.length];
  };
  const range = root.ownerDocument.createRange();
  const [startNode, startOffset] = find(start);
  const [endNode, endOffset] = find(end);
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);
}

// insert plain text (typing a newline, pasting) at the selection: it takes the style of the replaced characters, else
// of the character before it, else of the one after it
export function insertText(spans, start, end, value) {
  const from = Math.max(0, Math.min(start, end));
  const to = Math.max(start, end);
  const parts = splitAt(splitAt(normalizeSpans(spans), from), to);
  const before = [];
  const after = [];
  let pos = 0;
  let previous = null;
  let replaced = null;
  for (const span of parts) {
    const a = pos;
    pos += span.t.length;
    if (pos <= from) { before.push(span); previous = cleanStyle(span); } else if (a >= to) after.push(span);
    else if (!replaced) replaced = cleanStyle(span);
  }
  const style = replaced || previous || (after[0] ? cleanStyle(after[0]) : {});
  return normalizeSpans([...before, { ...style, t: String(value) }, ...after]);
}
