// The teacher's week as a grid (Oleksiy 2026-10-24: „опросник для учителей такой же, как у учеников — табличка с
// «доступен», «только онлайн», «недоступен»”). Rows are half hours 08:00–22:00, columns Mon–Sun; a cell is
// 'free' (Saadaval, green), 'online' (Ainult veebis, yellow), 'busy' (Ei saa, red) or empty. The grid edits only the
// WEEKLY windows of teacherAvailability/{uid} (availabilityModel.js); windows for one date stay as they are.
// A cell key is the student poll's format ("Mon-16:00", studentAvailability), so both grids line up cell for cell.
// Everything is wall-clock text: no Date arithmetic on times, so a DST change cannot move a cell.
import { toMinutes } from './calendarGrid.js';
import { lessonsOn } from './studentTimesModel.js';

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const GRID_START = 8 * 60;
export const GRID_END = 22 * 60;
export const HALVES = Array.from({ length: (GRID_END - GRID_START) / 30 }, (_, index) => GRID_START + index * 30);
export const KINDS = ['free', 'online', 'busy'];
const RANK = { free: 1, online: 2, busy: 3 };
const MAX_SLOTS = 200;

export const clock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export const cellKey = (day, minutes) => `${day}-${clock(minutes)}`;
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
const span = (slot) => ({ start: toMinutes(slot.start), end: toMinutes(slot.end) });
const weekly = (slot) => !slot.date && WEEK_DAYS.includes(slot.day);

// weekly windows → cells. A cell takes the strongest window that touches it (red over yellow over green).
export function cellsFromSlots(slots = []) {
  const cells = {};
  (slots || []).filter(weekly).filter((slot) => RANK[slot.kind]).forEach((slot) => {
    const range = span(slot);
    HALVES.forEach((at) => {
      if (!overlaps(range, { start: at, end: at + 30 })) return;
      const key = cellKey(slot.day, at);
      if (!cells[key] || RANK[slot.kind] > RANK[cells[key]]) cells[key] = slot.kind;
    });
  });
  return cells;
}

// one day's cells → windows: neighbouring cells of the same kind join ({ kind, start, end } as "HH:MM")
export function runsOfDay(cells = {}, day) {
  const runs = [];
  HALVES.forEach((at) => {
    const kind = cells[cellKey(day, at)] || '';
    const last = runs[runs.length - 1];
    if (!kind) return;
    if (last && last.kind === kind && last.end === at) last.end = at + 30;
    else runs.push({ kind, start: at, end: at + 30 });
  });
  return runs.map((run) => ({ kind: run.kind, start: clock(run.start), end: clock(run.end) }));
}

const newId = () => `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * The slots to save after the grid was edited. `touched` = the weekdays the grid changed: their weekly windows are
 * rebuilt from the cells (a part before 08:00 or after 22:00 is kept), every other window — other weekdays, every
 * date window — is kept exactly as it was (same id, same times). Throws when more than 200 windows would result.
 */
export function slotsFromCells(slots = [], cells = {}, touched = WEEK_DAYS, makeId = newId) {
  const days = new Set(touched);
  const kept = [];
  const outside = [];
  (slots || []).forEach((slot) => {
    if (!weekly(slot) || !days.has(slot.day)) { kept.push(slot); return; }
    const range = span(slot);
    if (range.start < GRID_START) outside.push({ ...slot, end: clock(Math.min(range.end, GRID_START)) });
    if (range.end > GRID_END) outside.push({ ...slot, id: range.start < GRID_START ? makeId() : slot.id, start: clock(Math.max(range.start, GRID_END)) });
  });
  const rebuilt = WEEK_DAYS.filter((day) => days.has(day)).flatMap((day) => runsOfDay(cells, day).map((run) => ({ id: makeId(), ...run, day })));
  const next = [...kept, ...outside.filter((slot) => toMinutes(slot.end) > toMinutes(slot.start)), ...rebuilt];
  if (next.length > MAX_SLOTS) throw new Error(`Liiga palju märgitud aegu (kuni ${MAX_SLOTS}). Ühenda või eemalda mõni.`);
  return next;
}

// the weekdays whose cells differ between two grids
export function changedDays(before = {}, after = {}) {
  return WEEK_DAYS.filter((day) => HALVES.some((at) => (before[cellKey(day, at)] || '') !== (after[cellKey(day, at)] || '')));
}

// windows for one date from `today` on, sorted (shown beside the grid; the grid never changes them)
export function datedSlots(slots = [], today = '') {
  return (slots || []).filter((slot) => slot.date && slot.date >= today).sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}

// weekly windows the grid cannot show (before 08:00, after 22:00): kept, listed under the grid
export function outsideGrid(slots = []) {
  return (slots || []).filter(weekly).filter((slot) => toMinutes(slot.start) < GRID_START || toMinutes(slot.end) > GRID_END);
}

/**
 * The teacher's lessons of one week on the grid: key → [{ id, label, online, first }] (`first` = the lesson starts in
 * this cell). `dates` = the week's seven dates Monday first; cancelled lessons are left out.
 */
export function lessonCells(events = [], dates = [], { teacherUid = '', teacherName = '' } = {}) {
  const out = {};
  dates.forEach((date, index) => {
    const day = WEEK_DAYS[index];
    lessonsOn(events, date, { teacherUid, teacherName }).filter((entry) => entry.teacher).forEach(({ event }) => {
      const start = toMinutes(event.time);
      const end = start + (Number(event.duration) || 60);
      HALVES.filter((at) => overlaps({ start, end }, { start: at, end: at + 30 })).forEach((at, position) => {
        const key = cellKey(day, at);
        (out[key] = out[key] || []).push({ id: event.id, label: `${event.time} ${event.isGroup ? `grupp ${event.studentName || ''}`.trim() : event.studentName || 'tund'}`, online: event.online === true, first: position === 0 });
      });
    });
  });
  return out;
}

// a lesson that sits in a red cell, or an on-site lesson in a yellow cell
export const clashOf = (kind, lessons = []) => Boolean(lessons.length) && (kind === 'busy' || (kind === 'online' && lessons.some((lesson) => !lesson.online)));

// a student's „Sobivad ajad” on the same grid: key → 'ok' | 'best'
export function studentCells(availability) {
  const best = new Set(availability?.preferred || []);
  return Object.fromEntries((availability?.slots || []).map((key) => [key, best.has(key) ? 'best' : 'ok']));
}
