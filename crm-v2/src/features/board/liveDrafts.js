// Live board (owner 2026-10-23: „близко к Miro”): what the other side is doing right now — a line being drawn, a text
// being typed, elements being dragged, the cursor, and the teacher's view — travels over the call's data channel
// (LiveRoom `sendRoom`). Nothing here is saved: the board's elements are still written once, when the action ends, and
// the draft is dropped as soon as the real element arrives (or after a quiet moment, if the other side vanished).
// Messages come from the other browser, so every one is checked and cut to size before it is shown.

export const DRAFT_STALE_MS = 6000;
export const CURSOR_STALE_MS = 8000;
const MAX_POINTS = 800;
const MAX_TEXT = 4000;
const MAX_IDS = 200;

const num = (value) => (Number.isFinite(value) ? Math.round(value * 100) / 100 : null);
const text = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');
const page = (value) => text(value, 200);
const COLOR = /^#[0-9a-f]{3,8}$/i;
const color = (value, fallback = '#1C2B3A') => (COLOR.test(String(value || '')) ? value : fallback);

// a drawing in progress: a line (pen or marker) or a shape
function cleanDraft(draft) {
  if (!draft || typeof draft !== 'object') return null;
  if (draft.type === 'stroke') {
    const points = (Array.isArray(draft.points) ? draft.points : []).slice(0, MAX_POINTS)
      .map((point) => ({ x: num(point?.x), y: num(point?.y) })).filter((point) => point.x !== null && point.y !== null);
    if (points.length < 1) return null;
    return { type: 'stroke', points, color: color(draft.color), strokeWidth: Math.min(40, Math.max(1, num(draft.strokeWidth) || 4)) };
  }
  if (draft.type === 'shape' && ['rect', 'ellipse', 'arrow', 'line'].includes(draft.shape)) {
    const box = ['x', 'y', 'w', 'h'].map((key) => num(draft[key]));
    if (box.some((value) => value === null)) return null;
    const [x, y, w, h] = box;
    return { type: 'shape', shape: draft.shape, x, y, w, h, color: color(draft.color), strokeWidth: Math.min(40, Math.max(1, num(draft.strokeWidth) || 3)) };
  }
  return null;
}

// the outgoing messages (`d` drawing, `typing`, `move`, `cur` cursor, `view`); `pageId` '' is the main board
export const draftMessage = (pageId, draft) => ({ t: 'd', pageId: page(pageId), draft: draft ? cleanDraft(draft) : null });
export const typingMessage = (pageId, id, value) => ({ t: 'typing', pageId: page(pageId), id: id ? text(id, 200) : '', text: id ? text(value, MAX_TEXT) : '' });
export const moveMessage = (pageId, ids, dx, dy) => ({ t: 'move', pageId: page(pageId), ids: ids?.length ? ids.slice(0, MAX_IDS).map((id) => text(id, 200)) : [], dx: num(dx) || 0, dy: num(dy) || 0 });
export const cursorMessage = (pageId, point, { typing = false } = {}) => (point ? { t: 'cur', pageId: page(pageId), x: num(point.x), y: num(point.y), typing: Boolean(typing) } : { t: 'cur', off: true });
// the teacher's visible part of the board (world coordinates); off = the teacher stopped leading the view
export const viewMessage = (pageId, rect) => (rect ? { t: 'view', pageId: page(pageId), x1: num(rect.x1), y1: num(rect.y1), x2: num(rect.x2), y2: num(rect.y2) } : { t: 'view', off: true });

export const EMPTY_REMOTE = Object.freeze({ draft: null, typing: null, move: null, cursor: null, view: null });

// the other side's live state after one message (an unknown or broken message changes nothing)
export function reduceRemote(state = EMPTY_REMOTE, message, now = Date.now()) {
  if (!message || typeof message !== 'object') return state;
  if (message.t === 'd') {
    const draft = cleanDraft(message.draft);
    return { ...state, draft: draft ? { pageId: page(message.pageId), draft, at: now } : null };
  }
  if (message.t === 'typing') {
    const id = text(message.id, 200);
    return { ...state, typing: id ? { pageId: page(message.pageId), id, text: text(message.text, MAX_TEXT), at: now } : null };
  }
  if (message.t === 'move') {
    const ids = Array.isArray(message.ids) ? message.ids.slice(0, MAX_IDS).map((id) => text(id, 200)).filter(Boolean) : [];
    const dx = num(message.dx);
    const dy = num(message.dy);
    return { ...state, move: ids.length && dx !== null && dy !== null ? { pageId: page(message.pageId), ids, dx, dy, at: now } : null };
  }
  if (message.t === 'cur') {
    if (message.off) return { ...state, cursor: null };
    const x = num(message.x);
    const y = num(message.y);
    return x === null || y === null ? state : { ...state, cursor: { pageId: page(message.pageId), x, y, typing: message.typing === true, at: now } };
  }
  if (message.t === 'view') {
    if (message.off) return { ...state, view: null };
    const rect = ['x1', 'y1', 'x2', 'y2'].map((key) => num(message[key]));
    if (rect.some((value) => value === null) || rect[2] <= rect[0] || rect[3] <= rect[1]) return state;
    return { ...state, view: { pageId: page(message.pageId), x1: rect[0], y1: rect[1], x2: rect[2], y2: rect[3], at: now } };
  }
  return state;
}

// drafts the other side left behind (a closed tab, a lost channel) disappear after a quiet moment
export function dropStale(state, now = Date.now()) {
  const fresh = (item, ms) => (item && now - item.at < ms ? item : null);
  const next = { ...state, draft: fresh(state.draft, DRAFT_STALE_MS), typing: fresh(state.typing, DRAFT_STALE_MS), move: fresh(state.move, DRAFT_STALE_MS), cursor: fresh(state.cursor, CURSOR_STALE_MS) };
  return ['draft', 'typing', 'move', 'cursor'].every((key) => next[key] === state[key]) ? state : next;
}

// only what lies on the page this side has open
export function remoteOnPage(state, pageId) {
  const here = page(pageId);
  const on = (item) => (item && item.pageId === here ? item : null);
  return { draft: on(state.draft), typing: on(state.typing), move: on(state.move), cursor: on(state.cursor), view: on(state.view) };
}

// At most one message per `ms` for each kind; the last one always goes out (a trailing send), and a message marked
// `now` (an end: the line is saved, the text closed) goes at once and drops the waiting one.
export function createThrottle(send, ms = 40, { clock = () => Date.now(), timer = globalThis.setTimeout, cancel = globalThis.clearTimeout } = {}) {
  const slots = new Map();
  const flush = (key) => {
    const slot = slots.get(key);
    if (!slot?.pending) return;
    slot.last = clock();
    slot.timer = null;
    const message = slot.pending;
    slot.pending = null;
    send(message);
  };
  const push = (key, message, { now: immediate = false } = {}) => {
    const slot = slots.get(key) || { last: 0, timer: null, pending: null };
    slots.set(key, slot);
    if (immediate) {
      if (slot.timer) cancel(slot.timer);
      slot.timer = null; slot.pending = null; slot.last = clock();
      send(message);
      return;
    }
    slot.pending = message;
    const wait = ms - (clock() - slot.last);
    if (wait <= 0) { if (slot.timer) cancel(slot.timer); flush(key); return; }
    if (!slot.timer) slot.timer = timer(() => flush(key), wait);
  };
  push.dispose = () => { slots.forEach((slot) => { if (slot.timer) cancel(slot.timer); }); slots.clear(); };
  return push;
}
