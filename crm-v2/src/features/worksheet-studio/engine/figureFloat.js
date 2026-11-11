// A picture inside a text, with the text wrapping around it (owner 2026-11-11: teachers lay out the Õpik themselves).
//
// Stored on the text block as `data.figure` (optional — a text block without it renders exactly as before):
//   { mode: 'float', img, caption, alt, side: 'left' | 'right' | 'center', width: 20…100 (% of the text column),
//     at: paragraph index the picture stands before, shape: 'rect' | 'rounded' | 'circle' | 'oval',
//     border: 'none' | 'ink' | 'lime', locked: boolean }
// The standalone picture block (`image`) takes the same `shape` / `border` for its frame.
//
// Flow, not coordinates: the picture moves with its paragraph, so page splitting (pageSplit.js — a text block is never
// split), print, the phone column (stacked above the text) and the dark theme need nothing special.
//
// Later („phase 3”, the Õpik only): free placement on a fixed A4 page. Reserved, not drawn yet:
//   mode: 'free' with { page, xMm, yMm, wMm, hMm, z } and shape 'polygon' with points: [[x%, y%], …] — allowed only on a
//   sheet with meta.layout === 'fixed'. A renderer that does not know a mode falls back to 'float' (normalizeFigure), so
//   flow sheets and old readers keep working.

export const FIGURE_SIDES = Object.freeze(['left', 'right', 'center']);
export const FIGURE_SHAPES = Object.freeze(['rect', 'rounded', 'circle', 'oval']);
export const FIGURE_BORDERS = Object.freeze(['none', 'ink', 'lime']);
export const FIGURE_WIDTHS = Object.freeze([25, 33, 50, 100]);
export const FIGURE_MODES = Object.freeze(['float']);
export const MIN_WIDTH = 20;
export const MAX_WIDTH = 100;

export const SIDE_LABEL = { left: 'Vasakul', right: 'Paremal', center: 'Keskel' };
export const SHAPE_LABEL = { rect: 'Ristkülik', rounded: 'Ümarad nurgad', circle: 'Ring', oval: 'Ovaal' };
export const BORDER_LABEL = { none: 'Ilma raamita', ink: 'Must joon', lime: 'Laimiroheline joon' };

const clampWidth = (value) => Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(Number(value) || 33)));
// a drag snaps to the named widths when near one (±3 %), else to 5 % steps
export function snapWidth(value) {
  const raw = clampWidth(value);
  const near = FIGURE_WIDTHS.find((w) => Math.abs(w - raw) <= 3);
  return near ?? Math.round(raw / 5) * 5;
}

// a new picture in a text: on the right, a third of the column, before the first paragraph
export const newFigure = (img = null) => ({ mode: 'float', img, caption: '', alt: '', side: 'right', width: 33, at: 0, shape: 'rect', border: 'none', locked: false });

// the stored figure, made safe to draw: unknown values fall back, unknown modes draw as 'float'
export function normalizeFigure(figure) {
  if (!figure || typeof figure !== 'object') return null;
  return {
    ...figure,
    mode: 'float',
    side: FIGURE_SIDES.includes(figure.side) ? figure.side : 'right',
    width: clampWidth(figure.width),
    at: Math.max(0, Math.floor(Number(figure.at) || 0)),
    shape: FIGURE_SHAPES.includes(figure.shape) ? figure.shape : 'rect',
    border: FIGURE_BORDERS.includes(figure.border) ? figure.border : 'none',
    locked: figure.locked === true,
    caption: String(figure.caption || ''),
  };
}

// the frame of a picture (figure in a text or the picture block): classes for the shape and the border
export const frameClass = ({ shape = 'rect', border = 'none' } = {}) => [
  FIGURE_SHAPES.includes(shape) && shape !== 'rect' ? `shape-${shape}` : '',
  FIGURE_BORDERS.includes(border) && border !== 'none' ? `border-${border}` : '',
].filter(Boolean).join(' ');

// a circle is drawn on a square picture, an oval on 4:3
export const shapeAspect = (shape, aspect) => (shape === 'circle' ? '1:1' : shape === 'oval' ? '4:3' : aspect || '4:3');

// Where a dragged picture lands: the side by the pointer's third of the text column, the paragraph by its height.
// `box` = the text column's rect, `paragraphs` = the tops of its paragraphs (px, in order).
export function dropPlace({ x, y }, box, paragraphs = []) {
  const third = (x - box.left) / Math.max(1, box.width);
  const side = third < 1 / 3 ? 'left' : third > 2 / 3 ? 'right' : 'center';
  let at = 0;
  paragraphs.forEach((top, index) => { if (y >= top) at = index; });
  return { side, at };
}

// Checks a stored figure / frame (worksheetDocs.validateWorksheetDoc); returns a message or ''.
export function figureProblem(block) {
  const data = block?.data || {};
  if (data.shape !== undefined && !FIGURE_SHAPES.includes(data.shape)) return 'Pildi kuju on tundmatu.';
  if (data.border !== undefined && !FIGURE_BORDERS.includes(data.border)) return 'Pildi raam on tundmatu.';
  const figure = data.figure;
  if (figure === undefined || figure === null) return '';
  if (typeof figure !== 'object' || Array.isArray(figure)) return 'Teksti pilt on vigane.';
  if (figure.mode !== undefined && !FIGURE_MODES.includes(figure.mode)) return 'Teksti pildi paigutus on tundmatu.';
  if (figure.side !== undefined && !FIGURE_SIDES.includes(figure.side)) return 'Teksti pildi asukoht on tundmatu.';
  if (figure.shape !== undefined && !FIGURE_SHAPES.includes(figure.shape)) return 'Teksti pildi kuju on tundmatu.';
  if (figure.border !== undefined && !FIGURE_BORDERS.includes(figure.border)) return 'Teksti pildi raam on tundmatu.';
  const width = Number(figure.width);
  if (figure.width !== undefined && !(width >= MIN_WIDTH && width <= MAX_WIDTH)) return 'Teksti pildi laius peab olema 20–100 %.';
  return '';
}
