// A long task may continue on the next page instead of leaving half a page empty (owner 2026-10-12: „смотри как
// много пустых мест”). Only a block alone in its row is split, at an item boundary, with at least MIN_ITEMS items in
// each part. The parts share the block's answers: a part reads and writes the answer keys shifted by its `start`
// (keys begin with the item index: „3”, „3.1”).
//
// Items per type: list tasks — their questions / sentences / rows; a long reading — its paragraphs, then its
// questions (a split reading is shown in one column: text first, questions after); a guided letter — its ruled lines
// (on paper only: on screen the letter is one text field).

const lineList = (value) => String(value || '').split('\n').filter((l) => l.trim());
const paragraphs = (value) => String(value || '').split(/\n{2,}/).filter((p) => p.trim());

const listSpec = (field, items, lines = false) => ({
  items,
  count: (d) => (lines ? lineList(d[field]).length : (Array.isArray(d[field]) ? d[field].length : 0)),
  slice: (d, from, to) => ({ data: { ...d, [field]: lines ? lineList(d[field]).slice(from, to).join('\n') : d[field].slice(from, to) }, start: from }),
});

export const SPLITTABLE = Object.freeze({
  gaps: listSpec('sentences', '.ws-gaps > li', true),
  wordorder: listSpec('sentences', '.ws-order > li', true),
  choice: listSpec('questions', '.ws-choice > li'),
  truefalse: listSpec('statements', '.ws-tf-row'),
  wordforms: listSpec('rows', '.ws-formrow'),
  errorfix: listSpec('rows', '.ws-fix > li'),
  transformation: listSpec('rows', '.ws-fix > li'),
  translation: listSpec('rows', '.ws-translation > li'),
  reading: {
    // measured in the one-column layout a split reading uses (the measuring layer draws it once more that way)
    items: '.ws-passage > p, .ws-rq > li',
    stacked: true,
    count: (d) => paragraphs(d.passage).length + lineList(d.questions).length,
    slice: (d, from, to) => {
      const ps = paragraphs(d.passage);
      const qs = lineList(d.questions);
      const n = ps.length;
      return {
        data: {
          ...d,
          passageTitle: from === 0 ? d.passageTitle : '',
          passage: ps.slice(Math.min(from, n), Math.min(to, n)).join('\n\n'),
          questions: qs.slice(Math.max(0, from - n), Math.max(0, to - n)).join('\n'),
          audio: from === 0 ? d.audio : null,
        },
        start: Math.max(0, from - n),
      };
    },
  },
  guidedletter: {
    printOnly: true,
    // one item per ruled line of the text field
    items: (card, block) => {
      const area = card.querySelector('textarea');
      const n = Number(block.data?.lines) || 12;
      if (!area) return [];
      const r = area.getBoundingClientRect();
      const step = r.height / n;
      return Array.from({ length: n }, (_, i) => ({ top: r.top + i * step, bottom: r.top + (i + 1) * step }));
    },
    count: (d) => Number(d.lines) || 12,
    slice: (d, from, to) => ({ data: { ...d, lines: to - from, opening: from === 0 ? d.opening : '', closing: to >= (Number(d.lines) || 12) ? d.closing : '', partOf: true }, start: 0 }),
  },
});
export const MIN_ITEMS = 2;
// split only when the free space is worth it: at least this many mm and this share of the page
const MIN_FREE_MM = 35;
const MIN_FREE_SHARE = 0.15;

export function itemCount(block) {
  const spec = SPLITTABLE[block?.type];
  return spec ? spec.count(block.data || {}) : 0;
}

// items laid out in columns, or a block given a fixed height, keep their own layout; a letter is split on paper only
export const canSplit = (block, mode = 'print') => {
  const spec = SPLITTABLE[block?.type];
  if (!spec || mode === 'edit' || (spec.printOnly && mode !== 'print')) return false;
  return !(Number(block.opts?.cols) > 1) && !block.minHeightMm && itemCount(block) >= MIN_ITEMS * 2;
};

// the block with only items [from, to), and the answer-key offset of that part
export function sliceBlock(block, from, to) {
  const { data, start } = SPLITTABLE[block.type].slice(block.data || {}, from, to);
  return { block: { ...block, data }, start };
}

// „3” → „5”, „3.1” → „5.1” for a part starting at item 2; other keys (text, audioUrl) stay
export const shiftKey = (key, from) => (from ? String(key).replace(/^\d+/, (n) => String(Number(n) + from)) : key);

/*
 * Packs measured rows into pages.
 * rows[i] = { h, split?: { head, tail, items: [{ top, bottom }], whole? }, breakBefore }   (mm)
 * split.whole: the row's height when it is split (a reading changes to one column); h is its height on one page.
 * A page entry is a row index, or { row, from, to } for a part of a split row.
 * Returns { pages, tall } — tall[p] when a page holds more than it can (one unsplittable very tall row).
 */
export function packPages(rows, { firstCap, nextCap, gap = 0 }) {
  const pages = [[]];
  const tall = [];
  let used = 0;
  const cap = () => (pages.length === 1 ? firstCap : nextCap);
  const newPage = () => { pages.push([]); used = 0; };
  const put = (entry, h) => {
    pages[pages.length - 1].push(entry);
    used += h + gap;
    if (used - gap > cap()) tall[pages.length - 1] = true;
  };
  rows.forEach((row, index) => {
    if (row.breakBefore && pages[pages.length - 1].length) newPage();
    const s = row.split;
    const fits = () => used + row.h <= cap() || (!pages[pages.length - 1].length && row.h <= cap());
    if (!s || s.items.length < MIN_ITEMS * 2 || fits()) {
      if (pages[pages.length - 1].length && used + row.h > cap()) newPage();
      put(index, row.h);
      return;
    }
    const n = s.items.length;
    // height of items [from, to) with the card's head (title, bank) and tail (padding)
    const height = (from, to) => s.head + (s.items[to - 1].bottom - s.items[from].top) + s.tail;
    let from = 0;
    while (from < n) {
      const empty = pages[pages.length - 1].length === 0;
      const room = cap() - used;
      // on a fresh page the whole block is shown as it is, when it fits
      if (from === 0 && empty && row.h <= cap()) { put(index, row.h); return; }
      if (from > 0 && (height(from, n) <= room || (empty && height(from, n) <= cap()))) {
        put({ row: index, from, to: n }, height(from, n));
        return;
      }
      // the largest part that fits, leaving at least MIN_ITEMS on both sides
      let to = 0;
      const worth = empty || (room >= MIN_FREE_MM && room >= cap() * MIN_FREE_SHARE);
      if (worth) for (let k = n - MIN_ITEMS; k >= from + MIN_ITEMS; k -= 1) if (height(from, k) <= room) { to = k; break; }
      if (!to) {
        if (!empty) { newPage(); continue; }
        // even a page cannot hold MIN_ITEMS: the rest goes on one growing page (whole, if nothing was split yet)
        put(from ? { row: index, from, to: n } : index, from ? height(from, n) : row.h);
        return;
      }
      put({ row: index, from, to }, height(from, to));
      newPage();
      from = to;
    }
  });
  return { pages, tall };
}
