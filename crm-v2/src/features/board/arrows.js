// Arrows and pointers on the board (owner 2026-11-04: „нормальные стрелки и указатели”). Pure geometry, board units.
//
// An arrow is a `shape` element: it starts at (x, y) and ends at (x + w, y + h) (w / h may be negative). Optional fields,
// all backward compatible (an old arrow has none of them and draws as before):
//   bend   — a curved arrow: how far the curve's control point lies from the straight line's middle, sideways
//            (perpendicular, positive = to the left of the direction start → end). 0 or missing = straight.
//   heads  — 'end' (default for 'arrow'), 'both' (double-headed), 'none'.
//   text   — shape 'callout' only: a pointer with a label. The tip is the start (x, y), the label sits at the end.

export const ARROW_SHAPES = ['arrow', 'line', 'callout'];
export const isArrowLike = (element) => element?.type === 'shape' && ARROW_SHAPES.includes(element.shape);
export const CALLOUT_FONT = 16;
const LABEL_PAD = 8;
const round = (n) => Math.round(n * 100) / 100;

export function arrowEnds(element) {
  const a = { x: element.x, y: element.y };
  return { a, b: { x: element.x + element.w, y: element.y + element.h } };
}

// unit normal of the direction a → b (to the left in screen coordinates, y down)
function normalOf(a, b) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.y - a.y) / len, y: -(b.x - a.x) / len };
}

export const bendOf = (element) => (Number.isFinite(element?.bend) ? element.bend : 0);

// the quadratic curve's control point (the middle of the line when straight)
export function controlPoint(element) {
  const { a, b } = arrowEnds(element);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const n = normalOf(a, b);
  const bend = bendOf(element);
  return { x: mid.x + n.x * bend, y: mid.y + n.y * bend };
}

// the point in the middle of the drawn curve (where the bend handle sits): a quadratic at t = 0.5
export function curveMiddle(element) {
  const { a, b } = arrowEnds(element);
  const c = controlPoint(element);
  return { x: (a.x + 2 * c.x + b.x) / 4, y: (a.y + 2 * c.y + b.y) / 4 };
}

export function arrowPathD(element) {
  const { a, b } = arrowEnds(element);
  if (!bendOf(element)) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const c = controlPoint(element);
  return `M ${a.x} ${a.y} Q ${round(c.x)} ${round(c.y)} ${b.x} ${b.y}`;
}

export const headSize = (strokeWidth = 3) => Math.max(12, Math.min(48, strokeWidth * 3.5 + 6));

// a V-shaped head with its tip at `tip`, pointing away from `from`
export function headAt(tip, from, size = 14) {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
  const left = { x: tip.x - size * Math.cos(angle - Math.PI / 7), y: tip.y - size * Math.sin(angle - Math.PI / 7) };
  const right = { x: tip.x - size * Math.cos(angle + Math.PI / 7), y: tip.y - size * Math.sin(angle + Math.PI / 7) };
  return `${round(left.x)},${round(left.y)} ${round(tip.x)},${round(tip.y)} ${round(right.x)},${round(right.y)}`;
}

export function headsOf(element) {
  if (element.shape === 'line') return 'none';
  if (element.shape === 'callout') return 'start';
  return ['both', 'none'].includes(element.heads) ? element.heads : 'end';
}

// the heads to draw (polyline points). A curve's head follows the curve's direction at its end (towards the control point).
export function arrowHeads(element, size = headSize(element.strokeWidth)) {
  const { a, b } = arrowEnds(element);
  const curved = Boolean(bendOf(element));
  const c = curved ? controlPoint(element) : null;
  const heads = headsOf(element);
  const list = [];
  if (heads === 'end' || heads === 'both') list.push(headAt(b, c || a, size));
  if (heads === 'start' || heads === 'both') list.push(headAt(a, c || b, size));
  return list;
}

// a callout's label: a box centred on the end point, as wide as its text needs
export function calloutBox(element) {
  const text = String(element.text || '');
  const lines = text ? text.split('\n') : [''];
  const fontSize = element.fontSize || CALLOUT_FONT;
  const longest = Math.max(4, ...lines.map((line) => line.length));
  const w = Math.min(360, Math.max(80, longest * fontSize * 0.56 + LABEL_PAD * 2));
  const perLine = Math.max(1, Math.floor((w - LABEL_PAD * 2) / (fontSize * 0.56)));
  const rows = lines.reduce((n, line) => n + Math.max(1, Math.ceil(line.length / perLine)), 0);
  const h = rows * fontSize * 1.35 + LABEL_PAD * 2;
  const { b } = arrowEnds(element);
  return { x: b.x - w / 2, y: b.y - h / 2, w, h, fontSize };
}

// the box around an arrow: both ends, the curve's middle and a callout's label
export function arrowBounds(element) {
  if (![element.x, element.y, element.w, element.h].every(Number.isFinite)) return null;
  const { a, b } = arrowEnds(element);
  const points = [a, b];
  if (bendOf(element)) points.push(curveMiddle(element));
  if (element.shape === 'callout') {
    const box = calloutBox(element);
    points.push({ x: box.x, y: box.y }, { x: box.x + box.w, y: box.y + box.h });
  }
  return { x1: Math.min(...points.map((p) => p.x)), y1: Math.min(...points.map((p) => p.y)), x2: Math.max(...points.map((p) => p.x)), y2: Math.max(...points.map((p) => p.y)) };
}

// dragging an end handle: the other end stays where it is
export function endpointPatch(element, which, point) {
  const { a, b } = arrowEnds(element);
  if (which === 'start') return { x: Math.round(point.x), y: Math.round(point.y), w: Math.round(b.x - point.x), h: Math.round(b.y - point.y) };
  return { w: Math.round(point.x - a.x), h: Math.round(point.y - a.y) };
}

// dragging the middle handle: the curve passes through the pointer (a quadratic's middle is halfway to its control point)
export function bendPatch(element, point) {
  const { a, b } = arrowEnds(element);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const n = normalOf(a, b);
  const bend = 2 * ((point.x - mid.x) * n.x + (point.y - mid.y) * n.y);
  return { bend: Math.abs(bend) < 4 ? 0 : Math.round(bend) };
}

// a new arrow of the given tool from a drag: a curved one starts with a gentle bend
export const ARROW_TOOLS = {
  arrow: { shape: 'arrow' },
  curve: { shape: 'arrow', curve: 0.25 },
  double: { shape: 'arrow', heads: 'both' },
  callout: { shape: 'callout' },
};
export function arrowFromDrag(tool, start, end) {
  const kind = ARROW_TOOLS[tool] || ARROW_TOOLS.arrow;
  const box = { x: start.x, y: start.y, w: end.x - start.x, h: end.y - start.y };
  const extra = {};
  if (kind.curve) extra.bend = Math.round(Math.hypot(box.w, box.h) * kind.curve);
  if (kind.heads) extra.heads = kind.heads;
  if (kind.shape === 'callout') extra.text = '';
  return { shape: kind.shape, ...box, ...extra };
}
