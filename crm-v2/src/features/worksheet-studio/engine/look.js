// Block styling and joined blocks (owner, 2026-10-04: more flexible constructor). Colours stay inside the brand
// palette (TONES); only frame, heading colour and a small icon are new.

export const FRAMES = [['', 'Pole'], ['line', 'Joon'], ['bold', 'Paks'], ['dashed', 'Kriipsud']];
export const LOOK_ICONS = [['', 'Pole'], ['speak', 'Räägi'], ['listen', 'Kuula'], ['read', 'Loe'], ['write', 'Kirjuta'], ['idea', 'Mõtle'], ['star', 'Tähtis'], ['time', 'Aeg'], ['check', 'Kontrolli']];

// block.look = { frame, accent (tone key for the heading/frame colour), icon }; empty values are dropped
export function withLook(block, patch) {
  const next = { ...(block.look || {}), ...patch };
  Object.keys(next).forEach((key) => { if (!next[key]) delete next[key]; });
  const { look, ...rest } = block; // eslint-disable-line no-unused-vars
  return Object.keys(next).length ? { ...rest, look: next } : rest;
}

// Joined blocks: `joined: true` ties a block to the one before it — they are drawn as one card and move together.
export function runBounds(blocks, index) {
  let start = index;
  while (start > 0 && blocks[start]?.joined) start -= 1;
  let end = index;
  while (end + 1 < blocks.length && blocks[end + 1]?.joined) end += 1;
  return [start, end];
}

// move the whole joined group one step (past the neighbouring group)
export function moveRun(blocks, id, dir) {
  const index = blocks.findIndex((block) => block.id === id);
  if (index < 0) return blocks;
  const [start, end] = runBounds(blocks, index);
  const run = blocks.slice(start, end + 1);
  const rest = [...blocks.slice(0, start), ...blocks.slice(end + 1)];
  let at;
  if (dir < 0) {
    if (start === 0) return blocks;
    at = runBounds(blocks, start - 1)[0];
  } else {
    if (end === blocks.length - 1) return blocks;
    const [, nextEnd] = runBounds(blocks, end + 1);
    at = nextEnd - run.length + 1;
  }
  const first = { ...run[0] };
  delete first.joined;
  const moved = [first, ...run.slice(1)];
  rest.splice(at, 0, ...moved);
  // the block that now follows the group is not tied to it unless it already was
  return rest;
}

// drag & drop: the dragged block takes its joined group along, landing before the target's group
export function dropRun(blocks, fromId, toId) {
  const from = blocks.findIndex((block) => block.id === fromId);
  const to = blocks.findIndex((block) => block.id === toId);
  if (from < 0 || to < 0) return blocks;
  const [start, end] = runBounds(blocks, from);
  if (to >= start && to <= end) return blocks;
  const run = blocks.slice(start, end + 1);
  const first = { ...run[0] };
  delete first.joined;
  const rest = [...blocks.slice(0, start), ...blocks.slice(end + 1)];
  const target = runBounds(rest, rest.findIndex((block) => block.id === toId))[0];
  rest.splice(target, 0, first, ...run.slice(1));
  return rest;
}

// Drag & drop with a side: the dragged group lands before or after the target's group (left = before, right = after).
export function dropAt(blocks, fromId, toId, side = 'before') {
  if (side === 'before' || side === 'left') return dropRun(blocks, fromId, toId);
  const from = blocks.findIndex((block) => block.id === fromId);
  const to = blocks.findIndex((block) => block.id === toId);
  if (from < 0 || to < 0) return blocks;
  const [start, end] = runBounds(blocks, from);
  if (to >= start && to <= end) return blocks;
  const run = blocks.slice(start, end + 1);
  const first = { ...run[0] };
  delete first.joined;
  const rest = [...blocks.slice(0, start), ...blocks.slice(end + 1)];
  const targetEnd = runBounds(rest, rest.findIndex((block) => block.id === toId))[1];
  rest.splice(targetEnd + 1, 0, first, ...run.slice(1));
  return rest;
}

// a new block dropped from the palette: before or after the target's group (or at the end)
export function insertAt(blocks, fresh, toId, side = 'after') {
  const to = blocks.findIndex((block) => block.id === toId);
  if (to < 0) return [...blocks, ...fresh];
  const [start, end] = runBounds(blocks, to);
  const at = side === 'before' || side === 'left' ? start : end + 1;
  return [...blocks.slice(0, at), ...fresh, ...blocks.slice(at)];
}

// where a dragged block would land on a card: near the left / right edge of a card that is not full width →
// beside it; otherwise above or below it
export function dropSide({ x, y, width, height }, fullWidth = false) {
  const fx = width ? x / width : 0.5;
  const fy = height ? y / height : 0.5;
  if (!fullWidth && fx < 0.22) return 'left';
  if (!fullWidth && fx > 0.78) return 'right';
  return fy < 0.5 ? 'before' : 'after';
}

// ── ready-made styles and sheet themes (owner, 2026-10-09: textbook look in one click) ──
// heading look and number shape of a task block
export const HEADS = [['', 'Tavaline'], ['band', 'Riba'], ['tab', 'Sakk'], ['line', 'Joon all']];
export const NUMS = [['', 'Ring'], ['square', 'Ruut'], ['outline', 'Kontuur']];

// one click = tone + frame + heading colour + icon + heading look + number shape
export const STYLE_PRESETS = [
  { key: 'exercise', label: 'Harjutus', tone: 'blue', look: {} },
  { key: 'grammar', label: 'Grammatika', tone: 'green', look: { frame: 'line', icon: 'idea', head: 'band' } },
  { key: 'words', label: 'Sõnavara', tone: 'cream', look: { frame: 'dashed', icon: 'read', head: 'line' } },
  { key: 'speak', label: 'Räägi', tone: 'sky', look: { icon: 'speak', head: 'tab', num: 'square' } },
  { key: 'important', label: 'Tähtis', tone: 'peach', look: { frame: 'bold', icon: 'star', accent: 'peach' } },
  { key: 'homework', label: 'Kodutöö', tone: 'white', look: { frame: 'dashed', icon: 'write', head: 'tab', num: 'outline' } },
  { key: 'plain', label: 'Lihtne', tone: 'white', look: {} },
];

// the style part of a block (to copy it or apply a preset): tone + look
export const styleOf = (block) => ({ tone: block.tone || 'white', look: { ...(block.look || {}) } });
export function withStyle(block, style) {
  const next = { ...block, tone: style.tone || block.tone };
  const look = Object.fromEntries(Object.entries(style.look || {}).filter(([, value]) => value));
  if (Object.keys(look).length) next.look = look; else delete next.look;
  return next;
}
// the same style on every block of that type on the sheet
export const styleSameType = (blocks, source) => blocks.map((block) => (block.type === source.type && block.id !== source.id ? withStyle(block, styleOf(source)) : block));

// Sheet themes (doc.meta.theme): the brand tones redrawn for a mood; '' = the textbook (TONES as they are).
export const THEMES = [
  { key: '', label: 'Õpik' },
  { key: 'pastel', label: 'Pastell', tones: {
    blue: { card: '#f3f1ff', badge: '#534ab7' }, green: { card: '#eefaf5', badge: '#0f6e56' }, peach: { card: '#fff4ee', badge: '#993c1d' },
    cream: { card: '#fffaf0', badge: '#854f0b' }, sky: { card: '#eef7fd', badge: '#185fa5' }, white: { card: '#ffffff', badge: '#534ab7' } } },
  { key: 'kids', label: 'Lastele', tones: {
    blue: { card: '#dff0ff', badge: '#185fa5' }, green: { card: '#e3f6d4', badge: '#3b6d11' }, peach: { card: '#ffe9d6', badge: '#c2410c' },
    cream: { card: '#fff3c4', badge: '#854f0b' }, sky: { card: '#d9f2ff', badge: '#0e7490' }, white: { card: '#ffffff', badge: '#be185d' } } },
  { key: 'bw', label: 'Must-valge', tones: {
    blue: { card: '#ffffff', badge: '#2c2c2a' }, green: { card: '#f4f4f2', badge: '#2c2c2a' }, peach: { card: '#ffffff', badge: '#444441' },
    cream: { card: '#f4f4f2', badge: '#444441' }, sky: { card: '#ffffff', badge: '#2c2c2a' }, white: { card: '#ffffff', badge: '#2c2c2a' } } },
  // owner's references (2026-10-10): a clean airy page, a magazine page, a classic printed textbook
  { key: 'selge', label: 'Selge', tones: {
    blue: { card: '#ffffff', badge: '#1170c0' }, green: { card: '#ffffff', badge: '#1170c0' }, peach: { card: '#ffffff', badge: '#1170c0' },
    cream: { card: '#ffffff', badge: '#1170c0' }, sky: { card: '#ffffff', badge: '#1170c0' }, white: { card: '#ffffff', badge: '#1170c0' } } },
  { key: 'ajakiri', label: 'Ajakiri', tones: {
    blue: { card: '#ffffff', badge: '#2f6f9f' }, green: { card: '#ffffff', badge: '#3f7d4e' }, peach: { card: '#ffffff', badge: '#c0563b' },
    cream: { card: '#ffffff', badge: '#a0702c' }, sky: { card: '#ffffff', badge: '#2f6f9f' }, white: { card: '#ffffff', badge: '#7a4a2a' } } },
  { key: 'klassika', label: 'Klassika', tones: {
    blue: { card: '#ffffff', badge: '#1d2b4a' }, green: { card: '#ffffff', badge: '#1d2b4a' }, peach: { card: '#ffffff', badge: '#1d2b4a' },
    cream: { card: '#ffffff', badge: '#1d2b4a' }, sky: { card: '#ffffff', badge: '#1d2b4a' }, white: { card: '#ffffff', badge: '#1d2b4a' } } },
];
export const themeOf = (key) => THEMES.find((theme) => theme.key === (key || '')) || THEMES[0];
// a tone as the sheet's theme draws it (falls back to the brand tone)
export function themedTone(themeKey, tone, base) {
  const over = themeOf(themeKey).tones?.[tone];
  return over ? { ...base, ...over } : base;
}
