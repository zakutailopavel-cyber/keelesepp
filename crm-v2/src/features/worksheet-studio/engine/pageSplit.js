// A long task may continue on the next page instead of leaving half a page empty (owner 2026-10-12: „смотри как
// много пустых мест”). Only a block alone in its row is split, at an item boundary, with at least MIN_ITEMS items in
// each part (or one item at least MIN_PART_MM tall). Side by side tasks may be placed one under the other and a picture
// drawn a little smaller for the same reason (canStack, canShrink; owner 2026-11-25). The parts share the block's answers: a part reads and writes the answer keys shifted by its `start`
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
          // pictures in the text (figureFloat.js): the part draws those of its own paragraphs; the list stays whole so
          // a change made on a part is stored against the whole text
          figureFrom: Math.min(from, n),
          figureLast: to >= n,
        },
        start: Math.max(0, from - n),
      };
    },
  },
  // a listening task: its gap sentences; the audio bar stays with the first part
  listening: {
    items: '.ws-listen .ws-gaps > li',
    count: (d) => lineList(d.sentences).length,
    slice: (d, from, to) => ({ data: { ...d, sentences: lineList(d.sentences).slice(from, to).join('\n'), audio: from === 0 ? d.audio : null, partOf: from > 0 }, start: from }),
  },
  // a speaking task (owner 2026-11-25: „полупустые страницы”): its questions; the phrase tip and the recorder go with
  // the last part, after the last question. A task with a picture beside the questions keeps its two-column layout.
  speaking: {
    items: '.ws-speak .ws-bullets > li',
    when: (d) => !d.img?.src,
    count: (d) => lineList(d.questions).length,
    slice: (d, from, to) => {
      const last = to >= lineList(d.questions).length;
      return { data: { ...d, questions: lineList(d.questions).slice(from, to).join('\n'), tipTitle: last ? d.tipTitle : '', noRecorder: !last }, start: from };
    },
  },
  // „Kontrolli end”: its statements stand two to a line, so an item is one line of two; the stamp stays with the last
  // part. One line on each side is enough (a self-check has 4–6 statements).
  selfcheck: {
    min: 1,
    items: (card) => {
      const labels = [...card.querySelectorAll('.ws-self-items > label')].map((l) => l.getBoundingClientRect());
      const out = [];
      for (let i = 0; i < labels.length; i += 2) {
        const pair = labels.slice(i, i + 2);
        out.push({ top: Math.min(...pair.map((r) => r.top)), bottom: Math.max(...pair.map((r) => r.bottom)) });
      }
      return out;
    },
    count: (d) => Math.ceil(lineList(d.items).length / 2),
    slice: (d, from, to) => {
      const all = lineList(d.items);
      return { data: { ...d, items: all.slice(from * 2, to * 2).join('\n'), stamp: to * 2 >= all.length ? d.stamp : '' }, start: from * 2 };
    },
  },
  // free writing: its ruled lines, on paper only (owner 2026-10-18: a 12-line task took a page of its own)
  writing: {
    printOnly: true,
    items: (card, block) => {
      const area = card.querySelector('textarea');
      const n = Number(block.data?.lines) || 7;
      if (!area) return [];
      const r = area.getBoundingClientRect();
      const step = r.height / n;
      return Array.from({ length: n }, (_, i) => ({ top: r.top + i * step, bottom: r.top + (i + 1) * step }));
    },
    count: (d) => Number(d.lines) || 7,
    slice: (d, from, to) => ({ data: { ...d, lines: to - from, img: from === 0 ? d.img : null, partOf: true }, start: 0 }),
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
// items left on each side of a split: MIN_ITEMS, or the type's own `min`
export const minItemsOf = (block) => SPLITTABLE[block?.type]?.min || MIN_ITEMS;
// split only when the free space is worth it: at least this many mm and this share of the page (35 mm ≈ 10 % of a
// page; 2026-11-25 the share went from 15 % to 10 %: a 14 %-empty page bottom was left empty before)
export const MIN_FREE_MM = 35;
// a part with fewer than its minimum of items is still allowed when it is this tall: one multiple-choice question with
// three options or one paragraph of a text (2026-11-25: a 74 mm page bottom stayed empty before a 7-question task
// because two questions took 95 mm)
export const MIN_PART_MM = 25;
export const MIN_FREE_SHARE = 0.1;

export function itemCount(block) {
  const spec = SPLITTABLE[block?.type];
  return spec ? spec.count(block.data || {}) : 0;
}

// items laid out in columns, or a block given a fixed height, keep their own layout; a letter is split on paper only
export const canSplit = (block, mode = 'print') => {
  const spec = SPLITTABLE[block?.type];
  if (!spec || mode === 'edit' || (spec.printOnly && mode !== 'print')) return false;
  if (spec.when && !spec.when(block.data || {})) return false;
  // two items at least; packPages decides whether its parts are big enough (min items, or MIN_PART_MM tall)
  return !(Number(block.opts?.cols) > 1) && !block.minHeightMm && itemCount(block) >= 2;
};

// Side by side tasks that may be drawn one under the other, each over the whole width, when their row does not fit on
// the page and the page still has room (packPages `stack`): the first task then fills that room and the second
// follows. Their order stays as it is — nothing moves past a numbered task. Only list tasks: a picture, a scheme, a
// table of pictures or a tip next to a picture keeps its row (made full width it would change size and meaning).
const STACKABLE = new Set(['gaps', 'wordorder', 'choice', 'truefalse', 'wordforms', 'errorfix', 'transformation', 'translation', 'listening', 'match', 'manymatch', 'categorize', 'selfcheck', 'writing', 'dialogue']);
export const canStack = (row, mode = 'print') => mode !== 'edit' && Array.isArray(row) && row.length > 1
  && row.every((b) => (STACKABLE.has(b.type) || (b.type === 'speaking' && !b.data?.img?.src)) && !b.minHeightMm && !b.joined);
// A picture (an `image` block, alone or beside a tip) that misses the page by a little is drawn smaller rather than
// moved on and leaving the page bottom empty: down to this share of its width (its height follows its aspect).
export const MIN_PIC_SCALE = 0.7;
export const canShrink = (row, mode = 'print') => mode !== 'edit' && Array.isArray(row)
  && row.filter((b) => b.type === 'image').length === 1 && !row.some((b) => b.minHeightMm);
// a member of a stacked row drawn on its own line
export const stackedBlock = (block) => ({ ...block, span: 12, width: 'full' });

// the block with only items [from, to), and the answer-key offset of that part
export function sliceBlock(block, from, to) {
  const { data, start } = SPLITTABLE[block.type].slice(block.data || {}, from, to);
  return { block: { ...block, data }, start };
}

// „3” → „5”, „3.1” → „5.1” for a part starting at item 2; other keys (text, audioUrl) stay
export const shiftKey = (key, from) => (from ? String(key).replace(/^\d+/, (n) => String(Number(n) + from)) : key);

/*
 * Packs measured rows into pages.
 * rows[i] = { h, split?: { head, tail, items: [{ top, bottom }], whole?, min? }, breakBefore, keepWithNext,
 *             stack?: [{ h, split? }, …] }   (mm)
 * split.min: items kept on each side (default MIN_ITEMS).
 * shrink: { photo, others } — a row with a picture (canShrink): the picture's height and the natural height of the
 * blocks beside it; when the row misses the page by little, it is drawn with the picture made smaller ({ row, scale }).
 * stack: the row's blocks measured each alone over the whole width (canStack): when the row does not fit, the page has
 * room worth filling and the first block (or its first part) fits there, the blocks are placed one under the other.
 * A page entry is a row index, { row, from, to } for a part of a split row, { row, scale } for a row with a smaller
 * picture, or { row, member, from?, to? } for a
 * block of a stacked row (from/to when that block is split as well).
 * Returns { pages, tall } — tall[p] when a page holds more than it can (one unsplittable very tall row).
 */
export function packPages(rows, { firstCap, nextCap, gap = 0 }) {
  const pages = [[]];
  const tall = [];
  let used = 0;
  const cap = () => (pages.length === 1 ? firstCap : nextCap);
  const newPage = () => { pages.push([]); used = 0; };
  const isEmpty = () => pages[pages.length - 1].length === 0;
  const worthFilling = (room) => room >= MIN_FREE_MM && room >= cap() * MIN_FREE_SHARE;
  const put = (entry, h) => {
    pages[pages.length - 1].push(entry);
    used += h + gap;
    if (used - gap > cap()) tall[pages.length - 1] = true;
  };
  const minOf = (s) => s?.min || MIN_ITEMS;
  // items [from, to) may stand as a part: enough items, or tall enough
  const span = (s, from, to) => s.items[to - 1].bottom - s.items[from].top;
  const partOk = (s, from, to) => to - from >= minOf(s) || (to > from && span(s, from, to) >= MIN_PART_MM);
  const firstCut = (s) => { for (let k = 1; k < s.items.length; k += 1) if (partOk(s, 0, k) && partOk(s, k, s.items.length)) return k; return 0; };
  const splits = (s) => Boolean(s) && s.items.length >= 2 && firstCut(s) > 0;
  // the height of the smallest first part of a row (the whole row when it does not split)
  const firstPart = (row) => {
    const s = row?.split;
    if (!splits(s)) return row?.h || 0;
    return s.head + span(s, 0, firstCut(s)) + s.tail;
  };
  // places one row (or one block of a stacked row); entry(from, to) makes its page entry, entry() the whole one
  const place = (row, entry) => {
    const s = row.split;
    const fits = () => used + row.h <= cap() || (isEmpty() && row.h <= cap());
    if (!splits(s) || fits()) {
      if (!isEmpty() && used + row.h > cap()) newPage();
      put(entry(), row.h);
      return;
    }
    const n = s.items.length;
    // height of items [from, to) with the card's head (title, bank) and tail (padding)
    const height = (from, to) => s.head + (s.items[to - 1].bottom - s.items[from].top) + s.tail;
    let from = 0;
    while (from < n) {
      const empty = isEmpty();
      const room = cap() - used;
      // on a fresh page the whole block is shown as it is, when it fits
      if (from === 0 && empty && row.h <= cap()) { put(entry(), row.h); return; }
      if (from > 0 && (height(from, n) <= room || (empty && height(from, n) <= cap()))) {
        put(entry(from, n), height(from, n));
        return;
      }
      // the largest part that fits, leaving parts big enough on both sides (partOk)
      let to = 0;
      if (empty || worthFilling(room)) for (let k = n - 1; k > from; k -= 1) if (partOk(s, from, k) && partOk(s, k, n) && height(from, k) <= room) { to = k; break; }
      if (!to) {
        if (!empty) { newPage(); continue; }
        // even a page cannot hold a part big enough: the rest goes on one growing page (whole, if nothing was split yet)
        put(from ? entry(from, n) : entry(), from ? height(from, n) : row.h);
        return;
      }
      put(entry(from, to), height(from, to));
      newPage();
      from = to;
    }
  };
  rows.forEach((row, index) => {
    if (row.breakBefore && !isEmpty()) newPage();
    // a word strip belongs to the task below it: when that task (or its first part) would start on the next page, the
    // strip goes along instead of staying alone at the bottom
    if (row.keepWithNext && rows[index + 1] && !isEmpty()) {
      const next = rows[index + 1];
      const room = cap() - used - row.h - gap;
      const whole = next.h <= room;
      const part = splits(next.split) && firstPart(next) <= room && worthFilling(room);
      if (!whole && !part) newPage();
    }
    const room = cap() - used;
    if (row.stack?.length > 1 && !isEmpty() && row.h > room && worthFilling(room) && firstPart(row.stack[0]) <= room) {
      row.stack.forEach((member, k) => place(member, (from, to) => (from === undefined ? { row: index, member: k } : { row: index, member: k, from, to })));
      return;
    }
    const pic = row.shrink;
    if (pic && !isEmpty() && row.h > room && worthFilling(room) && pic.photo > 0 && pic.others <= room) {
      const scale = 1 - (row.h - room) / pic.photo;
      if (scale >= MIN_PIC_SCALE) { put({ row: index, scale: Math.floor(scale * 1000) / 1000 }, room); return; }
    }
    place(row, (from, to) => (from === undefined ? index : { row: index, from, to }));
  });
  return { pages, tall };
}
