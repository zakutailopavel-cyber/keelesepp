/* global sessionStorage, localStorage */
// „Muuda” in the Õpik (owner 2026-11-11, iPad): the sheet on the screen opens in its editor in the same tab, and the way
// back („← Õpik”) lands on the same place in the book. The place lives in this tab's sessionStorage.
const PLACE_KEY = 'ks-book-return';
const SIDE_KEY = 'ks-book-side';

// The book sheet on the screen: the one that covers the line a third down the scrolling area, else the first one
// below it. Returns { id, offset } (offset = how far the sheet's top is above the area's top, px) or null.
export function sheetInView(container) {
  if (!container) return null;
  const box = container.getBoundingClientRect();
  // the visible part of the area (a phone scrolls the window, a tablet / computer the area itself)
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, globalThis.innerHeight || box.bottom);
  const line = top + Math.max(0, bottom - top) / 3;
  const sheets = [...container.querySelectorAll('[data-book-item]')];
  const hit = sheets.find((el) => { const r = el.getBoundingClientRect(); return r.top <= line && r.bottom > line; })
    || sheets.find((el) => el.getBoundingClientRect().top > line)
    || [...sheets].reverse().find((el) => el.getBoundingClientRect().bottom <= line);
  if (!hit) return null;
  return { id: hit.dataset.bookItem, offset: Math.max(0, Math.round(top - hit.getBoundingClientRect().top)) };
}

export function rememberBookPlace(place) {
  if (!place?.id) return;
  try { sessionStorage.setItem(PLACE_KEY, JSON.stringify({ id: place.id, offset: Number(place.offset) || 0, at: Date.now() })); } catch { /* storage may be disabled */ }
}

// read once: the place is used by the first book drawn after the editor, then forgotten (an hour at most)
export function takeBookPlace(now = Date.now()) {
  try {
    const raw = sessionStorage.getItem(PLACE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PLACE_KEY);
    const place = JSON.parse(raw);
    return place?.id && now - Number(place.at || 0) < 3600_000 ? place : null;
  } catch { return null; }
}

// Scrolls the container so the sheet's top is `offset` px above the area's top. False when the sheet is not drawn.
export function scrollToBookPlace(container, place) {
  if (!container || !place?.id) return false;
  const id = globalThis.CSS?.escape ? globalThis.CSS.escape(place.id) : place.id;
  const el = container.querySelector(`[data-book-item="${id}"]`);
  if (!el) return false;
  const delta = el.getBoundingClientRect().top - Math.max(container.getBoundingClientRect().top, 0) + (Number(place.offset) || 0);
  if (container.scrollHeight > container.clientHeight) container.scrollTop += delta;
  else globalThis.scrollBy?.(0, delta);
  return true;
}

// the settings panel on the left: open / closed, remembered in this browser; without a choice a tablet starts closed
export function initialSideOpen(tablet) {
  try {
    const stored = localStorage.getItem(SIDE_KEY);
    if (stored === 'open' || stored === 'closed') return stored === 'open';
  } catch { /* storage may be disabled */ }
  return !tablet;
}
export function rememberSideOpen(open) {
  try { localStorage.setItem(SIDE_KEY, open ? 'open' : 'closed'); } catch { /* storage may be disabled */ }
}
