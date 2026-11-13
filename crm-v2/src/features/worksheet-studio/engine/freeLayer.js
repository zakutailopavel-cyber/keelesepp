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
// A line / arrow (kind 'line', 2026-11-13) has two ends instead of a box: x, y (start) and x2, y2 (end), plus
//   color: ink | navy | green | lime | red, stroke (mm), heads: none | end | both, dash.
// The flowing blocks do not move out of its way: the layer is decoration and illustration on top of the page (a
// sticker, a speech bubble, a frame round two tasks, a photo across a corner). An item whose page no longer exists
// (the sheet got shorter) stands on the last page. The student's phone column has no pages: pictures and text boxes
// come after the blocks in page / top order, shapes are left out (sheetFlow.css).

export const PAGE_W = 270;
export const PAGE_H = 381.86;
export const MAX_ITEMS = 40;
export const MIN_SIZE = 6;

export const FREE_KINDS = Object.freeze(['image', 'shape', 'text', 'line']);
export const LINE_COLORS = Object.freeze(['ink', 'navy', 'green', 'lime', 'red']);
export const LINE_STROKES = Object.freeze([0.5, 1, 1.5, 2.5]);
export const LINE_HEADS = Object.freeze(['none', 'end', 'both']);
export const LINE_COLOR_LABEL = { ink: 'Must', navy: 'Tumesinine', green: 'Roheline', lime: 'Laimiroheline', red: 'Punane' };
export const LINE_COLOR_VALUE = { ink: '#111827', navy: '#1d2b4a', green: '#3a7d5c', lime: '#a3d10f', red: '#c0392b' };
export const HEADS_LABEL = { none: 'Ilma noolteta', end: 'Nool lõpus', both: 'Nool mõlemas otsas' };
export const FREE_SHAPES = Object.freeze(['rect', 'rounded', 'circle', 'oval']);
export const FREE_FILLS = Object.freeze(['none', 'lime', 'cream', 'sky', 'peach', 'navy']);
export const FREE_BORDERS = Object.freeze(['none', 'ink', 'lime']);

export const KIND_LABEL = { image: 'Pilt', shape: 'Kujund', text: 'Tekstikast', line: 'Joon / nool' };
export const FILL_LABEL = { none: 'Läbipaistev', lime: 'Laimiroheline', cream: 'Kreem', sky: 'Helesinine', peach: 'Virsik', navy: 'Tumesinine' };

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const round = (value) => Math.round(value * 10) / 10;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let counter = 0;
const newFreeId = () => `f_${Date.now().toString(36)}${(counter++).toString(36)}`;

// a new item in the middle of the page, above the others (`patch`: e.g. { heads: 'end' } for an arrow)
export function newFreeItem(kind, page = 0, items = [], patch = {}) {
  const z = items.reduce((top, item) => Math.max(top, num(item.z)), 0) + 1;
  const base = { id: newFreeId(), kind, page: Math.max(0, Math.floor(num(page))), z, rotate: 0, locked: false };
  if (kind === 'image') return { ...base, x: 85, y: 120, w: 100, h: 75, img: null, shape: 'rect', border: 'none' };
  if (kind === 'shape') return { ...base, x: 95, y: 150, w: 80, h: 80, shape: 'circle', fill: 'lime', border: 'none' };
  if (kind === 'line') return { ...base, x: 80, y: 150, x2: 190, y2: 150, color: 'ink', stroke: 1, heads: 'none', dash: false, ...patch };
  return { ...base, x: 75, y: 160, w: 120, h: 30, text: 'Kirjuta siia', size: 14, bold: true, shape: 'rounded', fill: 'cream', border: 'none' };
}

// a stored item made safe to draw: known values only, inside the page
export function normalizeFreeItem(item) {
  if (!item || typeof item !== 'object' || !FREE_KINDS.includes(item.kind)) return null;
  if (item.kind === 'line') return normalizeLine(item);
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

function normalizeLine(item) {
  const x = clamp(num(item.x), 0, PAGE_W);
  const y = clamp(num(item.y), 0, PAGE_H);
  const x2 = clamp(num(item.x2, x + 60), 0, PAGE_W);
  const y2 = clamp(num(item.y2, y), 0, PAGE_H);
  return {
    ...item, x, y, x2, y2,
    w: Math.abs(x2 - x), h: Math.abs(y2 - y),
    page: Math.max(0, Math.floor(num(item.page))),
    z: Math.floor(num(item.z)),
    locked: item.locked === true,
    color: LINE_COLORS.includes(item.color) ? item.color : 'ink',
    stroke: clamp(num(item.stroke, 1), 0.3, 4),
    heads: LINE_HEADS.includes(item.heads) ? item.heads : 'none',
    dash: item.dash === true,
  };
}
// a line's length and angle (degrees) on the page
export const lineGeom = (item) => ({ length: Math.hypot(item.x2 - item.x, item.y2 - item.y), angle: (Math.atan2(item.y2 - item.y, item.x2 - item.x) * 180) / Math.PI });
// drag one end of a line (`end`: 'start' | 'end'); the end stays on the page
export function moveEnd(item, end, dx, dy) {
  if (end === 'start') return { ...item, x: round(clamp(item.x + dx, 0, PAGE_W)), y: round(clamp(item.y + dy, 0, PAGE_H)) };
  return { ...item, x2: round(clamp(item.x2 + dx, 0, PAGE_W)), y2: round(clamp(item.y2 + dy, 0, PAGE_H)) };
}

export const freeItemsOf = (doc) => (Array.isArray(doc?.free) ? doc.free.map(normalizeFreeItem).filter(Boolean) : []);

// the items drawn on page `page` of `pages`, bottom layer first (a missing page → the last one)
export function itemsOnPage(items, page, pages) {
  const last = Math.max(0, pages - 1);
  return items.filter((item) => Math.min(item.page, last) === page).sort((a, b) => a.z - b.z);
}

// the phone column: pictures and text boxes in page / top / left order
export const flowItems = (items) => items.filter((item) => item.kind !== 'shape' && item.kind !== 'line' && (item.kind !== 'image' || item.img?.src))
  .sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);

// drag by (dx, dy) mm; the item keeps at least half of itself on the page
export function moveItem(item, dx, dy) {
  if (item.kind === 'line') {
    // both ends move together and stay on the page
    const ddx = clamp(dx, -Math.min(item.x, item.x2), PAGE_W - Math.max(item.x, item.x2));
    const ddy = clamp(dy, -Math.min(item.y, item.y2), PAGE_H - Math.max(item.y, item.y2));
    return { ...item, x: round(item.x + ddx), y: round(item.y + ddy), x2: round(item.x2 + ddx), y2: round(item.y2 + ddy) };
  }
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
    const coords = item.kind === 'line' ? [item.x, item.y, item.x2, item.y2] : [item.x, item.y, item.w, item.h];
    if (!coords.every((v) => v !== null && v !== '' && Number.isFinite(Number(v)))) return 'Vaba kihi elemendi asukoht on vigane.';
    if (item.color !== undefined && !LINE_COLORS.includes(item.color)) return 'Joone värv on tundmatu.';
    if (item.heads !== undefined && !LINE_HEADS.includes(item.heads)) return 'Joone otsad on tundmatud.';
    if (item.shape !== undefined && !FREE_SHAPES.includes(item.shape)) return 'Vaba kihi kujund on tundmatu.';
    if (item.fill !== undefined && !FREE_FILLS.includes(item.fill)) return 'Vaba kihi värv on tundmatu.';
    if (item.border !== undefined && !FREE_BORDERS.includes(item.border)) return 'Vaba kihi raam on tundmatu.';
    if (String(item.text || '').length > 600) return 'Tekstikasti tekst on liiga pikk (kuni 600 märki).';
  }
  return '';
}
