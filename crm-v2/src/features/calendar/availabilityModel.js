import { toMinutes } from './calendarGrid.js';

// Teacher availability: green „free” windows where lessons may be planned, yellow „online” windows where only online
// lessons may go, red „busy” windows where no lesson can go. A window repeats weekly (`day`: Mon…Sun) or is for one
// date (`date`). Red wins over yellow, yellow over green.
export const DAY_IDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MAX_SLOTS = 200;

const dayOf = (date) => DAY_IDS[new Date(`${date}T12:00:00`).getDay()];

export function slotsOn(availability, date) {
  if (!availability || !date) return [];
  const day = dayOf(date);
  return (availability.slots || []).filter((slot) => (slot.date ? slot.date === date : slot.day === day));
}

const overlaps = (a, b) => a.start < b.end && b.start < a.end;
const range = (slot) => ({ start: toMinutes(slot.start), end: toMinutes(slot.end) });

// 'busy' (touches a red window), 'online' (touches a yellow window: online lessons only), 'free' (fully inside green
// windows) or 'open' (nothing marked there)
export function availabilityAt(availability, { date, time, duration = 60 }) {
  const lesson = { start: toMinutes(time), end: toMinutes(time) + (Number(duration) || 60) };
  const slots = slotsOn(availability, date).map((slot) => ({ ...slot, ...range(slot) }));
  if (slots.some((slot) => slot.kind === 'busy' && overlaps(slot, lesson))) return 'busy';
  if (slots.some((slot) => slot.kind === 'online' && overlaps(slot, lesson))) return 'online';
  const free = slots.filter((slot) => slot.kind === 'free').sort((a, b) => a.start - b.start);
  let covered = lesson.start;
  for (const slot of free) {
    if (slot.start > covered) break;
    covered = Math.max(covered, slot.end);
    if (covered >= lesson.end) return 'free';
  }
  return 'open';
}

export function busyMessage(teacherName, { date, time }) {
  return `${teacherName || 'Õpetaja'} ei ole ${date} kell ${time} saadaval (punane aeg). Vali roheline või märkimata aeg.`;
}

export function onlineOnlyMessage(teacherName, { date, time }) {
  return `${teacherName || 'Õpetaja'} annab ${date} kell ${time} ainult veebitunde (kollane aeg). Märgi tund „Veebitund” või vali teine aeg.`;
}

// the reason a lesson cannot go there, or '' when it can
export function windowProblem(availability, lesson, teacherName = '') {
  const state = availabilityAt(availability, lesson);
  if (state === 'busy') return busyMessage(teacherName, lesson);
  if (state === 'online' && !lesson.online) return onlineOnlyMessage(teacherName, lesson);
  return '';
}

// Background bands of one day for the time grid
export function bandsOn(availability, date) {
  return slotsOn(availability, date).map((slot) => ({ ...slot, ...range(slot) })).filter((slot) => slot.end > slot.start);
}

// Painting a window: overlapping windows of the same scope (same weekday, or same date) are replaced by the new one
export function paintSlot(slots = [], next) {
  const scope = (slot) => (slot.date ? `d:${slot.date}` : `w:${slot.day}`);
  const nextRange = range(next);
  const kept = (slots || []).filter((slot) => scope(slot) !== scope(next) || !overlaps(range(slot), nextRange));
  return [...kept, next].sort((a, b) => scope(a).localeCompare(scope(b)) || a.start.localeCompare(b.start)).slice(0, MAX_SLOTS);
}
