// „Sobivad ajad” (owner 2026-10-20): a learner marks every hour of the week that really suits a lesson; the school then
// finds a teacher and a time. Hours 8–21; an hour is stored as its two half hours ("Mon-16:00", "Mon-16:30"), the
// format of functions/website-lead-core.js.
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = Array.from({ length: 14 }, (_, index) => 8 + index); // 8:00 … 21:00 (the last hour ends at 22)
export const cellKey = (day, hour) => `${day}-${String(hour).padStart(2, '0')}`;

// a tap: empty → suits → best → empty
export const NEXT = { '': 'ok', ok: 'best', best: '' };

// { "Mon-16": "ok" | "best" } → what the server takes
export function pollPayload(cells = {}) {
  const halves = (key) => [`${key}:00`, `${key}:30`];
  const marked = Object.entries(cells).filter(([, value]) => value);
  return {
    slots: marked.flatMap(([key]) => halves(key)),
    preferred: marked.filter(([, value]) => value === 'best').flatMap(([key]) => halves(key)),
  };
}

// a stored answer back into cells (for the admin's view)
export function cellsOf(slots = [], preferred = []) {
  const cells = {};
  slots.forEach((slot) => { cells[slot.slice(0, 6)] = cells[slot.slice(0, 6)] || 'ok'; });
  preferred.forEach((slot) => { cells[slot.slice(0, 6)] = 'best'; });
  return cells;
}
