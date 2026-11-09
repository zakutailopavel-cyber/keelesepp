// An anchored „Järjehoidja” (owner 2026-11-09: „закладки я хотел привязать к конкретному слову или предложению”): the
// bookmark remembers the word or sentence of the page text it belongs to. An anchor is
//   { kind: 'word' | 'sentence' | 'phrase', quote, before, after, sentence, blockId, start, end }
// — the exact quote, a little text before and after it, the whole sentence (for „Minu vead”), the worksheet block
// (`[data-block]`, '' = the whole page) and the quote's character offsets in that block's text. On screen it is found
// again by the offsets; when the text moved (answers filled, the sheet re-rendered) by the quote, the occurrence with
// the best matching context winning. Old bookmarks have no anchor and stay free sheets.

export const CONTEXT = 40; // characters of `before` / `after`
export const MAX_QUOTE = 300;
export const MAX_SENTENCE = 600;
export const ANCHOR_KINDS = ['word', 'sentence', 'phrase'];

const WORD = /[\p{L}\p{N}\p{M}'’-]/u;
const WORD_ONLY = /^[\p{L}\p{N}\p{M}'’-]+$/u;
const TERMINATORS = '.!?…';
const CLOSERS = '”"»“)]’\'';
const OPENERS = '„"«“(–—-';
// Estonian (and a few common) abbreviations after which a period does not end the sentence
const ABBREVIATIONS = new Set(['nt', 'näit', 'jne', 'jm', 'jms', 'jt', 'vt', 'vrd', 'st', 'so', 'lk', 'u', 'ca', 'dr', 'hr', 'pr', 'prl', 'mh', 'kl', 'nr', 'tel', 'a', 'saj', 'sh', 'ka', 'mnt', 'tn', 'pst', 'ül', 'eKr', 'pKr', 'ekr', 'pkr', 'e', 'p', 'v', 't', 'mr', 'mrs', 'ms', 'etc', 'vs', 'eg', 'ie', 'min', 'sek', 'kr', 'tk', 'mld', 'mln', 'tuh', 'jun', 'sen', 'prof', 'dots', 'lp', 'aj', 'ingl', 'ld', 'sks', 'vn', 'pr']);

const clip = (value, size) => String(value ?? '').slice(0, size);
const isSpace = (ch) => /\s/u.test(ch || '');

// the word around a character offset (a click on a letter), or null on a space / sign. `breaks`: offsets where another
// box of the page starts (a chip, a list item: „hommikul” „päeval” side by side have no space between them in the text)
export function wordAt(text = '', offset = 0, breaks = []) {
  const value = String(text);
  let at = Math.max(0, Math.min(value.length, Math.floor(offset)));
  // a click just after the last letter still means that word
  if (!WORD.test(value[at] || '') && WORD.test(value[at - 1] || '')) at -= 1;
  if (!WORD.test(value[at] || '')) return null;
  const lo = Math.max(0, ...breaks.filter((b) => b <= at));
  const hi = Math.min(value.length, ...breaks.filter((b) => b > at));
  let start = at;
  let end = at + 1;
  while (start > lo && WORD.test(value[start - 1])) start -= 1;
  while (end < hi && WORD.test(value[end])) end += 1;
  // hyphens / apostrophes at the edges are not part of the word
  while (start < end && /['’-]/.test(value[start])) start += 1;
  while (end > start && /['’-]/.test(value[end - 1])) end -= 1;
  return end > start ? { start, end } : null;
}

// is the terminator at `index` the end of a sentence? (the next sentence starts with a capital, a number or a quote)
function endsSentence(value, index) {
  const ch = value[index];
  let next = index + 1;
  while (next < value.length && TERMINATORS.includes(value[next])) next += 1;
  while (next < value.length && CLOSERS.includes(value[next])) next += 1;
  if (next >= value.length) return next;
  if (!isSpace(value[next])) return 0;
  let first = next;
  while (first < value.length && isSpace(value[first])) first += 1;
  if (first >= value.length) return next;
  const lead = value[first];
  const opensSentence = OPENERS.includes(lead) || /\p{Lu}|\p{N}/u.test(lead);
  if (ch === '.' && value[index + 1] !== '.') {
    // „nt. Tallinn”, „Hr. Tamm”, „A. H. Tammsaare”: the word before the period is an abbreviation or an initial
    let wordStart = index;
    while (wordStart > 0 && /[\p{L}\p{N}.]/u.test(value[wordStart - 1])) wordStart -= 1;
    const before = value.slice(wordStart, index).split('.').pop();
    if (ABBREVIATIONS.has(before) || ABBREVIATIONS.has(before.toLowerCase()) || /^\p{Lu}$/u.test(before)) return 0;
    // „5. mail”: an ordinal number goes on with a small letter (handled by opensSentence below)
  }
  return opensSentence ? next : 0;
}

/**
 * The sentence around start…end in `text`. `breaks` are offsets where a new paragraph / heading / list item begins in
 * the page (the DOM's block boundaries: the joined text has no space there). Estonian quotes stay with their sentence:
 * „Tule siia!” ütles ema. → one sentence; Ta küsis: „Kas tuled?” Siis läks ta. → two.
 */
export function sentenceAt(text = '', start = 0, end = start, breaks = []) {
  const value = String(text);
  const from = Math.max(0, Math.min(value.length, start));
  const to = Math.max(from, Math.min(value.length, end));
  let s = 0;
  let e = value.length;
  for (const b of breaks) {
    if (b <= from && b > s) s = b;
    if (b >= to && b < e) e = b;
  }
  // the sentence's start: after the last sentence end before `from` (a newline is an end too)
  for (let i = from - 1; i >= s; i -= 1) {
    if (value[i] === '\n') { s = i + 1; break; }
    if (TERMINATORS.includes(value[i])) {
      const after = endsSentence(value, i);
      if (after && after <= from) { s = after; break; }
    }
  }
  // the end: the first sentence end at or after the quote's last letter
  for (let i = Math.max(s, to - 1); i < e; i += 1) {
    if (value[i] === '\n' && i >= to) { e = i; break; }
    if (TERMINATORS.includes(value[i]) && i >= to - 1) {
      const after = endsSentence(value, i);
      if (after) { e = after; break; }
    }
  }
  while (s < e && isSpace(value[s])) s += 1;
  while (e > s && isSpace(value[e - 1])) e -= 1;
  return { start: s, end: e, text: value.slice(s, e) };
}

export const anchorKind = (quote = '', sentence = '') => {
  const value = String(quote).trim();
  if (WORD_ONLY.test(value)) return 'word';
  return value && value === String(sentence).trim() ? 'sentence' : 'phrase';
};

export const anchorLabel = (anchor) => (anchor?.kind === 'word' ? 'Sõna' : anchor?.kind === 'sentence' ? 'Lause' : 'Tekst');

/** An anchor for start…end of a block's text (`breaks`: the block's paragraph boundaries). */
export function makeAnchor({ text = '', start = 0, end = 0, blockId = '', breaks = [], kind = '' } = {}) {
  const value = String(text);
  let s = Math.max(0, Math.min(value.length, start));
  let e = Math.max(s, Math.min(value.length, end));
  while (s < e && isSpace(value[s])) s += 1;
  while (e > s && isSpace(value[e - 1])) e -= 1;
  if (e <= s) return null;
  // the sentence is for reading („Minu vead”): a gap's spaces collapse („Ma ärkan ___ kell 7.” → „Ma ärkan kell 7.”)
  const sentence = sentenceAt(value, s, e, breaks).text.replace(/\s+/g, ' ');
  const quote = value.slice(s, e).slice(0, MAX_QUOTE);
  e = s + quote.length;
  return {
    kind: ANCHOR_KINDS.includes(kind) ? kind : anchorKind(quote, sentence),
    quote,
    before: value.slice(Math.max(0, s - CONTEXT), s),
    after: value.slice(e, e + CONTEXT),
    sentence: sentence.length <= MAX_SENTENCE ? sentence : quote,
    blockId: clip(blockId, 200),
    start: s,
    end: e,
  };
}

// the anchor as stored (unknown keys dropped, sizes kept), or null when it has no quote
export function cleanAnchor(anchor) {
  if (!anchor || typeof anchor !== 'object') return null;
  const quote = clip(anchor.quote, MAX_QUOTE);
  if (!quote.trim()) return null;
  const start = Number.isInteger(anchor.start) && anchor.start >= 0 ? anchor.start : 0;
  const end = Number.isInteger(anchor.end) && anchor.end > start ? anchor.end : start + quote.length;
  return {
    kind: ANCHOR_KINDS.includes(anchor.kind) ? anchor.kind : anchorKind(quote, anchor.sentence),
    quote,
    before: clip(anchor.before, CONTEXT),
    after: clip(anchor.after, CONTEXT),
    sentence: clip(anchor.sentence || quote, MAX_SENTENCE),
    blockId: clip(anchor.blockId, 200),
    start,
    end,
  };
}

// how many characters of `a`'s end equal `b`'s end
function sameEnd(a = '', b = '') {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n += 1;
  return n;
}
function sameStart(a = '', b = '') {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

/** Where the anchor's quote is in `text` now: { start, end } or null. */
export function findAnchor(text = '', anchor) {
  const value = String(text);
  const quote = anchor?.quote || '';
  if (!quote) return null;
  const { start = -1 } = anchor;
  if (start >= 0 && value.slice(start, start + quote.length) === quote) return { start, end: start + quote.length };
  let best = null;
  for (let at = value.indexOf(quote); at >= 0; at = value.indexOf(quote, at + 1)) {
    const score = sameEnd(value.slice(Math.max(0, at - CONTEXT), at), anchor.before || '')
      + sameStart(value.slice(at + quote.length, at + quote.length + CONTEXT), anchor.after || '');
    const distance = Math.abs(at - Math.max(0, start));
    if (!best || score > best.score || (score === best.score && distance < best.distance)) best = { start: at, score, distance };
  }
  return best ? { start: best.start, end: best.start + quote.length } : null;
}

// The sentence of a note with its quote marked: [{ text, quote: bool }] (the quote alone when it is not in the sentence)
export function quoteParts(anchor) {
  if (!anchor?.quote) return [];
  const sentence = anchor.sentence || anchor.quote;
  const at = sentence.indexOf(anchor.quote);
  if (at < 0 || sentence === anchor.quote) return [{ text: anchor.quote, quote: true }];
  return [
    { text: sentence.slice(0, at), quote: false },
    { text: anchor.quote, quote: true },
    { text: sentence.slice(at + anchor.quote.length), quote: false },
  ].filter((part) => part.text);
}

// ── the page's DOM ──

// text of the board's own overlays inside a sheet (teacher marks, their composer) is not page text, nor the sheet's
// hidden copy laid out off screen to measure its pages (`.ws-measure`, same block ids)
const SKIP = '.sa-layer, .sa-composer, .ws-measure, script, style, [data-anchor-skip]';
const BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'TR', 'TD', 'TH', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'BLOCKQUOTE', 'FIGCAPTION', 'DD', 'DT', 'BR', 'LABEL']);

// the box a text node is laid out in: its nearest ancestor that is not plain inline text (a paragraph, a list item, a
// word chip drawn as inline-block / flex). Without a layout engine the tag decides.
function boxOf(node, root, cache) {
  const view = root.ownerDocument?.defaultView;
  for (let el = node.parentElement; el && el !== root; el = el.parentElement) {
    if (!cache.has(el)) {
      let display = '';
      try { display = view?.getComputedStyle ? view.getComputedStyle(el).display : ''; } catch { display = ''; }
      cache.set(el, display ? !['inline', 'contents', ''].includes(display) : BLOCK_TAGS.has(el.tagName));
    }
    if (cache.get(el)) return el;
  }
  return root;
}

/** The text of `root` as one string: { text, nodes: [{ node, start }], breaks } (same offsets as the worksheet marks). */
export function textModel(root) {
  const doc = root?.ownerDocument;
  if (!doc) return { text: '', nodes: [], breaks: [] };
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const nodes = [];
  const breaks = [];
  let text = '';
  let lastBlock = null;
  const cache = new Map();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest(SKIP)) continue;
    const block = boxOf(node, root, cache);
    if (lastBlock && block !== lastBlock && text.length) breaks.push(text.length);
    lastBlock = block;
    nodes.push({ node, start: text.length });
    text += node.data;
  }
  return { text, nodes, breaks };
}

// a DOM point (text node + offset) → offset in the model, or -1
export function offsetOf(model, node, offset) {
  const hit = model.nodes.find((item) => item.node === node);
  if (hit) return hit.start + Math.min(offset, hit.node.data.length);
  // an element point (the selection ends between nodes): the text before its child `offset`
  if (node?.nodeType === 1) {
    const child = node.childNodes[offset];
    if (!child) {
      const after = model.nodes.filter((item) => node.contains(item.node));
      const last = after[after.length - 1];
      return last ? last.start + last.node.data.length : -1;
    }
    const first = model.nodes.find((item) => child === item.node || child.contains?.(item.node));
    return first ? first.start : -1;
  }
  return -1;
}

export function rangeOf(model, start, end) {
  const doc = model.nodes[0]?.node.ownerDocument;
  if (!doc || !(end > start)) return null;
  const range = doc.createRange();
  let started = false;
  for (const { node, start: at } of model.nodes) {
    const next = at + node.data.length;
    if (!started && start < next) { range.setStart(node, start - at); started = true; }
    if (started && end <= next) { range.setEnd(node, end - at); return range; }
  }
  return null;
}

const escapeId = (id) => String(id).replace(/["\\]/g, '\\$&');
// the worksheet block a node is in (or the page root)
export const blockOf = (node, root) => {
  const el = node?.nodeType === 1 ? node : node?.parentElement;
  const block = el?.closest?.('[data-block]');
  return block && root.contains(block) ? block : root;
};
// the shown block with this id (not its hidden measuring copy)
const findBlock = (root, id) => [...root.querySelectorAll(`[data-block="${escapeId(id)}"]`)].find((el) => !el.closest(SKIP)) || null;

function anchorIn(root, block, start, end, kind = '') {
  const model = textModel(block);
  const anchor = makeAnchor({ text: model.text, start, end, breaks: model.breaks, blockId: block === root ? '' : block.dataset?.block || '', kind });
  return anchor;
}

/** The anchor of a text selection inside `root` (one block), or null. */
export function anchorFromRange(root, range) {
  if (!root || !range || range.collapsed) return null;
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const block = blockOf(range.startContainer, root);
  if (!block.contains(range.endContainer)) return null;
  if ((range.startContainer.parentElement || range.startContainer).closest?.(SKIP)) return null;
  const model = textModel(block);
  const start = offsetOf(model, range.startContainer, range.startOffset);
  const end = offsetOf(model, range.endContainer, range.endOffset);
  if (start < 0 || end <= start) return null;
  return anchorIn(root, block, start, end);
}

/** The anchor of start…end of a worksheet block (`blockId`, '' = the page): the teacher's „Märkus / Analüüs” popup. */
export function anchorFromOffsets(root, { blockId = '', start, end }) {
  if (!root) return null;
  const block = blockId ? findBlock(root, blockId) : root;
  if (!block) return null;
  return anchorIn(root, block, start, end);
}

// the text position under a screen point (the layers above it must let the pointer through)
export function caretAt(doc, x, y) {
  try {
    if (doc?.caretPositionFromPoint) {
      const pos = doc.caretPositionFromPoint(x, y);
      if (pos?.offsetNode) return { node: pos.offsetNode, offset: pos.offset };
    }
    if (doc?.caretRangeFromPoint) {
      const range = doc.caretRangeFromPoint(x, y);
      if (range?.startContainer) return { node: range.startContainer, offset: range.startOffset };
    }
  } catch { /* not supported */ }
  return null;
}

/** The word (or with `sentence` its whole sentence) under a screen point in `root`, or null. */
export function anchorFromPoint(root, x, y, { sentence = false } = {}) {
  const caret = caretAt(root?.ownerDocument, x, y);
  if (!caret || caret.node.nodeType !== 3 || !root.contains(caret.node)) return null;
  if (caret.node.parentElement?.closest(SKIP)) return null;
  const block = blockOf(caret.node, root);
  const model = textModel(block);
  const at = offsetOf(model, caret.node, caret.offset);
  const word = wordAt(model.text, at, model.breaks);
  if (!word) return null;
  if (!sentence) return anchorIn(root, block, word.start, word.end, 'word');
  const whole = sentenceAt(model.text, word.start, word.end, model.breaks);
  return anchorIn(root, block, whole.start, whole.end, 'sentence');
}

/**
 * Where a range lies in `layer`'s own units (the board's units under a scaled sheet): { rects, pin } — the boxes of its
 * lines and the marker's place just above the end of the last line. null without a layout.
 */
export function spotOf(range, layer) {
  if (!range || !layer?.getBoundingClientRect) return null;
  let list = [];
  try { list = [...(range.getClientRects?.() || [])]; } catch { list = []; }
  const rects = list.filter((r) => r.width > 0 && r.height > 0);
  if (!rects.length) return null;
  const base = layer.getBoundingClientRect();
  const k = layer.offsetWidth ? base.width / layer.offsetWidth || 1 : 1;
  const r1 = (n) => Math.round(n * 10) / 10;
  const boxes = rects.map((r) => ({ x: r1((r.left - base.left) / k), y: r1((r.top - base.top) / k), w: r1(r.width / k), h: r1(r.height / k) }));
  const last = boxes[boxes.length - 1];
  // the marker is drawn up and right of this point (a superscript after the quote's last letter)
  return { rects: boxes, pin: { x: r1(last.x + last.w), y: r1(last.y + 2) } };
}

/** The DOM range of an anchor in `root` now, or null (block missing → the whole page is searched). */
export function locateAnchor(root, anchor) {
  if (!root || !anchor?.quote) return null;
  const block = anchor.blockId ? findBlock(root, anchor.blockId) : root;
  const tryIn = (node, withOffsets) => {
    const model = textModel(node);
    const found = findAnchor(model.text, withOffsets ? anchor : { ...anchor, start: -1 });
    return found ? rangeOf(model, found.start, found.end) : null;
  };
  return (block && tryIn(block, true)) || (block !== root ? tryIn(root, false) : null);
}
