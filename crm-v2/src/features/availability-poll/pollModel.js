// „Sobivad ajad” (owner 2026-10-20): a learner marks every hour of the week that really suits a lesson; the school then
// finds a teacher and a time. Hours 8–21; an hour is stored as its two half hours ("Mon-16:00", "Mon-16:30"), the
// format of functions/website-lead-core.js.
import { directionId } from '../students/studyDirections.js';

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

// Week by week (owner 2026-10-29: „ученик должен иметь возможность заполнять свой график и наперёд, чтобы работающие
// тоже могли удобно выбирать времена”): besides the usual week (slots / preferred) a learner may mark a dated week that
// differs — a shift worker's next weeks. studentAvailability.weeks = { 'YYYY-MM-DD' (its Monday): { slots, preferred } }.
// A week without its own entry is the usual week. Dates are the school's wall clock, read at local noon.
export const WEEKS_AHEAD = 4; // this week + 3 next
const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function mondayOf(date) {
  const day = new Date(`${String(date).slice(0, 10)}T12:00:00`);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  return iso(day);
}
const addDays = (date, days) => { const day = new Date(`${date}T12:00:00`); day.setDate(day.getDate() + days); return iso(day); };
// this week and the next ones: [{ monday, sunday }]
export function upcomingWeeks(today, count = WEEKS_AHEAD) {
  const first = mondayOf(today);
  return Array.from({ length: count }, (_, index) => { const monday = addDays(first, index * 7); return { monday, sunday: addDays(monday, 6) }; });
}
// the times of one week: its own entry, else the usual week; `own` says which
export function timesForWeek(item, monday) {
  const own = monday ? item?.weeks?.[monday] : null;
  if (own) return { slots: own.slots || [], preferred: own.preferred || [], own: true };
  return { slots: item?.slots || [], preferred: item?.preferred || [], own: false };
}
// the times on a date (the calendar): that date's week
export const timesOnDate = (item, date) => timesForWeek(item, date ? mondayOf(date) : '');
// the dated weeks still to come (older ones are dropped when saving)
export const futureWeeks = (weeks = {}, today) => Object.fromEntries(Object.entries(weeks || {}).filter(([monday]) => monday >= mondayOf(today)).sort(([a], [b]) => a.localeCompare(b)));

// Lessons a week the learner wants (team 2026-10-29: „сколько раз в неделю они хотят заниматься; если несколько курсов —
// отдельно на каждый курс”). studentAvailability.perWeek = { 'eesti-keel': 2, 'matemaatika': 1 }: one number 1–7 per
// active course of the card, keyed by the course's slug (studyDirections.js directionId of the subject, so 'Eesti keel'
// and 'eesti keel' are one key); a card without a subject has one field, key 'default'.
export const PER_WEEK_MAX = 7;
export const PER_WEEK_DEFAULT_KEY = 'default';
const KEY_PATTERN = /^[a-z0-9-]{1,60}$/;
export const perWeekKey = (subject) => (String(subject ?? '').trim() ? directionId(subject) : PER_WEEK_DEFAULT_KEY);
// the fields to show: [{ key, subject }] — one per course of the card, or one without a name
export function perWeekFields(subjects = []) {
  const seen = new Set();
  const list = (subjects || []).filter((subject) => String(subject ?? '').trim()).map((subject) => ({ key: perWeekKey(subject), subject: String(subject).trim() }))
    .filter((item) => !seen.has(item.key) && seen.add(item.key));
  return list.length ? list : [{ key: PER_WEEK_DEFAULT_KEY, subject: '' }];
}
// a whole number 1–7, else null
export const perWeekValue = (value) => { const number = Number(value); return Number.isInteger(number) && number >= 1 && number <= PER_WEEK_MAX ? number : null; };
// only valid keys and numbers, at most 10 courses
export function cleanPerWeek(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key]) => KEY_PATTERN.test(key)).map(([key, count]) => [key, perWeekValue(count)])
    .filter(([, count]) => count).slice(0, 10));
}
// what is saved, read with the card's courses: [{ key, subject, count }] — a course the card no longer has keeps its
// stored number (named by its key) so nothing silently disappears
export function perWeekRows(perWeek = {}, subjects = []) {
  const stored = cleanPerWeek(perWeek);
  const fields = perWeekFields(subjects);
  const rows = Object.entries(stored).map(([key, count]) => ({ key, subject: fields.find((item) => item.key === key)?.subject ?? (key === PER_WEEK_DEFAULT_KEY ? '' : key), count }));
  // one course on the card and a number saved before it got its subject: it is that course's number
  if (fields.length === 1 && rows.length === 1 && !fields.some((item) => item.key === rows[0].key) && rows[0].key === PER_WEEK_DEFAULT_KEY) rows[0].subject = fields[0].subject;
  const order = (row) => { const index = fields.findIndex((item) => item.key === row.key); return index < 0 ? 99 : index; };
  return rows.sort((a, b) => order(a) - order(b));
}
// „2× nädalas” or „Eesti keel 2× · Matemaatika 1× nädalas”; `only`: just the given courses (a teacher sees their own)
export function perWeekText(perWeek = {}, subjects = [], { only = false } = {}) {
  const keys = new Set(perWeekFields(subjects).map((item) => item.key));
  const rows = perWeekRows(perWeek, subjects).filter((row) => !only || keys.has(row.key));
  if (!rows.length) return '';
  if (rows.length === 1) return `${rows[0].subject ? `${rows[0].subject} ` : ''}${rows[0].count}× nädalas`;
  return `${rows.map((row) => `${row.subject || 'Tunnid'} ${row.count}×`).join(' · ')} nädalas`;
}
// the editor's starting values: the stored numbers by field ('' = not chosen); a lone 'default' fills a lone course
export function perWeekDraft(perWeek = {}, subjects = []) {
  const stored = cleanPerWeek(perWeek);
  const fields = perWeekFields(subjects);
  const lone = fields.length === 1 && Object.keys(stored).length === 1 ? Object.values(stored)[0] : null;
  return Object.fromEntries(fields.map((item) => [item.key, String(stored[item.key] ?? lone ?? '')]));
}
