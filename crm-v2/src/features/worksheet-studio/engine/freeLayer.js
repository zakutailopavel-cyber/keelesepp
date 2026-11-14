// „Vaba kiht” — the free layer of an Õpik page (phase 3 of the Õpik editor, owner 2026-11-11 / 2026-11-13: teachers
// lay out the textbook themselves; „when the editor is ready it gives more ways to make sheets beautiful”).
//
// Pictures, shapes and text boxes placed anywhere on an A4 page, over the flowing blocks, stacked in layers.
// Stored on the document (optional — a sheet without it draws exactly as before):
//   doc.free = [{ id, kind: 'image' | 'shape' | 'text', page: 0…, x, y, w, h (mm on the 270 mm design page),
//                 z: layer (higher = on top), rotate: −180…180, locked,
//                 img (image), shape: rect | rounded | circle | oval (image / shape / text box),
//                 fill: none | lime | cream | sky | peach | navy (shape / text box), border: none | ink | lime,
//                 text, size (pt, text box), bold (text box),
//                 font: body | head | hand, align: left | center | right, color: auto | ink | navy | green | red | white
//                 (text box, 2026-11-14; missing = body / left (a circle or oval: centre) / auto = white on navy) }]
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
export const FREE_SHAPES = Object.freeze(['rect', 'rounded', 'circle', 'oval', 'bubble', 'star', 'burst', 'ribbon']);
// Drawn shapes (2026-11-14): a speech bubble (tail in a corner: `tail` bl | br | tl | tr), a star, a sticker burst,
// a ribbon — an SVG behind the text, in the item's fill and frame colours. Shapes and text boxes only, not pictures.
export const SVG_SHAPES = Object.freeze(['bubble', 'star', 'burst', 'ribbon']);
export const IMAGE_SHAPES = Object.freeze(['rect', 'rounded', 'circle', 'oval']);
export const TAILS = Object.freeze(['bl', 'br', 'tl', 'tr']);
export const TAIL_LABEL = { bl: 'All vasakul', br: 'All paremal', tl: 'Üleval vasakul', tr: 'Üleval paremal' };
export const FILL_VALUE = { none: 'none', white: '#ffffff', lime: '#c6f432', cream: '#fbf6e9', sky: '#e3f1fb', peach: '#fde8dc', navy: '#1d2b4a' };
export const BORDER_VALUE = { none: null, ink: { color: '#111827', width: 0.6 }, lime: { color: '#c6f432', width: 1 } };
const starPoints = (n, inner) => Array.from({ length: n * 2 }, (_, i) => {
  const r = i % 2 ? inner : 50;
  const a = (Math.PI * i) / n - Math.PI / 2;
  return `${Math.round((50 + r * Math.cos(a)) * 10) / 10},${Math.round((50 + r * Math.sin(a)) * 10) / 10}`;
}).join(' ');
// the outline in a 100 × 100 box (a bubble's body is the top 80 %, its tail the rest; turned for the other corners)
export const SHAPE_ART = {
  bubble: { d: 'M10 0 H90 Q100 0 100 10 V70 Q100 80 90 80 H38 L16 100 L22 80 H10 Q0 80 0 70 V10 Q0 0 10 0 Z', stretch: true },
  star: { points: starPoints(5, 21), stretch: false },
  burst: { points: starPoints(14, 41), stretch: false },
  ribbon: { d: 'M0 12 H100 L88 50 L100 88 H0 L12 50 Z', stretch: true },
};
export const isDrawn = (item) => item.kind !== 'image' && SVG_SHAPES.includes(item.shape);
export const tailTransform = (tail) => ({ bl: '', br: 'translate(100 0) scale(-1 1)', tl: 'translate(0 100) scale(1 -1)', tr: 'translate(100 100) scale(-1 -1)' }[tail] || '');
export const FREE_FILLS = Object.freeze(['none', 'white', 'lime', 'cream', 'sky', 'peach', 'navy']);
export const FREE_BORDERS = Object.freeze(['none', 'ink', 'lime']);

export const TEXT_FONTS = Object.freeze(['body', 'head', 'hand']);
export const TEXT_ALIGNS = Object.freeze(['left', 'center', 'right']);
export const TEXT_COLORS = Object.freeze(['auto', 'ink', 'navy', 'green', 'red', 'white']);
export const TEXT_FONT_LABEL = { body: 'Tavaline', head: 'Pealkiri (ümar)', hand: 'Käekiri' };
export const TEXT_ALIGN_LABEL = { left: 'Vasakul', center: 'Keskel', right: 'Paremal' };
export const TEXT_COLOR_LABEL = { auto: 'Automaatne', ink: 'Must', navy: 'Tumesinine', green: 'Roheline', red: 'Punane', white: 'Valge' };
const TEXT_COLOR_VALUE = { ink: '#1f2d3d', navy: '#0b2a4f', green: '#267743', red: '#c0392b', white: '#ffffff' };
const TEXT_FONT_VALUE = { head: 'var(--font-head)', hand: 'var(--font-hand)' };
// the inline look of a text box's letters (FreeLayer.jsx: on the page, while typing, in the phone column)
export function textStyle(item) {
  const style = { fontSize: `${item.size}pt`, fontWeight: item.bold ? 800 : 400 };
  if (TEXT_FONT_VALUE[item.font]) style.fontFamily = TEXT_FONT_VALUE[item.font];
  if (TEXT_ALIGNS.includes(item.align)) style.textAlign = item.align;
  if (TEXT_COLOR_VALUE[item.color]) style.color = TEXT_COLOR_VALUE[item.color];
  return style;
}

export const KIND_LABEL = { image: 'Pilt', shape: 'Kujund', text: 'Tekstikast', line: 'Joon / nool' };
export const FILL_LABEL = { none: 'Läbipaistev', white: 'Valge', lime: 'Laimiroheline', cream: 'Kreem', sky: 'Helesinine', peach: 'Virsik', navy: 'Tumesinine' };

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const round = (value) => Math.round(value * 10) / 10;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let counter = 0;
const newFreeId = () => `f_${Date.now().toString(36)}${(counter++).toString(36)}`;

// a new item in the middle of the page, above the others (`patch`: e.g. { heads: 'end' } for an arrow)
export function newFreeItem(kind, page = 0, items = [], patch = {}) {
  const z = items.reduce((top, item) => Math.max(top, num(item.z)), 0) + 1;
  const base = { id: newFreeId(), kind, page: Math.max(0, Math.floor(num(page))), z, rotate: 0, locked: false };
  if (kind === 'image') return { ...base, x: 85, y: 120, w: 100, h: 75, img: null, shape: 'rect', border: 'none', ...patch };
  if (kind === 'shape') return { ...base, x: 95, y: 150, w: 80, h: 80, shape: 'circle', fill: 'lime', border: 'none', ...patch };
  if (kind === 'line') return { ...base, x: 80, y: 150, x2: 190, y2: 150, color: 'ink', stroke: 1, heads: 'none', dash: false, ...patch };
  return { ...base, x: 75, y: 160, w: 120, h: 30, text: 'Kirjuta siia', size: 14, bold: true, shape: 'rounded', fill: 'cream', border: 'none', ...patch };
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
    shape: (item.kind === 'image' ? IMAGE_SHAPES : FREE_SHAPES).includes(item.shape) ? item.shape : 'rect',
    tail: TAILS.includes(item.tail) ? item.tail : 'bl',
    fill: FREE_FILLS.includes(item.fill) ? item.fill : 'none',
    border: FREE_BORDERS.includes(item.border) ? item.border : 'none',
    text: String(item.text || ''),
    size: clamp(num(item.size, 14), 8, 60),
    bold: item.bold === true,
    opacity: clamp(num(item.opacity, 1), 0.2, 1),
    shadow: item.shadow === true,
    font: TEXT_FONTS.includes(item.font) ? item.font : 'body',
    align: TEXT_ALIGNS.includes(item.align) ? item.align : undefined,
    color: item.kind === 'text' && TEXT_COLORS.includes(item.color) ? item.color : 'auto',
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
    opacity: clamp(num(item.opacity, 1), 0.2, 1),
    shadow: item.shadow === true,
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
// Snapping while dragging (2026-11-14): an item that comes within SNAP_MM of the page's edge, margin or middle, or of
// another item's edge or middle on the same page, jumps onto it; `guides` are the lines to show ({ axis: 'x' | 'y',
// at: mm }). Lines snap by their ends. Alt while dragging = no snapping.
export const SNAP_MM = 2;
const PAGE_X = [0, 9, PAGE_W / 2, PAGE_W - 9, PAGE_W];
const PAGE_Y = [0, 11, PAGE_H / 2, PAGE_H - 9, PAGE_H];
const edgesX = (it) => (it.kind === 'line' ? [it.x, it.x2] : [it.x, it.x + it.w / 2, it.x + it.w]);
const edgesY = (it) => (it.kind === 'line' ? [it.y, it.y2] : [it.y, it.y + it.h / 2, it.y + it.h]);
function nearest(edges, targets, threshold) {
  let found = null;
  for (const edge of edges) {
    for (const at of targets) {
      const d = at - edge;
      if (Math.abs(d) <= threshold && (!found || Math.abs(d) < Math.abs(found.d))) found = { d, at };
    }
  }
  return found;
}
export function snapItem(item, others = [], threshold = SNAP_MM) {
  const xs = [...PAGE_X, ...others.flatMap(edgesX)];
  const ys = [...PAGE_Y, ...others.flatMap(edgesY)];
  const sx = nearest(edgesX(item), xs, threshold);
  const sy = nearest(edgesY(item), ys, threshold);
  if (!sx && !sy) return { item, guides: [] };
  const moved = moveItem(item, sx ? sx.d : 0, sy ? sy.d : 0);
  const guides = [];
  if (sx) guides.push({ axis: 'x', at: round(sx.at) });
  if (sy) guides.push({ axis: 'y', at: round(sy.at) });
  return { item: moved, guides };
}

// „Lehel”: one tap puts the item at the page's middle or against a margin (returns the patch to store)
export const PLACES = Object.freeze(['left', 'centerX', 'right', 'top', 'centerY', 'bottom']);
export const PLACE_LABEL = { left: 'Vasakule', centerX: 'Keskele ↔', right: 'Paremale', top: 'Üles', centerY: 'Keskele ↕', bottom: 'Alla' };
export function placeOnPage(item, how) {
  const line = item.kind === 'line';
  const x0 = line ? Math.min(item.x, item.x2) : item.x;
  const y0 = line ? Math.min(item.y, item.y2) : item.y;
  const w = line ? Math.abs(item.x2 - item.x) : item.w;
  const h = line ? Math.abs(item.y2 - item.y) : item.h;
  const target = { left: [PAGE_X[1], null], centerX: [(PAGE_W - w) / 2, null], right: [PAGE_W - PAGE_X[1] - w, null],
    top: [null, PAGE_Y[1]], centerY: [null, (PAGE_H - h) / 2], bottom: [null, PAGE_H - 9 - h] }[how];
  if (!target) return {};
  const dx = target[0] === null ? 0 : target[0] - x0;
  const dy = target[1] === null ? 0 : target[1] - y0;
  const moved = moveItem(item, dx, dy);
  return line ? { x: moved.x, y: moved.y, x2: moved.x2, y2: moved.y2 } : { x: moved.x, y: moved.y };
}

// see-through and shadow (2026-11-14): `opacity` 0.2…1 (missing = 1), `shadow` true / missing
export const OPACITIES = Object.freeze([1, 0.8, 0.6, 0.4, 0.2]);
export const lookStyle = (item) => ({
  ...(item.opacity !== undefined && item.opacity < 1 ? { opacity: item.opacity } : {}),
  ...(item.shadow ? { filter: 'drop-shadow(0 1.2mm 1.6mm rgba(15, 30, 50, 0.28))' } : {}),
});

// Several items at once (2026-11-14): Shift / Ctrl / ⌘ + tap (or „Vali mitu”) adds an item to the selection; a drag,
// the arrow keys, align, spread, layer, copy and delete then act on all of them. Locked items stay where they are.
export const boxOf = (item) => (item.kind === 'line'
  ? { x0: Math.min(item.x, item.x2), y0: Math.min(item.y, item.y2), x1: Math.max(item.x, item.x2), y1: Math.max(item.y, item.y2) }
  : { x0: item.x, y0: item.y, x1: item.x + item.w, y1: item.y + item.h });
export const GROUP_ALIGNS = Object.freeze(['left', 'centerX', 'right', 'top', 'centerY', 'bottom']);
export const GROUP_ALIGN_LABEL = { left: 'Vasakud servad', centerX: 'Keskjoon ↕', right: 'Paremad servad', top: 'Ülemised servad', centerY: 'Keskjoon ↔', bottom: 'Alumised servad' };
// Copies to other pages (2026-11-14): the chosen items, same place and look, on page `to` ('all' = every other
// page), on top of the layers, unlocked, new ids. Returns the new list and the copies' ids; nothing past MAX_ITEMS.
export function copyToPages(items, ids, to, pages) {
  const last = Math.max(0, pages - 1);
  const chosen = items.filter((it) => ids.includes(it.id)).sort((a, b) => a.z - b.z);
  const targets = (from) => (to === 'all' ? Array.from({ length: pages }, (_, i) => i).filter((p) => p !== from) : [to]);
  let z = items.reduce((top, it) => Math.max(top, num(it.z)), 0);
  const copies = [];
  for (const it of chosen) {
    for (const page of targets(Math.min(it.page, last))) {
      if (items.length + copies.length >= MAX_ITEMS) break;
      copies.push({ ...it, id: newFreeId(), page, z: (z += 1), locked: false });
    }
  }
  return { items: [...items, ...copies], ids: copies.map((c) => c.id), full: copies.length < chosen.length * (to === 'all' ? Math.max(0, pages - 1) : 1) };
}
// the clipboard of the free layer: kept in the browser so it can be pasted into another lesson's Õpik too
export const CLIP_KEY = 'ks.freeLayerClipboard';
export const clipOf = (items, ids) => items.filter((it) => ids.includes(it.id)).sort((a, b) => a.z - b.z).map((it) => { const rest = { ...it }; delete rest.id; delete rest.page; delete rest.z; delete rest.locked; return rest; });
// paste the clipboard on page `page`; if the same things already stand there, the copies shift by 6 mm to show
export function pasteClip(items, clip, page) {
  let z = items.reduce((top, it) => Math.max(top, num(it.z)), 0);
  const same = clip.every((c) => items.some((it) => it.page === page && it.kind === c.kind && it.x === c.x && it.y === c.y));
  const room = Math.max(0, MAX_ITEMS - items.length);
  const copies = clip.slice(0, room).map((c) => {
    const base = normalizeFreeItem({ ...c, id: newFreeId(), page, z: (z += 1), locked: false });
    return base && same ? moveItem(base, 6, 6) : base;
  }).filter(Boolean);
  return { items: [...items, ...copies], ids: copies.map((c) => c.id), full: copies.length < clip.length };
}

// a frame drawn on page `page` (mm, any corner order) catches every item of that page it touches
export function itemsInFrame(items, page, pages, frame) {
  const f = { x0: Math.min(frame.x0, frame.x1), x1: Math.max(frame.x0, frame.x1), y0: Math.min(frame.y0, frame.y1), y1: Math.max(frame.y0, frame.y1) };
  return itemsOnPage(items, page, pages).filter((it) => {
    const b = boxOf(it);
    return b.x0 <= f.x1 && b.x1 >= f.x0 && b.y0 <= f.y1 && b.y1 >= f.y0;
  }).map((it) => it.id);
}
// move every selected, unlocked item by (dx, dy) mm
export const moveMany = (items, ids, dx, dy) => items.map((it) => (ids.includes(it.id) && !it.locked ? moveItem(it, dx, dy) : it));
// line the selected items up with each other (their common box)
export function alignMany(items, ids, how) {
  const chosen = items.filter((it) => ids.includes(it.id));
  if (chosen.length < 2) return items;
  const boxes = chosen.map(boxOf);
  const all = { x0: Math.min(...boxes.map((b) => b.x0)), y0: Math.min(...boxes.map((b) => b.y0)), x1: Math.max(...boxes.map((b) => b.x1)), y1: Math.max(...boxes.map((b) => b.y1)) };
  return items.map((it) => {
    if (!ids.includes(it.id) || it.locked) return it;
    const b = boxOf(it);
    const dx = how === 'left' ? all.x0 - b.x0 : how === 'right' ? all.x1 - b.x1 : how === 'centerX' ? (all.x0 + all.x1) / 2 - (b.x0 + b.x1) / 2 : 0;
    const dy = how === 'top' ? all.y0 - b.y0 : how === 'bottom' ? all.y1 - b.y1 : how === 'centerY' ? (all.y0 + all.y1) / 2 - (b.y0 + b.y1) / 2 : 0;
    return moveItem(it, dx, dy);
  });
}
// equal gaps between three or more selected items, the first and the last stay (`axis`: 'x' | 'y')
export function spreadMany(items, ids, axis) {
  const chosen = items.filter((it) => ids.includes(it.id)).map((it) => ({ it, b: boxOf(it) }));
  if (chosen.length < 3) return items;
  const lo = axis === 'x' ? 'x0' : 'y0';
  const hi = axis === 'x' ? 'x1' : 'y1';
  chosen.sort((a, b) => a.b[lo] - b.b[lo]);
  const span = chosen[chosen.length - 1].b[hi] - chosen[0].b[lo];
  const filled = chosen.reduce((sum, c) => sum + (c.b[hi] - c.b[lo]), 0);
  const gap = (span - filled) / (chosen.length - 1);
  const moved = {};
  let at = chosen[0].b[lo];
  for (const c of chosen) {
    const d = at - c.b[lo];
    moved[c.it.id] = c.it.locked ? c.it : moveItem(c.it, axis === 'x' ? d : 0, axis === 'y' ? d : 0);
    at += c.b[hi] - c.b[lo] + gap;
  }
  return items.map((it) => moved[it.id] || it);
}
// the selection to the top / bottom of the layers, keeping its own order
export function restackMany(items, ids, how) {
  const order = items.filter((it) => ids.includes(it.id)).sort((a, b) => (how === 'bottom' ? b.z - a.z : a.z - b.z));
  return order.reduce((list, it) => restack(list, it.id, how), items);
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
    if (item.kind === 'line' && item.color !== undefined && !LINE_COLORS.includes(item.color)) return 'Joone värv on tundmatu.';
    if (item.kind === 'text' && item.color !== undefined && !TEXT_COLORS.includes(item.color)) return 'Teksti värv on tundmatu.';
    if (item.font !== undefined && !TEXT_FONTS.includes(item.font)) return 'Teksti kiri on tundmatu.';
    if (item.align !== undefined && item.align !== null && !TEXT_ALIGNS.includes(item.align)) return 'Teksti joondus on tundmatu.';
    if (item.heads !== undefined && !LINE_HEADS.includes(item.heads)) return 'Joone otsad on tundmatud.';
    if (item.shape !== undefined && !FREE_SHAPES.includes(item.shape)) return 'Vaba kihi kujund on tundmatu.';
    if (item.tail !== undefined && !TAILS.includes(item.tail)) return 'Mulli saba asend on tundmatu.';
    if (item.fill !== undefined && !FREE_FILLS.includes(item.fill)) return 'Vaba kihi värv on tundmatu.';
    if (item.border !== undefined && !FREE_BORDERS.includes(item.border)) return 'Vaba kihi raam on tundmatu.';
    if (item.opacity !== undefined && !(Number(item.opacity) >= 0.2 && Number(item.opacity) <= 1)) return 'Läbipaistvus on vigane.';
    if (String(item.text || '').length > 600) return 'Tekstikasti tekst on liiga pikk (kuni 600 märki).';
  }
  return '';
}
