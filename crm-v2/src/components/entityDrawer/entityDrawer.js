// The side drawer beside the work (owner 2026-11-09: „админа не переносит на его карточку … а прямо там все сделал”;
// the same day: „правая кнопка … во всплывающих панелях, не уходя со страницы”): any screen opens a panel over the
// current page with `openDrawer({ kind, ...data })` — `student` (studentId: the full card), `lesson` (scheduleId +
// date: one calendar occurrence), `invoice` (invoiceId). The one <EntityDrawer /> in the shell listens. Without a
// mounted drawer (a page rendered alone, tests) nothing opens and `false` is returned, so the caller can fall back to
// the entity's own page.
const listeners = new Set();

// what each kind needs to open; anything else is refused (the caller falls back)
export const DRAWER_KINDS = Object.freeze({
  student: (d) => Boolean(d.studentId),
  lesson: (d) => Boolean(d.scheduleId && /^\d{4}-\d{2}-\d{2}$/.test(String(d.date || ''))),
  invoice: (d) => Boolean(d.invoiceId),
});

export function openDrawer({ kind, ...data } = {}) {
  if (!DRAWER_KINDS[kind]?.(data) || !listeners.size) return false;
  const request = { kind, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value == null ? '' : String(value)])) };
  listeners.forEach((listener) => listener(request));
  return true;
}

export const openStudentDrawer = (studentId) => openDrawer({ kind: 'student', studentId });

export function onDrawer(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// What the drawer changed (a lesson marked, a payment added): the page under it updates its own data in place — no
// location.reload, no remount, its filters and scroll stay. `kind` is the entity type ('lesson', 'invoice'); `data`
// says what changed ({ occurrenceId, change: 'marked' | 'changed' } for a lesson, { invoiceId, change: 'payment' } for
// an invoice). A page listens with `onEntityChanged(kinds, listener)` (React: `useEntityChanged`) and reloads quietly.
const changeListeners = new Set();

export function announceEntityChanged(kind, data = {}) {
  const change = { kind, ...data };
  changeListeners.forEach((entry) => { if (entry.kinds.includes(kind)) entry.listener(change); });
}

export function onEntityChanged(kinds, listener) {
  const entry = { kinds: [].concat(kinds), listener };
  changeListeners.add(entry);
  return () => { changeListeners.delete(entry); };
}
