import { arrayMove } from '@dnd-kit/sortable';

// Drop rules of the word tiles (SentenceBuilder): ids `line-<tile>` (a tile in the sentence), `bank-<tile>` (in the
// bank), zones `line` and `bank`. Pure, so it is tested without layout.
export const LINE = 'line';
export const BANK = 'bank';
export const lineId = (i) => `line-${i}`;
export const bankId = (i) => `bank-${i}`;
export const indexOf = (id) => Number(String(id).split('-')[1]);
export const isLineTile = (id) => String(id).startsWith('line-');

const centre = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

// Does a tile dragged from the bank go after the sentence tile it is over? Another row → by height, same row → by x.
export function dropsAfter(activeRect, overRect) {
  if (!activeRect || !overRect) return true;
  const a = centre(activeRect);
  const o = centre(overRect);
  if (Math.abs(a.y - o.y) > overRect.height / 2) return a.y > o.y;
  return a.x > o.x;
}

// The tile indexes after the drop, or null for no change.
export function dropResult(value, activeId, overId, after) {
  if (overId == null) return null;
  if (isLineTile(activeId)) {
    const from = value.indexOf(indexOf(activeId));
    if (from < 0) return null;
    if (overId === BANK) return value.filter((_, k) => k !== from);
    if (isLineTile(overId)) {
      const to = value.indexOf(indexOf(overId));
      return to < 0 || to === from ? null : arrayMove(value, from, to);
    }
    return null; // over the empty part of the sentence: it stays where it was
  }
  const tile = indexOf(activeId);
  if (value.includes(tile)) return null;
  if (overId === LINE) return [...value, tile];
  if (isLineTile(overId)) {
    const at = value.indexOf(indexOf(overId));
    if (at < 0) return [...value, tile];
    const pos = after ? at + 1 : at;
    return [...value.slice(0, pos), tile, ...value.slice(pos)];
  }
  return null;
}

