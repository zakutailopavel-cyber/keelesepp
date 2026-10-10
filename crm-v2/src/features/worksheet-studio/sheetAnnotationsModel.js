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

// Where a part of an answer field's text is on screen. A textarea / input draws its text itself (no DOM text to make a
// Range of), so a hidden copy with the same box and font is laid out and the part is measured there. The copy is put
// next to the field, inside the same (possibly CSS-zoomed) sheet, so both are laid out at the same scale and wrap the
// same way; the part's place is then its offset inside the copy added to the field's own place.
const MIRRORED = ['boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth',
  'borderBottomWidth', 'borderLeftWidth', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch', 'fontKerning',
  'fontFeatureSettings', 'fontVariationSettings', 'letterSpacing', 'wordSpacing', 'lineHeight', 'textTransform', 'textIndent', 'textRendering',
  'tabSize', 'wordBreak', 'hyphens'];
export function fieldTextRects(field, start, end) {
  const doc = field?.ownerDocument;
  const view = doc?.defaultView;
  const value = String(field?.value ?? '');
  if (!doc || !view?.getComputedStyle || !(end > start) || start >= value.length) return [];
  const css = view.getComputedStyle(field);
  const mirror = doc.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');
  MIRRORED.forEach((prop) => { if (css[prop]) mirror.style[prop] = css[prop]; });
  Object.assign(mirror.style, {
    position: 'absolute', left: '0', top: '0', visibility: 'hidden', pointerEvents: 'none', borderStyle: 'solid', borderColor: 'transparent',
    whiteSpace: field.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre', overflowWrap: 'break-word', height: 'auto', margin: '0',
  });
  // a scroll bar narrows the text of the field
  if (field.tagName === 'TEXTAREA' && field.clientWidth && field.offsetWidth - field.clientWidth > parseFloat(css.borderLeftWidth || 0) + parseFloat(css.borderRightWidth || 0) + 1) {
    mirror.style.boxSizing = 'border-box';
    mirror.style.width = `${field.offsetWidth}px`;
    mirror.style.overflowY = 'scroll';
  }
  mirror.textContent = value.slice(0, start);
  const part = doc.createElement('span');
  part.textContent = value.slice(start, end);
  mirror.append(part, doc.createTextNode(value.slice(end)));
  (field.parentNode || doc.body).appendChild(mirror);
  try {
    const box = mirror.getBoundingClientRect();
    const drawn = field.getBoundingClientRect();
    const k = field.offsetWidth ? drawn.width / field.offsetWidth : 1;
    return [...part.getClientRects()].filter((r) => r.width > 0).map((r) => ({
      left: drawn.left + (r.left - box.left) - field.scrollLeft * k,
      top: drawn.top + (r.top - box.top) - field.scrollTop * k,
      width: r.width, height: r.height,
    }));
  } finally { mirror.remove(); }
}
