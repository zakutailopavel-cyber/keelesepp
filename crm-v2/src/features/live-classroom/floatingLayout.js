// Movable video windows of the lesson room (owner 2026-11-04, „like Google Meet”): pure geometry and the remembered
// layout. A window is kept as an anchored layout — which corner it belongs to and the distance from those edges — so
// it stays in its corner when the screen turns or the browser is resized. Remembered per device (localStorage).

// v2 (2026-11-05): the layer starts under the page tab bar, so v1 places (measured from the board's top) are not reused
export const STORAGE_KEY = 'keelesepp.liveLayout.v2';
export const MARGIN = 8;
export const SNAP = 28;
export const PRESET_WIDTHS = Object.freeze({ s: 160, m: 240, l: 380 });

const finite = (value) => Number.isFinite(value);
const clampNumber = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

/** Width that fits the bounds with the aspect kept (heightFor maps width → height). */
export function fitWidth(width, heightFor, bounds, { minWidth = 96, margin = MARGIN } = {}) {
  const maxW = Math.max(minWidth, bounds.w - 2 * margin);
  const maxH = Math.max(1, bounds.h - 2 * margin);
  let w = clampNumber(width, minWidth, maxW);
  const h = heightFor(w);
  if (h > maxH && h > 0) w = Math.max(minWidth, Math.floor(w * (maxH / h)));
  return w;
}

/** Keeps a rectangle inside the bounds (it never leaves the board, whatever the drag or resize). */
export function clampRect(rect, bounds, { margin = MARGIN } = {}) {
  const x = clampNumber(rect.x, margin, bounds.w - rect.w - margin);
  const y = clampNumber(rect.y, margin, bounds.h - rect.h - margin);
  return { ...rect, x, y };
}

/** Near an edge (within `threshold`) the window sticks to it; two edges at once make a corner. */
export function snapRect(rect, bounds, { threshold = SNAP, margin = MARGIN } = {}) {
  let { x, y } = rect;
  if (x - margin < threshold) x = margin;
  else if (bounds.w - margin - (x + rect.w) < threshold) x = bounds.w - margin - rect.w;
  if (y - margin < threshold) y = margin;
  else if (bounds.h - margin - (y + rect.h) < threshold) y = bounds.h - margin - rect.h;
  return clampRect({ ...rect, x, y }, bounds, { margin });
}

/** Rectangle → anchored layout (the nearer horizontal and vertical edge). */
export function toAnchored(rect, bounds, extra = {}) {
  const ax = rect.x + rect.w / 2 <= bounds.w / 2 ? 'left' : 'right';
  const ay = rect.y + rect.h / 2 <= bounds.h / 2 ? 'top' : 'bottom';
  return {
    ax, ay,
    dx: Math.round(ax === 'left' ? rect.x : bounds.w - rect.x - rect.w),
    dy: Math.round(ay === 'top' ? rect.y : bounds.h - rect.y - rect.h),
    w: Math.round(rect.w),
    min: Boolean(extra.min),
  };
}

/** Anchored layout → rectangle inside the current bounds. */
export function fromAnchored(layout, bounds, heightFor, options = {}) {
  const w = fitWidth(layout.w, heightFor, bounds, options);
  const h = heightFor(w);
  const x = layout.ax === 'left' ? layout.dx : bounds.w - layout.dx - w;
  const y = layout.ay === 'top' ? layout.dy : bounds.h - layout.dy - h;
  return clampRect({ x, y, w, h }, bounds, options);
}

/** A remembered layout is used only when every field makes sense. */
export function validLayout(value) {
  if (!value || typeof value !== 'object') return null;
  if (!['left', 'right'].includes(value.ax) || !['top', 'bottom'].includes(value.ay)) return null;
  if (![value.dx, value.dy, value.w].every(finite) || value.w < 40 || value.w > 4000) return null;
  return { ax: value.ax, ay: value.ay, dx: Math.max(0, value.dx), dy: Math.max(0, value.dy), w: value.w, min: value.min === true };
}

export function loadLayout(id, storage = globalThis.localStorage) {
  try {
    const all = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}') || {};
    return validLayout(all[id]);
  } catch { return null; }
}

export function saveLayout(id, layout, storage = globalThis.localStorage) {
  try {
    const all = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}') || {};
    all[id] = layout;
    storage?.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch { return false; }
}

/** Height of a group strip of `count` 16:10 tiles: a column (one under another) or a row, 6 px apart. */
export const STRIP_GAP = 6;
export const stripHeight = (count, row) => (w) => {
  const n = Math.max(1, count);
  if (row) return Math.round(((w - STRIP_GAP * (n - 1)) / n) * 0.625);
  return Math.round(n * w * 0.625 + STRIP_GAP * (n - 1));
};

/** Free room the board keeps on the right for a worksheet: a window anchored to the right edge (not minimized). */
export function rightInset(layouts, boundsWidth) {
  let inset = 0;
  for (const layout of layouts) {
    if (!layout || layout.min || layout.ax !== 'right' || layout.w > boundsWidth * 0.5) continue;
    inset = Math.max(inset, layout.dx + layout.w + 12);
  }
  return inset;
}
