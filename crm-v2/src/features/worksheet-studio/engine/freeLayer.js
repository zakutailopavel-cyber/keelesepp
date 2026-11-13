// „Vaba kiht” — the free layer of an Õpik page (phase 3 of the Õpik editor, owner 2026-11-11 / 2026-11-13: teachers
// lay out the textbook themselves; „when the editor is ready it gives more ways to make sheets beautiful”).
//
// Pictures, shapes and text boxes placed anywhere on an A4 page, over the flowing blocks, stacked in layers.
// Stored on the document (optional — a sheet without it draws exactly as before):
//   doc.free = [{ id, kind: 'image' | 'shape' | 'text', page: 0…, x, y, w, h (mm on the 270 mm design page),
//                 z: layer (higher = on top), rotate: −180…180, locked,
//                 img (image), shape: rect | rounded | circle | oval (image / shape / text box),
//                 fill: none | lime | cream | sky | peach | navy (shape / text box), border: none | ink | lime,
//                 text, size (pt, text box), bold (text box) }]
// The flowing blocks do not move out of its way: the layer is decoration and illustration on top of the page (a
// sticker, a speech bubble, a frame round two tasks, a photo across a corner). An item whose page no longer exists
// (the sheet got shorter) stands on the last page. The student's phone column has no pages: pictures and text boxes
// come after the blocks in page / top order, shapes are left out (sheetFlow.css).

export const PAGE_W = 270;
export const PAGE_H = 381.86;
export const MAX_ITEMS = 40;
export const MIN_SIZE = 6;

export const FREE_KINDS = Object.freeze(['image', 'shape', 'text']);
export const FREE_SHAPES = Object.freeze(['rect', 'rounded', 'circle', 'oval']);
export const FREE_FILLS = Object.freeze(['none', 'lime', 'cream', 'sky', 'peach', 'navy']);
export const FREE_BORDERS = Object.freeze(['none', 'ink', 'lime']);

export const KIND_LABEL = { image: 'Pilt', shape: 'Kujund', text: 'Tekstikast' };
export const FILL_LABEL = { none: 'Läbipaistev', lime: 'Laimiroheline', cream: 'Kreem', sky: 'Helesinine', peach: 'Virsik', navy: 'Tumesinine' };

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const round = (value) => Math.round(value * 10) / 10;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let counter = 0;
const newFreeId = () => `f_${Date.now().toString(36)}${(counter++).toString(36)}`;

// a new item in the middle of the page, above the others
export function newFreeItem(kind, page = 0, items = []) {
  const z = items.reduce((top, item) => Math.max(top, num(item.z)), 0) + 1;
  const base = { id: newFreeId(), kind, page: Math.max(0, Math.floor(num(page))), z, rotate: 0, locked: false };
  if (kind === 'image') return { ...base, x: 85, y: 120, w: 100, h: 75, img: null, shape: 'rect', border: 'none' };
  if (kind === 'shape') return { ...base, x: 95, y: 150, w: 80, h: 80, shape: 'circle', fill: 'lime', border: 'none' };
  return { ...base, x: 75, y: 160, w: 120, h: 30, text: 'Kirjuta siia', size: 14, bold: true, shape: 'rounded', fill: 'cream', border: 'none' };
}

// a stored item made safe to draw: known values only, inside the page
export function normalizeFreeItem(item) {
  if (!item || typeof item !== 'object' || !FREE_KINDS.includes(item.kind)) return null;
  const w = clamp(num(item.w, 60), MIN_SIZE, PAGE_W);
  const h = clamp(num(item.h, 40), MIN_SIZE, PAGE_H);
  return {
    ...item,
    page: Math.max(0, Math.floor(num(item.page))),
    w, h,
    x: clamp(num(item.x), -w / 2, PAGE_W - w / 2),
    y: clamp(num(item.y), -h / 2, PAGE_H - h / 2),
    z: Math.floor(num(item.z)),
    rotate: clamp(num(item.rotate), -180, 180),
    locked: item.locked === true,
    shape: FREE_SHAPES.includes(item.shape) ? item.shape : 'rect',
    fill: FREE_FILLS.includes(item.fill) ? item.fill : 'none',
    border: FREE_BORDERS.includes(item.border) ? item.border : 'none',
    text: String(item.text || ''),
    size: clamp(num(item.size, 14), 8, 60),
    bold: item.bold === true,
  };
}

export const freeItemsOf = (doc) => (Array.isArray(doc?.free) ? doc.free.map(normalizeFreeItem).filter(Boolean) : []);

// the items drawn on page `page` of `pages`, bottom layer first (a missing page → the last one)
export function itemsOnPage(items, page, pages) {
  const last = Math.max(0, pages - 1);
  return items.filter((item) => Math.min(item.page, last) === page).sort((a, b) => a.z - b.z);
}

// the phone column: pictures and text boxes in page / top / left order
export const flowItems = (items) => items.filter((item) => item.kind !== 'shape' && (item.kind !== 'image' || item.img?.src))
  .sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);

// drag by (dx, dy) mm; the item keeps at least half of itself on the page
export function moveItem(item, dx, dy) {
  return { ...item, x: round(clamp(item.x + dx, -item.w / 2, PAGE_W - item.w / 2)), y: round(clamp(item.y + dy, -item.h / 2, PAGE_H - item.h / 2)) };
}
// resize from the bottom-right corner; `keep` keeps the proportions (pictures, circles)
export function resizeItem(item, dw, dh, keep = false) {
  let w = clamp(item.w + dw, MIN_SIZE, PAGE_W);
  let h = clamp(item.h + dh, MIN_SIZE, PAGE_H);
  if (keep) { const ratio = item.h / Math.max(1, item.w); h = clamp(w * ratio, MIN_SIZE, PAGE_H); w = h / ratio; }
  return { ...item, w: round(w), h: round(h) };
}

// layers: one step up / down (swap with the neighbour), to the top / bottom
export function restack(items, id, how) {
  const sorted = [...items].sort((a, b) => a.z - b.z);
  const index = sorted.findIndex((item) => item.id === id);
  if (index < 0) return items;
  const [item] = sorted.splice(index, 1);
  const at = how === 'top' ? sorted.length : how === 'bottom' ? 0 : how === 'up' ? Math.min(sorted.length, index + 1) : Math.max(0, index - 1);
  sorted.splice(at, 0, item);
  const z = Object.fromEntries(sorted.map((it, i) => [it.id, i + 1]));
  return items.map((it) => ({ ...it, z: z[it.id] }));
}

// Checks doc.free before a save (worksheetDocs.validateWorksheetDoc); returns a message or ''.
export function freeProblem(doc) {
  const free = doc?.free;
  if (free === undefined || free === null) return '';
  if (!Array.isArray(free)) return 'Vaba kiht on vigane.';
  if (free.length > MAX_ITEMS) return `Vabas kihis võib olla kuni ${MAX_ITEMS} elementi.`;
  const ids = new Set();
  for (const item of free) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return 'Vaba kihi element on vigane.';
    if (!FREE_KINDS.includes(item.kind)) return 'Vaba kihi elemendi liik on tundmatu.';
    if (!item.id || ids.has(item.id)) return 'Vaba kihi elemendil peab olema oma tunnus.';
    ids.add(item.id);
    if (![item.x, item.y, item.w, item.h].every((v) => Number.isFinite(Number(v)))) return 'Vaba kihi elemendi asukoht on vigane.';
    if (item.shape !== undefined && !FREE_SHAPES.includes(item.shape)) return 'Vaba kihi kujund on tundmatu.';
    if (item.fill !== undefined && !FREE_FILLS.includes(item.fill)) return 'Vaba kihi värv on tundmatu.';
    if (item.border !== undefined && !FREE_BORDERS.includes(item.border)) return 'Vaba kihi raam on tundmatu.';
    if (String(item.text || '').length > 600) return 'Tekstikasti tekst on liiga pikk (kuni 600 märki).';
  }
  return '';
}
