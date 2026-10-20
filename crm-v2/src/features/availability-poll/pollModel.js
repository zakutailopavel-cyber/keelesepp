// „Sobivad ajad” (owner 2026-10-20): a learner marks every hour of the week that really suits a lesson; the school then
// finds a teacher and a time. Hours 8–21; an hour is stored as its two half hours ("Mon-16:00", "Mon-16:30"), the
// format of functions/website-lead-core.js.
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = Array.from({ length: 14 }, (_, index) => 8 + index); // 8:00 … 21:00 (the last hour ends at 22)
export const PARTS = [{ key: 'morning', from: 8, to: 12 }, { key: 'day', from: 12, to: 17 }, { key: 'evening', from: 17, to: 22 }];
export const cellKey = (day, hour) => `${day}-${String(hour).padStart(2, '0')}`;

// a tap: empty → suits → best → empty
export const NEXT = { '': 'ok', ok: 'best', best: '' };

// quick choices: weekday evenings, weekday daytime, weekends — added to what is marked (never removes)
export const PRESETS = {
  weekdayEvenings: { days: DAYS.slice(0, 5), from: 17, to: 21 },
  weekdayDays: { days: DAYS.slice(0, 5), from: 9, to: 17 },
  weekend: { days: DAYS.slice(5), from: 10, to: 18 },
};
export function withPreset(cells = {}, preset) {
  const next = { ...cells };
  preset.days.forEach((day) => HOURS.filter((hour) => hour >= preset.from && hour < preset.to).forEach((hour) => { const key = cellKey(day, hour); next[key] = next[key] || 'ok'; }));
  return next;
}

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

// per day the marked hours as ranges: [{ day, ranges: ["16–19"], best: ["17–18"] }]
export function summaryOf(cells = {}) {
  const ranges = (hours) => {
    const out = [];
    hours.forEach((hour) => { const last = out[out.length - 1]; if (last && last[1] === hour) last[1] = hour + 1; else out.push([hour, hour + 1]); });
    return out.map(([from, to]) => `${from}–${to}`);
  };
  return DAYS.map((day) => ({
    day,
    ranges: ranges(HOURS.filter((hour) => cells[cellKey(day, hour)])),
    best: ranges(HOURS.filter((hour) => cells[cellKey(day, hour)] === 'best')),
  })).filter((row) => row.ranges.length);
}
