import { newId } from './schema.js';

// The free layer of a block (owner, 2026-10-09: arrows, callouts, stickers, free text over the sheet). Marks belong to
// a block (block.marks) and are placed in % of the card, so they move and scale with it and survive page breaks.
//   note    callout bubble with text          { x, y, w, text }
//   label   free text                         { x, y, w, text }
//   sticker emoji                             { x, y, size (mm), emoji }
//   circle  outline to point something out    { x, y, w, h }
//   arrow   arrow between two points          { x1, y1, x2, y2 }

export const MARK_KINDS = [
  ['arrow', 'Nool', 'MoveUpRight'],
  ['note', 'Mull', 'MessageSquare'],
  ['label', 'Tekst', 'Type'],
  ['sticker', 'Kleebis', 'Sticker'],
  ['circle', 'Ring', 'Circle'],
];
export const MARK_COLORS = { navy: '#173a63', green: '#2f7d4c', red: '#c0392b', orange: '#d9822b', violet: '#7b4bb3' };
export const STICKERS = ['⭐', '✅', '❗', '❓', '💡', '👍', '❤️', '😊', '🎧', '✏️', '🗣️', '📌'];
export const MAX_MARKS = 20;

const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, Math.round(Number(v) * 10) / 10));

export function newMark(kind) {
  const base = { id: newId('m'), kind, color: kind === 'circle' || kind === 'arrow' ? 'red' : 'navy' };
  if (kind === 'arrow') return { ...base, x1: 35, y1: 70, x2: 60, y2: 40 };
  if (kind === 'note') return { ...base, x: 55, y: 12, w: 34, text: 'Pane tähele!' };
  if (kind === 'label') return { ...base, x: 40, y: 45, w: 30, text: 'Tekst' };
  if (kind === 'sticker') return { ...base, x: 82, y: 8, size: 12, emoji: '⭐' };
  if (kind === 'circle') return { ...base, x: 30, y: 35, w: 30, h: 22 };
  return null;
}

export const marksOf = (block) => (Array.isArray(block?.marks) ? block.marks.filter((m) => MARK_KINDS.some(([k]) => k === m?.kind)) : []);

export function addMark(block, kind) {
  const mark = newMark(kind);
  const marks = marksOf(block);
  if (!mark || marks.length >= MAX_MARKS) return { block, mark: null };
  // a second mark of the same kind lands a little lower, not on top of the first
  const shift = marks.filter((m) => m.kind === kind).length * 6;
  const placed = kind === 'arrow' ? { ...mark, y1: clamp(mark.y1 + shift), y2: clamp(mark.y2 + shift) } : { ...mark, y: clamp(mark.y + shift) };
  return { block: { ...block, marks: [...marks, placed] }, mark: placed };
}

export const updateMark = (block, id, patch) => ({ ...block, marks: marksOf(block).map((m) => (m.id === id ? { ...m, ...patch } : m)) });
export const removeMark = (block, id) => ({ ...block, marks: marksOf(block).filter((m) => m.id !== id) });

// drag by (dx, dy) % of the card; the whole mark stays inside the card
export function moveMark(mark, dx, dy) {
  if (mark.kind === 'arrow') {
    const ddx = Math.min(100 - Math.max(mark.x1, mark.x2), Math.max(-Math.min(mark.x1, mark.x2), dx));
    const ddy = Math.min(100 - Math.max(mark.y1, mark.y2), Math.max(-Math.min(mark.y1, mark.y2), dy));
    return { ...mark, x1: clamp(mark.x1 + ddx), x2: clamp(mark.x2 + ddx), y1: clamp(mark.y1 + ddy), y2: clamp(mark.y2 + ddy) };
  }
  const w = mark.w || 0;
  return { ...mark, x: clamp(mark.x + dx, 0, 100 - Math.min(w, 100)), y: clamp(mark.y + dy, 0, 98) };
}

// a corner / end handle: arrow ends move freely, boxes grow from their top-left corner, a sticker changes its size
export function resizeMark(mark, handle, x, y, mmPerPct = 2.5) {
  if (mark.kind === 'arrow') return handle === 'start' ? { ...mark, x1: clamp(x), y1: clamp(y) } : { ...mark, x2: clamp(x), y2: clamp(y) };
  if (mark.kind === 'sticker') return { ...mark, size: Math.round(Math.min(40, Math.max(6, (x - mark.x) * mmPerPct))) };
  const w = clamp(x - mark.x, 8, 100 - mark.x);
  return mark.kind === 'circle' ? { ...mark, w, h: clamp(y - mark.y, 6, 100 - mark.y) } : { ...mark, w };
}
