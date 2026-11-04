// Where a task's floating note (the teacher's answer key, the right answers shown to the learner) goes on screen.
// Owner 2026-11-04: the hints opened inside the task card, covered half of it and pushed the sheet down, so the
// student's task jumped. The note now floats next to the task and never changes the sheet's layout.
//
// All rectangles are in screen pixels ({ left, top, right, bottom }); size is { w, h } of the note.
// bounds: the part of the screen the note may use (the visual viewport: the keyboard's part is not in it).
// avoid: the answer field being typed in; the note never covers it.
// Order: beside the task (right, then left), then under it, then over it. When nothing fits whole (a phone, a tall task)
// the note lies on the side with more room, scrolled inside, or docked to the screen's bottom (top while the field being
// typed in is in the lower half).

const overlaps = (a, b) => Boolean(a && b) && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const clamp = (value, min, max) => Math.max(min, Math.min(value, Math.max(min, max)));

export const NOTE_MIN_HEIGHT = 120;

export function placeFloating({ anchor, size, bounds, avoid = null, gap = 10, margin = 8 }) {
  const w = Math.min(size.w, bounds.right - bounds.left - margin * 2);
  const h = size.h;
  const room = { left: bounds.left + margin, top: bounds.top + margin, right: bounds.right - margin, bottom: bounds.bottom - margin };
  const fullHeight = room.bottom - room.top;
  const rect = (left, top, height = h) => ({ left, top, right: left + w, bottom: top + Math.min(height, fullHeight) });
  // beside: level with the task's top, kept on screen
  const sideTop = clamp(anchor.top, room.top, room.bottom - h);
  const besideHeight = Math.min(h, fullHeight);
  const candidates = [
    { side: 'right', left: anchor.right + gap, top: sideTop, fits: anchor.right + gap + w <= room.right },
    { side: 'left', left: anchor.left - gap - w, top: sideTop, fits: anchor.left - gap - w >= room.left },
    { side: 'below', left: clamp(anchor.left, room.left, room.right - w), top: anchor.bottom + gap, fits: anchor.bottom + gap + h <= room.bottom && anchor.bottom + gap >= room.top },
    { side: 'above', left: clamp(anchor.left, room.left, room.right - w), top: anchor.top - gap - h, fits: anchor.top - gap - h >= room.top && anchor.top - gap <= room.bottom },
  ];
  for (const c of candidates) {
    const height = c.side === 'right' || c.side === 'left' ? besideHeight : h;
    if (c.fits && !overlaps(rect(c.left, c.top, height), avoid)) return { side: c.side, left: c.left, top: c.top, width: w, maxHeight: height < h ? height : null };
  }
  // nothing fits whole: under or over the task, whichever has more room, scrolled inside
  const below = room.bottom - (anchor.bottom + gap);
  const above = anchor.top - gap - room.top;
  const left = clamp(anchor.left, room.left, room.right - w);
  if (Math.max(below, above) >= NOTE_MIN_HEIGHT) {
    const pick = below >= above
      ? { side: 'below', left, top: anchor.bottom + gap, width: w, maxHeight: below }
      : { side: 'above', left, top: room.top + Math.max(0, above - h), width: w, maxHeight: Math.min(h, above) };
    if (!overlaps(rect(pick.left, pick.top, pick.maxHeight), avoid)) return { ...pick, maxHeight: pick.maxHeight < h ? pick.maxHeight : null };
  }
  // the task fills the screen (a phone): docked at the screen's edge away from the field being typed in
  const dockHeight = Math.min(h, Math.max(NOTE_MIN_HEIGHT, Math.round(fullHeight * 0.42)));
  const fieldLow = avoid ? (avoid.top + avoid.bottom) / 2 > (room.top + room.bottom) / 2 : false;
  return {
    side: fieldLow ? 'dock-top' : 'dock-bottom',
    left: room.left + Math.max(0, (room.right - room.left - w) / 2),
    top: fieldLow ? room.top : room.bottom - dockHeight,
    width: w,
    maxHeight: dockHeight < h ? dockHeight : null,
  };
}

// Several notes on one sheet (the teacher showed the answers of several tasks): one is open at a time. group: Map of
// blockId → { visible, closed, rank, distance } (rank 0 opened by the user, 1 typed in, 2 pointed at, 3 none; distance
// of the task from the screen's middle). The others wait as a button.
export function pickNote(group) {
  let best = '';
  let bestEntry = null;
  for (const [id, entry] of group) {
    if (!entry.visible || entry.closed) continue;
    if (!bestEntry || entry.rank < bestEntry.rank || (entry.rank === bestEntry.rank && entry.distance < bestEntry.distance)) { best = id; bestEntry = entry; }
  }
  return best;
}

// The button of a waiting (or folded) note: on its task's top right corner, kept on screen. `right` is the button's
// right edge in screen pixels.
export function pillSpot(anchor, bounds, margin = 8) {
  return {
    top: clamp(anchor.top - 22, bounds.top + margin, bounds.bottom - margin - 44),
    right: clamp(anchor.right - margin, bounds.left + margin + 140, bounds.right - margin),
  };
}

// The task is out of sight (the board panned it away, the page scrolled): the note is not shown.
export const anchorVisible = (anchor, clip) => Boolean(anchor && clip) && anchor.bottom > clip.top && anchor.top < clip.bottom && anchor.right > clip.left && anchor.left < clip.right && anchor.right > anchor.left;
