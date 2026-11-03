// „Järjehoidja / Kleebis” (owner 2026-11-04): a small sticky sheet on the board, written by hand (pen) or typed. It is a
// board `note` element marked `bookmark: true` with its handwriting in `ink`, and the same content is kept for the
// student as a note in „Minu vead” (`studentNotes/{id}`, the element's `noteId`). The teacher's bookmarks go to the
// student whose board it is.

// the sheet's own drawing area: handwriting is stored in these units and scaled to the sheet on the board
export const INK_BOX = Object.freeze({ w: 320, h: 200 });
export const MAX_INK = 60; // strokes
export const MAX_INK_PATH = 6000; // characters of one stroke's path
export const BOOKMARK_COLORS = ['#FEF3C7', '#DCFCE7', '#DBEAFE', '#FCE7F3'];
export const INK_COLORS = ['#1C2B3A', '#DC2626', '#2563EB', '#0F766E'];
export const BOOKMARK_SIZE = Object.freeze({ w: 220, h: 170 });
const HEX = /^#[0-9a-f]{6}$/i;
const r1 = (n) => Math.round(n * 10) / 10;

export const isBookmark = (element) => element?.type === 'note' && element?.bookmark === true;

// a pen stroke's points (sheet units) → a compact SVG path
export function inkPath(points = []) {
  const list = points.filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  if (!list.length) return '';
  const [first, ...rest] = list;
  // a dot (a tap) is a tiny line so it is visible
  if (!rest.length) return `M${r1(first.x)} ${r1(first.y)}l0.1 0`;
  return `M${r1(first.x)} ${r1(first.y)}${rest.map((p) => `L${r1(p.x)} ${r1(p.y)}`).join('')}`;
}

// keep only valid strokes: { d, c, w }
export function cleanInk(ink = []) {
  return (Array.isArray(ink) ? ink : [])
    .filter((stroke) => typeof stroke?.d === 'string' && /^M[-\d.]/.test(stroke.d) && stroke.d.length <= MAX_INK_PATH)
    .slice(0, MAX_INK)
    .map((stroke) => ({ d: stroke.d, c: HEX.test(String(stroke.c || '')) ? stroke.c : INK_COLORS[0], w: Math.min(12, Math.max(1, Number(stroke.w) || 3)) }));
}

export const cleanNoteText = (text) => String(text || '').replace(/\r\n/g, '\n').slice(0, 2000);
export const bookmarkEmpty = ({ text = '', ink = [] } = {}) => !String(text).trim() && !cleanInk(ink).length;

// the board element of a bookmark (new or changed)
export function bookmarkElement({ x = 0, y = 0, text = '', ink = [], color = BOOKMARK_COLORS[0], noteId = '' } = {}) {
  return {
    type: 'note', bookmark: true,
    x: Math.round(x), y: Math.round(y), w: BOOKMARK_SIZE.w, h: BOOKMARK_SIZE.h,
    text: cleanNoteText(text), ink: cleanInk(ink), color: HEX.test(String(color)) ? color : BOOKMARK_COLORS[0],
    ...(noteId ? { noteId: String(noteId).slice(0, 200) } : {}),
  };
}

// the student's note record („Minu vead” → „Märkmed tunnist”)
export function noteRecord({ studentId, text = '', ink = [], color = BOOKMARK_COLORS[0], pageId = '', pageTitle = '', user = {}, staff = false, now = new Date().toISOString() }) {
  return {
    studentId: String(studentId || ''),
    kind: 'board',
    text: cleanNoteText(text),
    ink: cleanInk(ink),
    color: HEX.test(String(color)) ? color : BOOKMARK_COLORS[0],
    pageId: String(pageId || '').slice(0, 200),
    pageTitle: String(pageTitle || '').slice(0, 200),
    byStaff: Boolean(staff),
    createdByUid: String(user.uid || ''),
    createdByName: String(user.displayName || user.email || '').slice(0, 160),
    createdAt: now,
    updatedAt: now,
  };
}

// the fields of a note that change when its bookmark is edited
export const notePatch = ({ text = '', ink = [], color, now = new Date().toISOString() }) => ({
  text: cleanNoteText(text), ink: cleanInk(ink), ...(HEX.test(String(color || '')) ? { color } : {}), updatedAt: now,
});

// a stored note for the list (missing fields filled)
export function normalizeNote(id, data = {}) {
  return {
    id,
    studentId: data.studentId || '',
    text: typeof data.text === 'string' ? data.text : '',
    ink: cleanInk(data.ink),
    color: HEX.test(String(data.color || '')) ? data.color : BOOKMARK_COLORS[0],
    pageTitle: data.pageTitle || '',
    byStaff: data.byStaff === true,
    createdByUid: data.createdByUid || '',
    createdByName: data.createdByName || '',
    createdAt: data.createdAt || '',
  };
}
