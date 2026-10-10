// Pure geometry for the student board (same world coordinates as the CRM v1 board: pixels at 100 %, origin top-left).

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 3;
export const COLORS = ['#1C2B3A', '#C9882A', '#2F5D50', '#B42318', '#175CD3', '#7A5AF8'];
// Live Classroom palette (12 colours, as in the room style panel).
export const ROOM_COLORS = ['#1C2B3A', '#98A2B3', '#E879F9', '#9333EA', '#2563EB', '#38BDF8', '#F59E0B', '#EA580C', '#0F766E', '#22C55E', '#F87171', '#DC2626'];
// Size presets: pen width and text size.
export const SIZES = { S: { pen: 2, font: 14 }, M: { pen: 4, font: 18 }, L: { pen: 8, font: 26 }, XL: { pen: 14, font: 36 } };
// text fonts on the board (the key is stored on the element; the Firestore rules allow exactly these keys)
export const FONTS = {
  sans: { label: 'Tavaline', css: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif' },
  serif: { label: 'Raamat', css: 'Georgia, "Times New Roman", serif' },
  hand: { label: 'Käsikiri', css: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive' },
  mono: { label: 'Kirjutusmasin', css: '"Courier New", ui-monospace, monospace' },
};
export const fontCss = (key) => (FONTS[key] || FONTS.sans).css;

// a text box grows with what was written: long lines wrap at a readable width (owner 2026-10-10: a pasted paragraph
// became one 1600-px line with its second line cut off). The height counts the wrapped lines. `width` keeps a width the
// user chose (dragging the box sideways); otherwise the box is as wide as its longest line, at most TEXT_MAX_WIDTH.
export const TEXT_MAX_WIDTH = 640;
const GLYPH = 0.56; // average letter width per font size
const TEXT_PAD = 12; // .sb-text padding left + right
export function textBox(text = '', fontSize = 18, minWidth = 260, { width } = {}) {
  const lines = String(text).split('\n');
  const longest = Math.max(1, ...lines.map((line) => line.length));
  const w = Math.round(width ? Math.max(minWidth, width) : Math.min(TEXT_MAX_WIDTH, Math.max(minWidth, longest * fontSize * GLYPH + TEXT_PAD + 4)));
  const perLine = Math.max(1, Math.floor((w - TEXT_PAD) / (fontSize * GLYPH)));
  const rows = lines.reduce((n, line) => n + Math.max(1, Math.ceil(line.length / perLine)), 0);
  return { w, h: Math.round(rows * fontSize * 1.35 + 10) };
}

// the size of a text element after editing: as wide as its lines need, never narrower than it already is (a width the
// user dragged), and boxes from before wrapping (up to 1600 wide) come back to a readable TEXT_MAX_WIDTH
export const textBoxOf = (element, text = element?.text || '', fontSize = element?.fontSize || 18) => textBox(text, fontSize, Math.max(120, Math.min(TEXT_MAX_WIDTH, element?.w || 0)));

// the topmost text or note under a board point (for editing with a double click or the text tool)
export function textAt(elements = [], point) {
  for (let index = elements.length - 1; index >= 0; index -= 1) {
    const element = elements[index];
    if ((element.type === 'text' || element.type === 'note')
      && point.x >= element.x && point.x <= element.x + element.w && point.y >= element.y && point.y <= element.y + element.h) return element;
  }
  return null;
}
export const NOTE_COLORS = ['#FEF3C7', '#DCFCE7', '#DBEAFE', '#FCE7F3'];
export const SHAPE_TOOLS = ['rect', 'ellipse', 'arrow'];

export function screenToWorld(point, view) {
  return { x: (point.x - view.x) / view.scale, y: (point.y - view.y) / view.scale };
}

export function clampScale(scale) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
}

// Zoom around a screen point so that the point under the cursor stays where it is.
export function zoomAt(view, factor, point) {
  const scale = clampScale(view.scale * factor);
  const world = screenToWorld(point, view);
  return { scale, x: point.x - world.x * scale, y: point.y - world.y * scale };
}

export function pathFor(points = []) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y}${rest.map((point) => ` L ${point.x} ${point.y}`).join('')}`;
}

// Rectangles and ellipses are stored with a positive size; arrows keep their direction (w/h may be negative).
export function shapeFromDrag(shape, start, end) {
  if (shape === 'arrow' || shape === 'line') return { x: start.x, y: start.y, w: end.x - start.x, h: end.y - start.y };
  return { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y) };
}

export function arrowHead(element, size = 14) {
  const x2 = element.x + element.w;
  const y2 = element.y + element.h;
  const angle = Math.atan2(element.h, element.w);
  const left = { x: x2 - size * Math.cos(angle - Math.PI / 7), y: y2 - size * Math.sin(angle - Math.PI / 7) };
  const right = { x: x2 - size * Math.cos(angle + Math.PI / 7), y: y2 - size * Math.sin(angle + Math.PI / 7) };
  return `${left.x},${left.y} ${x2},${y2} ${right.x},${right.y}`;
}

export function elementBounds(element) {
  if (element.type === 'stroke') {
    const xs = (element.points || []).map((point) => point.x);
    const ys = (element.points || []).map((point) => point.y);
    if (!xs.length) return null;
    return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
  }
  if (![element.x, element.y, element.w, element.h].every(Number.isFinite)) return null;
  return { x1: Math.min(element.x, element.x + element.w), y1: Math.min(element.y, element.y + element.h), x2: Math.max(element.x, element.x + element.w), y2: Math.max(element.y, element.y + element.h) };
}

// "Sobita": show every element, never zooming in beyond 100 %.
export function fitView(elements, width, height, padding = 40) {
  const boxes = elements.map(elementBounds).filter(Boolean);
  if (!boxes.length || !width || !height) return { x: 0, y: 0, scale: 1 };
  const x1 = Math.min(...boxes.map((box) => box.x1));
  const y1 = Math.min(...boxes.map((box) => box.y1));
  const x2 = Math.max(...boxes.map((box) => box.x2));
  const y2 = Math.max(...boxes.map((box) => box.y2));
  const scale = clampScale(Math.min(1, (width - padding * 2) / Math.max(1, x2 - x1), (height - padding * 2) / Math.max(1, y2 - y1)));
  return { scale, x: padding - x1 * scale, y: padding - y1 * scale };
}

// The board is a sheet with edges (owner, 2026-10-04), not an endless canvas: 1600 × 1000 board units, grown only
// where older content already lies outside it, so nothing drawn before is ever hidden.
export const PAGE = Object.freeze({ w: 1600, h: 1000 });
// a worksheet page is as wide as the worksheet and as tall as it is
export const WORKSHEET_WIDTH = 1000;
export const worksheetPageTitle = (title) => `Tööleht: ${String(title || 'Tööleht').trim()}`.slice(0, 200);
export function pageBounds(elements = [], margin = 40, base = PAGE) {
  const boxes = elements.map(elementBounds).filter(Boolean);
  const x1 = Math.min(0, ...boxes.map((box) => box.x1 - margin));
  const y1 = Math.min(0, ...boxes.map((box) => box.y1 - margin));
  const x2 = Math.max(base.w, ...boxes.map((box) => box.x2 + margin));
  const y2 = Math.max(base.h, ...boxes.map((box) => box.y2 + margin));
  return { x1, y1, x2, y2 };
}
// the whole sheet on screen
export function fitPage(bounds, width, height, padding = 16) {
  if (!width || !height) return { x: 0, y: 0, scale: 1 };
  const w = bounds.x2 - bounds.x1;
  const h = bounds.y2 - bounds.y1;
  const scale = clampScale(Math.min((width - padding * 2) / w, (height - padding * 2) / h));
  return { scale, x: (width - w * scale) / 2 - bounds.x1 * scale, y: (height - h * scale) / 2 - bounds.y1 * scale };
}
// the sheet's width fills the screen, top of the sheet at the top (a worksheet is read from the top)
export function fitWidth(bounds, width, padding = 16) {
  if (!width) return { x: 0, y: 0, scale: 1 };
  const scale = clampScale((width - padding * 2) / (bounds.x2 - bounds.x1));
  return { scale, x: padding - bounds.x1 * scale, y: padding - bounds.y1 * scale };
}
// panning never pushes the sheet off the screen: at least `keep` pixels of it stay visible on every side
export function clampView(view, bounds, width, height, keep = 80) {
  if (!width || !height) return view;
  const left = view.x + bounds.x1 * view.scale;
  const right = view.x + bounds.x2 * view.scale;
  const top = view.y + bounds.y1 * view.scale;
  const bottom = view.y + bounds.y2 * view.scale;
  let { x, y } = view;
  if (right < keep) x += keep - right;
  if (left > width - keep) x -= left - (width - keep);
  if (bottom < keep) y += keep - bottom;
  if (top > height - keep) y -= top - (height - keep);
  return x === view.x && y === view.y ? view : { ...view, x, y };
}
// new content stays on the sheet
export function clampPoint(point, bounds) {
  return { x: Math.min(bounds.x2, Math.max(bounds.x1, point.x)), y: Math.min(bounds.y2, Math.max(bounds.y1, point.y)) };
}

// teacher content: images/PDFs (only staff add them) and everything a teacher drew or wrote (byStaff); only staff
// may move, change or delete it (also enforced by the Firestore rules)
export function teacherMaterial(element) {
  return (['image', 'pdf'].includes(element?.type) && element?.byStudent !== true) || element?.byStaff === true;
}

// anything not locked can be selected, moved and resized (lines too, since 2026-10-09)
export function movable(element) {
  return Boolean(element) && element.locked !== true;
}

// Natural size of an image, so it keeps its proportions on the board (A4 portrait when it cannot be read).
export function imageSize(url) {
  return new Promise((resolve) => {
    const ImageCtor = globalThis.Image;
    if (!ImageCtor) { resolve({ width: 1000, height: 1400 }); return; }
    const image = new ImageCtor();
    image.onload = () => resolve({ width: image.naturalWidth || 1000, height: image.naturalHeight || 1400 });
    image.onerror = () => resolve({ width: 1000, height: 1400 });
    image.src = url;
  });
}

// Wheel / trackpad: a plain wheel or two-finger scroll moves the board (like a page); a pinch or Ctrl/⌘ + wheel zooms.
export function wheelView(view, { deltaX = 0, deltaY = 0, ctrlKey = false, metaKey = false, deltaMode = 0 }, point) {
  const unit = deltaMode === 1 ? 16 : 1; // lines → pixels (Firefox)
  if (ctrlKey || metaKey) return zoomAt(view, Math.min(1.25, Math.max(0.8, Math.exp(-deltaY * unit * 0.01))), point);
  return { ...view, x: view.x - deltaX * unit, y: view.y - deltaY * unit };
}

// Two fingers: the board follows the fingers' centre and scales with their distance (from the view at the start).
export function pinchView(start, [a0, b0], [a1, b1]) {
  const centre = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const c0 = centre(a0, b0);
  const c1 = centre(a1, b1);
  const factor = Math.hypot(b1.x - a1.x, b1.y - a1.y) / Math.max(1, Math.hypot(b0.x - a0.x, b0.y - a0.y));
  const zoomed = zoomAt(start, factor, c0);
  return { ...zoomed, x: zoomed.x + c1.x - c0.x, y: zoomed.y + c1.y - c0.y };
}

// ── selection, moving, resizing ──────────────────────────────────
// the box around several elements (null when there is nothing)
export function unionBounds(elements = []) {
  const boxes = elements.map(elementBounds).filter(Boolean);
  if (!boxes.length) return null;
  return { x1: Math.min(...boxes.map((b) => b.x1)), y1: Math.min(...boxes.map((b) => b.y1)), x2: Math.max(...boxes.map((b) => b.x2)), y2: Math.max(...boxes.map((b) => b.y2)) };
}
// does an element lie (partly) inside a dragged frame
export function touchesBox(element, box) {
  const b = elementBounds(element);
  return Boolean(b) && b.x1 <= box.x2 && b.x2 >= box.x1 && b.y1 <= box.y2 && b.y2 >= box.y1;
}
export const frameFrom = (a, b) => ({ x1: Math.min(a.x, b.x), y1: Math.min(a.y, b.y), x2: Math.max(a.x, b.x), y2: Math.max(a.y, b.y) });
const round2 = (n) => Math.round(n * 100) / 100;
// the fields that move an element by dx, dy (a line moves all its points)
export function movePatch(element, dx, dy) {
  if (element.type === 'stroke') return { points: (element.points || []).map((p) => ({ x: round2(p.x + dx), y: round2(p.y + dy) })) };
  return { x: Math.round(element.x + dx), y: Math.round(element.y + dy) };
}
// Dragging the corner handle by dx, dy: pictures and PDFs keep their proportions, text grows its letters with the box,
// a line is scaled around its top-left corner. Never smaller than 12 board units.
export function resizePatch(element, dx, dy) {
  const box = elementBounds(element);
  if (!box) return {};
  const w0 = Math.max(1, box.x2 - box.x1);
  const h0 = Math.max(1, box.y2 - box.y1);
  let w = Math.max(12, w0 + dx);
  let h = Math.max(12, h0 + dy);
  if (element.type === 'image' || element.type === 'pdf') { const k = Math.max(w / w0, h / h0); w = w0 * k; h = h0 * k; }
  if (element.type === 'stroke') {
    const kx = w / w0;
    const ky = h / h0;
    return { points: (element.points || []).map((p) => ({ x: round2(box.x1 + (p.x - box.x1) * kx), y: round2(box.y1 + (p.y - box.y1) * ky) })) };
  }
  if (element.type === 'shape' && (element.shape === 'arrow' || element.shape === 'line')) {
    return { w: Math.round(element.w * (w / w0)), h: Math.round(element.h * (h / h0)) };
  }
  if (element.type === 'text') {
    // sideways: the lines re-wrap at the new width and the letters stay; down or diagonally: the letters grow with the box
    if (Math.abs(dx) > Math.abs(dy)) return textBox(element.text || '', element.fontSize || 18, 60, { width: w });
    const fontSize = Math.max(8, Math.min(96, Math.round((element.fontSize || 18) * (h / h0))));
    return { ...textBox(element.text || '', fontSize, 60, { width: w0 * (fontSize / (element.fontSize || 18)) }), fontSize };
  }
  return { w: Math.round(w), h: Math.round(h) };
}
// a copy of an element for „Kopeeri” / paste, shifted so it is visible next to the original
export function copyData(element, offset = 24) {
  const { id, updatedAt, updatedByUid, updatedByName, lastClientId, revision, locked, ...data } = element; // eslint-disable-line no-unused-vars
  return { ...data, ...movePatch(element, offset, offset), ...(['image', 'pdf'].includes(element.type) ? { locked: false } : {}) };
}

// ── the sheet grows while you draw ───────────────────────────────
// drawing may go this far past the current edge; the sheet then grows to hold it
export const GROW = 600;
export const growBounds = (bounds, by = GROW) => ({ x1: bounds.x1 - by, y1: bounds.y1 - by, x2: bounds.x2 + by, y2: bounds.y2 + by });

// ── paper and marker ─────────────────────────────────────────────
export const BACKGROUNDS = [
  ['dots', 'Täpid'],
  ['grid', 'Ruudud'],
  ['lines', 'Jooned'],
  ['plain', 'Tühi'],
];
export const backgroundOf = (backgrounds = {}, pageKey = 'board') => (BACKGROUNDS.some(([key]) => key === backgrounds[pageKey]) ? backgrounds[pageKey] : 'dots');
// a highlighter is a see-through line (8-digit hex colour), drawn wide
export const MARKER_COLORS = ['#FDE047', '#86EFAC', '#F9A8D4', '#93C5FD'];
export const markerColor = (hex) => `${String(hex).slice(0, 7)}66`;
export const isMarker = (element) => element?.type === 'stroke' && /^#[0-9a-f]{8}$/i.test(String(element.color || ''));
export const markerWidth = (penWidth = 4) => Math.min(40, Math.max(12, penWidth * 4));
