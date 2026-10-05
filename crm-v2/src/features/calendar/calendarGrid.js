// Time-grid layout and drag-and-drop planning for the calendar (spec: docs/specs/CALENDAR_V2_SPEC.md).
import { shiftDate } from './calendarView.js';

export const GRID_START = 8 * 60;
export const GRID_END = 21 * 60;
export const SNAP = 15;
export const PX_PER_MIN = 1.1;
const TONES = 6;

// stable colour per teacher
export function teacherTone(key = '') {
  let hash = 0;
  for (const char of String(key)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % TONES;
}
const DAY_IDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toMinutes(value) {
  const [hours, mins] = String(value || '').split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(mins) ? hours * 60 + mins : 0;
}

export function toClock(total) {
  const value = Math.max(0, Math.min(24 * 60 - 1, Math.round(total)));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export const snapMinutes = (value, step = SNAP) => Math.round(value / step) * step;
export const dayId = (isoDate) => DAY_IDS[new Date(`${isoDate}T12:00:00`).getDay()];

// Visible hours: 08:00–21:00, widened to whole hours so an earlier or later lesson is never hidden.
export function gridRange(items = []) {
  let start = GRID_START;
  let end = GRID_END;
  items.forEach((item) => {
    const from = toMinutes(item.time);
    start = Math.min(start, Math.floor(from / 60) * 60);
    end = Math.max(end, Math.min(24 * 60, Math.ceil((from + (Number(item.duration) || 60)) / 60) * 60));
  });
  return { start, end };
}

// Position lessons of one column: top/height in minutes from the range start, side-by-side lanes for overlaps.
export function layoutColumn(items, range = { start: GRID_START, end: GRID_END }) {
  const sorted = [...items]
    .map((item) => ({ item, start: toMinutes(item.time), end: toMinutes(item.time) + (Number(item.duration) || 60) }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const placed = [];
  let cluster = [];
  let clusterEnd = -1;
  let clusterIndex = 0;
  const flush = () => {
    const lanes = cluster.reduce((max, entry) => Math.max(max, entry.lane + 1), 1);
    cluster.forEach((entry) => { entry.lanes = lanes; });
    cluster = [];
    clusterIndex += 1;
  };
  for (const entry of sorted) {
    if (entry.start >= clusterEnd && cluster.length) flush();
    const used = new Set(cluster.filter((other) => other.end > entry.start).map((other) => other.lane));
    let lane = 0;
    while (used.has(lane)) lane += 1;
    const placedEntry = { ...entry, lane, lanes: 1, cluster: clusterIndex };
    cluster.push(placedEntry);
    placed.push(placedEntry);
    clusterEnd = Math.max(clusterEnd, entry.end);
  }
  if (cluster.length) flush();
  return placed.map(({ item, start, end, lane, lanes, cluster: clusterId }) => ({
    item,
    cluster: clusterId,
    top: Math.max(0, start - range.start),
    height: Math.max(SNAP, Math.min(end, range.end) - Math.max(start, range.start)),
    lane,
    lanes,
    outside: end <= range.start || start >= range.end,
  }));
}

// Lessons that are already accounting records (done / absent) or cancelled are not moved.
export function canMove(item) {
  return Boolean(item) && !item.lessonRecordId && !['Toimunud', 'Tühistatud', 'Puudus_eta', 'Puudus_p'].includes(item.status);
}

const COPY_FIELDS = ['studentId', 'studentName', 'teacher', 'teacherUid', 'subject', 'level', 'groupId', 'note'];

/**
 * Plan a move of one occurrence. Returns { apply, undo } lists of operations:
 *   { op: 'patch', id, fields } | { op: 'create', key, data } | { op: 'remove', key }
 * scope: 'single' = only this lesson, 'series' = this and all following (recurring only).
 */
export function planMove(item, { toDate, toTime, duration, scope = 'single' }) {
  const from = item.occurrenceDate || item.date;
  const length = Math.max(SNAP, Number(duration ?? item.duration) || 60);
  const moved = { date: toDate, day: dayId(toDate), time: toTime, duration: length };
  if (!item.recurring) {
    return {
      apply: [{ op: 'patch', id: item.id, fields: moved }],
      undo: [{ op: 'patch', id: item.id, fields: { date: item.date, day: item.day || dayId(item.date), time: item.time, duration: Number(item.duration) || 60 } }],
    };
  }
  const base = Object.fromEntries(COPY_FIELDS.filter((key) => item[key] !== undefined && item[key] !== '').map((key) => [key, item[key]]));
  const excluded = item.excludedDates || [];
  if (scope === 'single') {
    return {
      apply: [
        { op: 'patch', id: item.id, fields: { excludedDates: [...new Set([...excluded, from])] } },
        { op: 'create', key: 'single', data: { ...base, ...moved, recurring: false, status: 'Planeeritud', movedFromSeriesId: item.id, movedFromDate: from } },
      ],
      undo: [
        { op: 'remove', key: 'single' },
        { op: 'patch', id: item.id, fields: { excludedDates: excluded } },
      ],
    };
  }
  const start = item.startDate || item.date;
  if (from <= start) {
    // the whole series moves
    return {
      apply: [{ op: 'patch', id: item.id, fields: { ...moved, startDate: toDate } }],
      undo: [{ op: 'patch', id: item.id, fields: { date: item.date || start, startDate: start, day: item.day || dayId(start), time: item.time, duration: Number(item.duration) || 60 } }],
    };
  }
  return {
    apply: [
      { op: 'patch', id: item.id, fields: { endDate: shiftDate(from, -1) } },
      { op: 'create', key: 'series', data: { ...base, ...moved, startDate: toDate, recurring: true, status: 'Planeeritud', excludedDates: excluded.filter((date) => date > from), continuesSeriesId: item.id, ...(item.endDate ? { endDate: item.endDate } : {}) } },
    ],
    undo: [
      { op: 'remove', key: 'series' },
      { op: 'patch', id: item.id, fields: { endDate: item.endDate || '' } },
    ],
  };
}

// Fields that belong to one displayed occurrence, not to the stored schedule record.
const OCCURRENCE_FIELDS = ['occurrenceDate', 'occurrenceId', 'lessonRecordId', 'record', 'recordTopic'];
// The old Google event is deleted with the record; a restored record must get a fresh one.
const isGoogleLinkField = (key) => key.startsWith('gcal') && key !== 'gcalImportSuppressed';

/**
 * Plan deleting a lesson that was added by mistake or is not needed. Same operation lists as planMove, plus
 *   { op: 'delete', id } and { op: 'restore', id, data } (undo puts the same record back under the same id).
 * scope for a weekly lesson: 'single' = only this date, 'series' = this and all following.
 * `stored` is the schedule record as saved; `hasRecords` = the series already has held/absent lessons, which are
 * accounting history, so the record itself is never removed then (the series only ends before this date).
 */
export function planDelete(item, { scope = 'single', stored = item, hasRecords = false } = {}) {
  const data = Object.fromEntries(Object.entries(stored || {}).filter(([key]) => key !== 'id' && !OCCURRENCE_FIELDS.includes(key) && !isGoogleLinkField(key)));
  const removeRecord = { apply: [{ op: 'delete', id: item.id }], undo: [{ op: 'restore', id: item.id, data }] };
  if (!item.recurring) {
    if (hasRecords) throw new Error('Toimunud tundi ei saa kustutada.');
    return removeRecord;
  }
  const from = item.occurrenceDate || item.date;
  const excluded = item.excludedDates || [];
  if (scope === 'single') {
    return {
      apply: [{ op: 'patch', id: item.id, fields: { excludedDates: [...new Set([...excluded, from])] } }],
      undo: [{ op: 'patch', id: item.id, fields: { excludedDates: excluded } }],
    };
  }
  const start = item.startDate || item.date;
  if (from <= start && !hasRecords) return removeRecord;
  return {
    apply: [{ op: 'patch', id: item.id, fields: { endDate: shiftDate(from, -1) } }],
    undo: [{ op: 'patch', id: item.id, fields: { endDate: item.endDate || '' } }],
  };
}
