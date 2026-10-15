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

// a range minus several ranges (minutes)
function cut(part, holes) {
  let pieces = [part];
  for (const hole of holes) {
    pieces = pieces.flatMap((piece) => (!overlaps(piece, hole) ? [piece] : [
      ...(piece.start < hole.start ? [{ ...piece, end: hole.start }] : []),
      ...(hole.end < piece.end ? [{ ...piece, start: hole.end }] : []),
    ]));
  }
  return pieces.filter((piece) => piece.end > piece.start);
}

// The windows that count on one date (minutes): a window set for this date overrides the weekly ones where they
// overlap (an exception for one day, also „open” = nothing marked on that day); „open” windows are not returned.
export function effectiveSlots(availability, date) {
  const all = slotsOn(availability, date).map((slot) => ({ ...slot, ...range(slot) })).filter((slot) => slot.end > slot.start);
  const dated = all.filter((slot) => slot.date);
  const weekly = all.filter((slot) => !slot.date).flatMap((slot) => cut(slot, dated));
  return [...weekly, ...dated].filter((slot) => slot.kind !== 'open').sort((a, b) => a.start - b.start);
}

// 'busy' (touches a red window), 'online' (touches a yellow window: online lessons only), 'free' (fully inside green
// windows) or 'open' (nothing marked there)
export function availabilityAt(availability, { date, time, duration = 60 }) {
  const lesson = { start: toMinutes(time), end: toMinutes(time) + (Number(duration) || 60) };
  const slots = effectiveSlots(availability, date);
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
  return effectiveSlots(availability, date);
}

// Painting a window: overlapping windows of the same scope (same weekday, or same date) are replaced by the new one
export function paintSlot(slots = [], next) {
  const scope = (slot) => (slot.date ? `d:${slot.date}` : `w:${slot.day}`);
  const nextRange = range(next);
  const kept = (slots || []).filter((slot) => scope(slot) !== scope(next) || !overlaps(range(slot), nextRange));
  return [...kept, next].sort((a, b) => scope(a).localeCompare(scope(b)) || a.start.localeCompare(b.start)).slice(0, MAX_SLOTS);
}

// ---------- one half-hour cell (Oleksiy 2026-10-15: a click on a cell sets its status) ----------
const newId = () => `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// The status of a cell: kind 'free' | 'online' | 'busy' | 'clear', for this date or every week. Windows of the same
// scope that overlap the cell are cut around it (a 9–17 window stays 9–12 and 12:30–17), the cell gets the new
// window, neighbours of the same kind join. Clearing one date inside a weekly window stores an „open” exception.
export function setCellStatus(slots = [], { date, weekly = false, start, end, kind }) {
  const day = DAY_IDS[new Date(`${date}T12:00:00`).getDay()];
  const scopeOf = (slot) => (slot.date ? `d:${slot.date}` : `w:${slot.day}`);
  const scope = weekly ? `w:${day}` : `d:${date}`;
  const cell = { start: toMinutes(start), end: toMinutes(end) };
  const same = [];
  const other = [];
  (slots || []).forEach((slot) => (scopeOf(slot) === scope ? same : other).push(slot));
  const pieces = same.flatMap((slot) => cut({ ...slot, ...range(slot) }, [cell]).map((piece, index) => ({ ...slot, ...(index ? { id: newId() } : {}), start: clock(piece.start), end: clock(piece.end) })));
  let added = null;
  if (kind !== 'clear') added = { id: newId(), kind, start, end, ...(weekly ? { day } : { date }) };
  else if (!weekly && (slots || []).some((slot) => !slot.date && slot.day === day && overlaps(range(slot), cell))) added = { id: newId(), kind: 'open', start, end, date };
  // join neighbours of the same kind
  const merged = [...pieces, ...(added ? [added] : [])].sort((a, b) => a.start.localeCompare(b.start)).reduce((list, slot) => {
    const last = list[list.length - 1];
    if (last && last.kind === slot.kind && last.end === slot.start) { list[list.length - 1] = { ...last, end: slot.end }; return list; }
    return [...list, slot];
  }, []);
  const next = [...other, ...merged];
  if (next.length > MAX_SLOTS) throw new Error(`Liiga palju märgitud aegu (kuni ${MAX_SLOTS}). Ühenda või eemalda mõni.`);
  return next;
}

// what a cell shows now: 'free' | 'online' | 'busy' | 'open', and whether it comes from a weekly window
export function cellStatus(availability, { date, start, end }) {
  const cell = { start: toMinutes(start), end: toMinutes(end) };
  const hit = effectiveSlots(availability, date).find((slot) => overlaps(slot, cell));
  return { kind: hit?.kind || 'open', weekly: Boolean(hit && !hit.date) };
}
