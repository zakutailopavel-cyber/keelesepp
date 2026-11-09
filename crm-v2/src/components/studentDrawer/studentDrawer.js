// „Õpilase kaart” beside the work (owner 2026-11-09: „админа не переносит на его карточку … а прямо там все сделал”):
// any screen opens a student's full card in the side drawer with `openStudentDrawer(id)`; the one <StudentDrawer /> in
// the shell listens. Without a mounted drawer (a page rendered alone, tests) nothing opens and `false` is returned, so
// the caller can fall back to the card's own page.
const listeners = new Set();

export function openStudentDrawer(studentId) {
  if (!studentId || !listeners.size) return false;
  listeners.forEach((listener) => listener(String(studentId)));
  return true;
}

export function onStudentDrawer(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
