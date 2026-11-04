// „Tunni tahvlid” (owner 2026-11-04): when a Live Classroom lesson ends, the teacher's browser keeps a read-only copy of
// the lesson's board pages on the student's own board — `whiteboards/{studentId}/lessonPages/{copyId}` with
// `isSnapshot: true` (the snapshot pages the rules already had: staff fill them while `status: 'active'`, then
// `completed` makes them immutable and undeletable). The student and linked parents read them like the rest of the
// board; the live board never lists them (studentBoard.js subscribePages filters snapshots out).
// Only drawn / written board elements are copied: worksheet pages (their answers live in homework), the teacher's lesson
// plan, notes and answer keys are not board elements and never reach the copy.

export const COPY_PREFIX = 'lb-';
const ID_SAFE = /[^A-Za-z0-9_-]/g;

// stable id of the n-th copied page of one lesson (1:1: the invitation id; group: the room id), so ending twice or
// retrying after an error finds the same copy instead of adding another
export const lessonCopyId = (lessonKey, index) => `${COPY_PREFIX}${String(lessonKey || 'tund').replace(ID_SAFE, '').slice(0, 120)}-${index + 1}`;

// the lesson a copy belongs to (`lb-<lessonKey>-<n>`), or '' for snapshots that are not lesson copies
export function copyLessonKey(pageId = '') {
  const match = /^lb-(.+)-(\d+)$/.exec(String(pageId));
  return match ? match[1] : '';
}

// a worksheet's page (studentBoard.js worksheetPageId): its content is the worksheet, not board elements
export const isWorksheetPage = (page = {}) => /^ws-[0-9a-f]{8}$/.test(String(page.id || '')) || /^Tööleht:/.test(String(page.title || ''));

/**
 * Which pages of a 1:1 lesson to copy: the lesson pages the teacher opened (not worksheet pages); when only the main
 * board was used, the main board ({ id: '' }).
 */
export function pagesToCopy(seen = []) {
  const pages = seen.filter((page) => page?.id && !isWorksheetPage(page));
  if (pages.length) return pages.slice(0, 20);
  return seen.some((page) => page?.id && isWorksheetPage(page)) ? [] : [{ id: '', title: 'Tahvel' }];
}

// keys each element type may carry (firestore.rules validWhiteboardElement); anything else is left out of the copy
const KEYS = {
  stroke: ['type', 'points', 'color', 'strokeWidth'],
  shape: ['type', 'shape', 'x', 'y', 'w', 'h', 'color', 'strokeWidth', 'bend', 'heads', 'text'],
  text: ['type', 'x', 'y', 'w', 'h', 'text', 'spans', 'color', 'fontSize', 'fontFamily'],
  note: ['type', 'x', 'y', 'w', 'h', 'text', 'color', 'bookmark', 'ink', 'noteId'],
  image: ['type', 'x', 'y', 'w', 'h', 'url', 'storagePath', 'rotation', 'locked', 'credit', 'sourceUrl', 'byStudent'],
  pdf: ['type', 'x', 'y', 'w', 'h', 'url', 'storagePath', 'name', 'rotation', 'locked'],
};
const REQUIRED = {
  stroke: (e) => Array.isArray(e.points) && e.points.length > 0 && e.points.length <= 800 && typeof e.color === 'string' && e.strokeWidth > 0 && e.strokeWidth <= 40,
  shape: (e) => ['rect', 'ellipse', 'line', 'arrow', 'callout'].includes(e.shape) && [e.x, e.y, e.w, e.h].every(Number.isFinite) && typeof e.color === 'string' && e.strokeWidth > 0 && e.strokeWidth <= 40,
  text: (e) => [e.x, e.y, e.w, e.h].every(Number.isFinite) && typeof e.text === 'string' && e.text.length <= 4000 && typeof e.color === 'string' && e.fontSize > 0 && e.fontSize <= 96,
  note: (e) => [e.x, e.y, e.w, e.h].every(Number.isFinite) && typeof e.text === 'string' && e.text.length <= 2000 && typeof e.color === 'string',
  image: (e) => [e.x, e.y, e.w, e.h].every(Number.isFinite) && e.w > 0 && e.h > 0 && /^https:\/\//.test(e.url || '') && String(e.url).length <= 2000,
  pdf: (e) => [e.x, e.y, e.w, e.h].every(Number.isFinite) && e.w > 0 && e.h > 0 && /^https:\/\//.test(e.url || '') && String(e.url).length <= 2000,
};

/** A board element as it goes into the copy (signed by the teacher who copies), or null when it cannot be copied. */
export function copyableElement(element = {}) {
  const keys = KEYS[element.type];
  if (!keys || !REQUIRED[element.type](element)) return null;
  const data = {};
  keys.forEach((key) => { if (element[key] !== undefined && element[key] !== null) data[key] = element[key]; });
  if (data.bookmark !== true) delete data.bookmark;
  if (data.byStudent !== true) delete data.byStudent;
  if (element.byStaff === true) data.byStaff = true;
  return data;
}

const millis = (value) => value?.toMillis?.() || (Number.isFinite(value) ? value : Date.parse(value || '') || 0);

/**
 * The student's „Tunni tahvlid”: finished lesson copies grouped by lesson, newest first.
 * → [{ key, studentId, at, teacher, pages: [{ id, title, order }] }]
 */
export function groupLessonCopies(pages = []) {
  const groups = new Map();
  pages.forEach((page) => {
    const lessonKey = copyLessonKey(page.id);
    if (!lessonKey || page.isSnapshot !== true || page.status !== 'completed') return;
    const studentId = String(page.studentId || '');
    // one group lesson is copied to every member's board: a parent of two members sees two lessons, one per child
    const key = studentId ? `${studentId}:${lessonKey}` : lessonKey;
    const at = millis(page.createdAt);
    const group = groups.get(key) || { key, studentId, at: 0, teacher: '', pages: [] };
    group.at = Math.max(group.at, at);
    group.teacher = group.teacher || String(page.updatedByName || '');
    group.pages.push({ id: page.id, title: String(page.title || 'Leht'), order: Number(page.order) || 0 });
    groups.set(key, group);
  });
  return [...groups.values()]
    .map((group) => ({ ...group, pages: group.pages.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)) }))
    .sort((a, b) => b.at - a.at || a.key.localeCompare(b.key));
}

export const lessonDateLabel = (at) => (at ? new Date(at).toLocaleDateString('et-EE', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
