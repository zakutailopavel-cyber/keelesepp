// dnd-kit ids of the sheet's cards, and where a pointer press must not start dragging a block
export const dragId = (blockId) => `block:${blockId}`;
export const dropId = (blockId) => `drop:${blockId}`;
export const NO_DRAG = 'input, textarea, select, button, a, [contenteditable="true"], [contenteditable="plaintext-only"], .ws-toolbar, .ws-resize, .ws-marks, .ws-tiptap, .ws-float-edit';

// where a dragged block / new palette block would land: { id, side } of the card under the pointer, or null
export function hintFor({ active, over, pointer, dropSide }) {
  if (!over || over.kind !== 'block' || !over.rect) return null;
  if (active?.kind === 'block' && active.id === over.id) return null;
  const { left, top, width, height } = over.rect;
  return { id: over.id, side: dropSide({ x: pointer.x - left, y: pointer.y - top, width, height }, over.full) };
}

// what dropping does: { op: 'new', type, toId, side } | { op: 'move', fromId, toId, side } | null
export function dropAction({ active, overKind, hint }) {
  if (!active) return null;
  if (overKind === 'end' && active.kind === 'new') return { op: 'new', type: active.type, toId: null, side: 'after' };
  if (!hint) return null;
  if (active.kind === 'new') return { op: 'new', type: active.type, toId: hint.id, side: hint.side };
  if (active.kind === 'block' && active.id !== hint.id) return { op: 'move', fromId: active.id, toId: hint.id, side: hint.side };
  return null;
}
