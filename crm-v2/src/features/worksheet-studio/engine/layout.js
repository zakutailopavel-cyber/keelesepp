// Free block size on a 12-column sheet (docs/specs/WORKSHEET_STUDIO_V2_SPEC.md §1).
// Old documents keep working: width 'half' = 6 columns, 'full' = 12.

export const COLUMNS = 12;
export const SPAN_PRESETS = [
  { span: 3, label: '¼' },
  { span: 4, label: '⅓' },
  { span: 6, label: '½' },
  { span: 8, label: '⅔' },
  { span: 9, label: '¾' },
  { span: 12, label: 'Terve' },
];
export const MIN_HEIGHT_MM = 20;
export const MAX_HEIGHT_MM = 330;

export function spanOf(block = {}) {
  const span = Number(block.span);
  if (Number.isFinite(span) && span >= 1) return Math.min(COLUMNS, Math.round(span));
  return block.width === 'full' ? COLUMNS : 6;
}

// nearest preset, so a dragged edge lands on ¼ ⅓ ½ ⅔ ¾ or full
export function snapSpan(value) {
  return SPAN_PRESETS.reduce((best, preset) => (Math.abs(preset.span - value) < Math.abs(best - value) ? preset.span : best), COLUMNS);
}

// Blocks fill a row until 12 columns are used; a block that does not fit starts a new row.
export function rowsOf(blocks = []) {
  const rows = [];
  let row = [];
  let used = 0;
  for (const block of blocks) {
    const span = spanOf(block);
    if (row.length && used + span > COLUMNS) { rows.push(row); row = []; used = 0; }
    row.push(block);
    used += span;
    if (used >= COLUMNS) { rows.push(row); row = []; used = 0; }
  }
  if (row.length) rows.push(row);
  return rows;
}

// Keep `width` in step for older readers (PDF/legacy code that only knows half/full).
export function withSpan(block, span) {
  const value = Math.max(1, Math.min(COLUMNS, Math.round(span)));
  return { ...block, span: value, width: value >= COLUMNS ? 'full' : 'half' };
}

export function withHeight(block, heightMm) {
  if (!heightMm) {
    const { minHeightMm, ...rest } = block; // eslint-disable-line no-unused-vars
    return rest;
  }
  return { ...block, minHeightMm: Math.max(MIN_HEIGHT_MM, Math.min(MAX_HEIGHT_MM, Math.round(heightMm))) };
}
