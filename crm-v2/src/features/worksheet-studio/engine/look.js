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
