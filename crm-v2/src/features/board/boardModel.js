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

// a text box grows with what was written (lines × line height, longest line × average glyph width)
export function textBox(text = '', fontSize = 18, minWidth = 260) {
  const lines = String(text).split('\n');
  const longest = Math.max(1, ...lines.map((line) => line.length));
  return {
    w: Math.round(Math.min(1600, Math.max(minWidth, longest * fontSize * 0.6 + 16))),
    h: Math.round(Math.max(1, lines.length) * fontSize * 1.4 + 12),
  };
}

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

// images and PDFs are added by staff; only staff may move or delete them (also enforced by the Firestore rules)
export function teacherMaterial(element) {
  return ['image', 'pdf'].includes(element?.type);
}

export function movable(element) {
  return Boolean(element) && element.type !== 'stroke' && element.locked !== true;
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
