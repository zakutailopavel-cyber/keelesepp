// DOM helpers for teacher marks on a worksheet (SheetAnnotations.jsx). A text mark is stored as character offsets
// inside one block card plus the quoted text, so it can be found again if the layout changes.

export const HIGHLIGHT = { error: 'ks-anno-error', note: 'ks-anno-note' };

export const isSheetAnnotation = (item) => item?.kind === 'text' || item?.kind === 'field';

function textNodes(root) {
  const nodes = [];
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.parentElement?.closest('.sa-layer')) nodes.push(node);
  }
  return nodes;
}

// character offsets inside a block card <-> DOM range
export function offsetsOf(card, range) {
  let pos = 0;
  let start = -1;
  let end = -1;
  for (const node of textNodes(card)) {
    if (node === range.startContainer) start = pos + range.startOffset;
    if (node === range.endContainer) { end = pos + range.endOffset; break; }
    pos += node.data.length;
  }
  return start >= 0 && end > start ? { start, end } : null;
}

export function rangeOf(card, { start, end, selectedText }) {
  const nodes = textNodes(card);
  const full = nodes.map((node) => node.data).join('');
  let from = start;
  let to = end;
  if (full.slice(from, to) !== selectedText) {
    // layout changed (e.g. answers filled): find the quoted text again
    const at = full.indexOf(selectedText);
    if (at < 0) return null;
    from = at;
    to = at + selectedText.length;
  }
  const range = card.ownerDocument.createRange();
  let pos = 0;
  let startSet = false;
  for (const node of nodes) {
    const next = pos + node.data.length;
    if (!startSet && from < next) { range.setStart(node, from - pos); startSet = true; }
    if (startSet && to <= next) { range.setEnd(node, to - pos); return range; }
    pos = next;
  }
  return null;
}

export const fieldsOf = (card) => [...card.querySelectorAll('input.ws-line, textarea')];
