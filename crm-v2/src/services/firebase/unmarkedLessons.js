import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { lessonsService, normalizeLesson } from './lessons.js';
import { normalizeScheduleEvent, scheduleService } from './schedule.js';
import { shareInFlight } from './shareInFlight.js';
import { studentsService } from './students.js';
import { teachersService } from './teachers.js';
import { toIsoDate, shiftDate } from '../../features/calendar/calendarView.js';
import { MARKING_START, findUnmarkedLessons, liveSessions, markingSplit, olderWindow, summarizeUnmarked, unmarkedReminder } from '../../features/calendar/unmarkedLessons.js';

// „Märkimata tunnid”: loads the calendar, the lesson marks, the context of the exclusions (archived cards, staff
// accounts, closed financial days) and, for the page, the Live Classroom's summaries and recordings, and hands them to
// the pure markingSplit (features/calendar/unmarkedLessons.js — the ONE definition, docs/LESSON_MARKING.md). An admin
// sees every teacher plus „Vajab admini”; a teacher only his own counted lessons. Reused by the menu badge, the bell and
// the admin's digest: `unmarkedLessonsService.count({ user, isAdmin })` → { total, evidence, duplicate, teacher }.
export const UNMARKED_CHANGED_EVENT = 'keelesepp:unmarked-lessons-changed';

// the marks of the window: an admin by date (single-field range), a teacher his own (the rules need the teacherUid
// filter; no composite index needed)
async function readLessons({ isAdmin, uid, from }) {
  if (!isAdmin) return lessonsService.listForCalendar({ teacherUid: uid });
  const { db } = requireFirebaseClient();
  const snapshot = await getDocs(query(collection(db, 'lessons'), where('date', '>=', from)));
  return snapshot.docs.map((item) => normalizeLesson(item.id, item.data()));
}

// Only the calendar entries that can fall into the window (faster than the whole schedule, owner 2026-11-09): every
// weekly series + the one-off lessons from the window's first day. Single-field queries, no new index. A teacher
// reads his own entries (the rules need the teacherUid filter) and the window is applied in memory.
async function readSchedule({ isAdmin, uid, from }) {
  if (!isAdmin) return scheduleService.list({ teacherUid: uid });
  const { db } = requireFirebaseClient();
  const reference = collection(db, 'schedule');
  const [series, single] = await Promise.all([
    getDocs(query(reference, where('recurring', '==', true))),
    getDocs(query(reference, where('date', '>=', from))),
  ]);
  const unique = new Map();
  [...series.docs, ...single.docs].forEach((item) => unique.set(item.id, normalizeScheduleEvent(item.id, item.data())));
  return [...unique.values()];
}

// Live Classroom evidence of the period. lessonSummaries is readable by every staff member; a teacher keeps his own.
// lessonRecordings: an admin by start time, a teacher his own (the rules require the teacherUid filter).
async function readSessions({ isAdmin, uid, from }) {
  const { db } = requireFirebaseClient();
  const fromIso = new Date(`${shiftDate(from, -1)}T00:00:00Z`).toISOString();
  const summariesQuery = query(collection(db, 'lessonSummaries'), where('endedAt', '>=', fromIso));
  const recordingsQuery = isAdmin
    ? query(collection(db, 'lessonRecordings'), where('startedAt', '>=', fromIso))
    : query(collection(db, 'lessonRecordings'), where('teacherUid', '==', uid));
  const [summaries, recordings] = await Promise.all([
    getDocs(summariesQuery).then((snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))).catch(() => []),
    getDocs(recordingsQuery).then((snapshot) => snapshot.docs.map((item) => {
      const { invitationId, studentId, teacherUid, teacherName, startedAt, endedAt } = item.data();
      return { id: item.id, invitationId, studentId, teacherUid, teacherName, startedAt, endedAt };
    })).catch(() => []),
  ]);
  return liveSessions({
    summaries: summaries.filter((item) => isAdmin || !item.teacherUid || item.teacherUid === uid),
    recordings: recordings.filter((item) => String(item.startedAt || '') >= fromIso),
  });
}

// closed financial days from `from` on (financialLockedDates/{YYYY-MM-DD}); a teacher may read them once the rules of
// this change are deployed — before that the read fails and nothing is excluded for him (the write is refused anyway)
async function readLockedDates(from) {
  const { db } = requireFirebaseClient();
  const snapshot = await getDocs(query(collection(db, 'financialLockedDates'), where(documentId(), '>=', from)));
  return snapshot.docs.map((item) => item.id);
}

const optional = (read, fallback) => Promise.resolve().then(read).catch(() => fallback);

export const unmarkedLessonsService = {
  // the exclusions' context (markingContext): shared by the page, the calendar, the dashboard and the badge
  context({ user, isAdmin = false, from = MARKING_START } = {}) {
    const uid = user?.uid || '';
    return shareInFlight(`marking-context:${isAdmin ? 'admin' : uid}:${from}`, async () => {
      const [archived, staff, lockedDates] = await Promise.all([
        optional(() => studentsService.list({ status: 'archived', includeDeleted: true, pageSize: 500, exhaustive: true, ...(isAdmin ? {} : { scopeTeacherUid: uid }) }).then((result) => result.items || []), []),
        isAdmin ? optional(() => teachersService.list({ includeDeleted: true }), null) : Promise.resolve(null),
        optional(() => readLockedDates(from), []),
      ]);
      return { archivedStudentIds: archived.filter((student) => student.active === false || student.deletedAt).map((student) => student.id), staff, lockedDates };
    });
  },
  // { items, adminItems, schedule, olderCount } — items / adminItems from markingSplit; schedule = the raw entries
  // (the cancel path needs them). `older`: the admin's „Vanemad (enne 1.11)” view instead of the counted window.
  // `withEvidence: false` skips the Live Classroom reads (the page shows the rows first, then adds the evidence).
  async load({ user, isAdmin = false, today = toIsoDate(), withEvidence = true, older = false } = {}) {
    const uid = user?.uid || '';
    if (!isAdmin && !uid) return { items: [], adminItems: [], schedule: [], olderCount: 0 };
    const window = older && isAdmin ? olderWindow() : { from: MARKING_START, to: '' };
    // an admin reads from the start of the „Vanemad” window once, so the small „Vanemad (enne 1.11)” count costs no
    // second read
    const readFrom = isAdmin ? olderWindow().from : window.from;
    const [schedule, lessons, sessions, context] = await Promise.all([
      readSchedule({ isAdmin, uid, from: readFrom }),
      readLessons({ isAdmin, uid, from: readFrom }),
      withEvidence ? readSessions({ isAdmin, uid, from: window.from }) : Promise.resolve([]),
      unmarkedLessonsService.context({ user, isAdmin, from: readFrom }),
    ]);
    const split = markingSplit({ schedule, lessons, sessions, today, teacherUid: isAdmin ? '' : uid, context, ...window });
    const olderCount = isAdmin && !older ? findUnmarkedLessons({ schedule, lessons, today, ...olderWindow() }).length : 0;
    return { ...split, schedule, olderCount, lessons, context };
  },
  // the Live Classroom evidence added to rows already on screen (the page loads in two steps)
  async withEvidence({ user, isAdmin = false, today = toIsoDate(), loaded, older = false }) {
    const uid = user?.uid || '';
    const window = older && isAdmin ? olderWindow() : { from: MARKING_START, to: '' };
    const sessions = await readSessions({ isAdmin, uid, from: window.from });
    const split = markingSplit({ schedule: loaded.schedule, lessons: loaded.lessons, sessions, today, teacherUid: isAdmin ? '' : uid, context: loaded.context, ...window });
    return { ...loaded, ...split };
  },
  // the numbers only (nav badge, morning digest); without evidence the split is not known, so only `total` counts
  async count({ user, isAdmin = false, today = toIsoDate(), withEvidence = false } = {}) {
    const { items } = await unmarkedLessonsService.load({ user, isAdmin, today, withEvidence });
    return summarizeUnmarked(items);
  },
  // a teacher's own reminder (bell + home banner, owner 2026-11-09): { total, oldest, oldestLabel, stale } of the
  // counted window; read only from the calendar and the marks (no Live evidence: it changes the kind, not the set)
  async reminder({ user, today = toIsoDate() } = {}) {
    const { items } = await unmarkedLessonsService.load({ user, isAdmin: false, today, withEvidence: false });
    return unmarkedReminder(items, today);
  },
  // the calendar's own „Toimunud / Puudus” path (lesson record + schedule status + activityLog in one transaction)
  async mark(item, user, status = 'Toimunud') {
    const lesson = await lessonsService.completeFromSchedule(item, user, { status });
    unmarkedLessonsService.notifyChanged();
    return lesson;
  },
  // the undo of the page's snackbar: the mark just written is removed through the calendar's „Paranda märge → Eemalda”
  // path (a crm_v2 record, so the client removes it; an invoiced / closed one is refused by the rules)
  async unmark(record, user, { recurring = true } = {}) {
    await lessonsService.removeMark(record, user, { scheduleRecurring: Boolean(recurring) });
    unmarkedLessonsService.notifyChanged();
  },
  // the calendar's own „Tühista tund” path, never a delete: one lesson of a weekly series gets its date excluded,
  // a one-off lesson gets the status „Tühistatud” (both can be undone in the calendar)
  async cancel(item, event = item) {
    if (!item?.id || !item.occurrenceDate) throw new Error('Tundi ei leitud.');
    if (item.recurring) {
      const excluded = event.excludedDates || [];
      await scheduleService.patch(item.id, { excludedDates: [...new Set([...excluded, item.occurrenceDate])] });
    } else {
      const { kind: _kind, evidence: _evidence, duplicateOf: _duplicateOf, reason: _reason, ...current } = event;
      await scheduleService.cancel(item.id, current);
    }
    unmarkedLessonsService.notifyChanged();
  },
  // „Lõpeta sari” (admin): the series gets an end date; the old one is kept on the entry for the undo
  async endSeries(item, endDate, user) {
    if (!item?.id || !item.recurring || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || '')) throw new Error('Sarja ei saa lõpetada.');
    const previous = item.endDate || '';
    await scheduleService.patch(item.id, { endDate, seriesEndedAt: new Date().toISOString(), seriesEndedBy: user?.displayName || user?.email || '', seriesEndedPreviousEndDate: previous });
    unmarkedLessonsService.notifyChanged();
    return { previous };
  },
  async restoreSeriesEnd(item, previous = '') {
    await scheduleService.patch(item.id, { endDate: previous || '', seriesEndedAt: '', seriesEndedBy: '', seriesEndedPreviousEndDate: '' });
    unmarkedLessonsService.notifyChanged();
  },
  // „Määra õpetaja” (admin): the entry (the whole series for a weekly one) gets a teacher
  async assignTeacher(item, teacher) {
    if (!item?.id || !teacher?.id) throw new Error('Vali õpetaja.');
    await scheduleService.patch(item.id, { teacherUid: teacher.id, teacher: teacher.name || '' });
    unmarkedLessonsService.notifyChanged();
  },
  // tell the nav badge that a lesson was marked / cancelled; `total` when the sender knows the new number
  notifyChanged(total) {
    try {
      globalThis.dispatchEvent?.(new globalThis.CustomEvent(UNMARKED_CHANGED_EVENT, { detail: Number.isFinite(total) ? { total } : {} }));
    } catch { /* no window (server) */ }
  },
  // the admin's menu badge: the number now and after every change; returns the unsubscribe
  subscribeCount({ user, isAdmin = false }, onCount) {
    let alive = true;
    let round = 0;
    const refresh = () => {
      const mine = ++round;
      return unmarkedLessonsService.count({ user, isAdmin })
        .then((summary) => { if (alive && mine === round) onCount(summary.total); })
        .catch(() => { /* the badge stays as it was */ });
    };
    const onChange = (event) => {
      if (!Number.isFinite(event?.detail?.total)) { refresh(); return; }
      round += 1; // a slower load started before must not overwrite this number
      onCount(event.detail.total);
    };
    refresh();
    globalThis.addEventListener?.(UNMARKED_CHANGED_EVENT, onChange);
    return () => { alive = false; globalThis.removeEventListener?.(UNMARKED_CHANGED_EVENT, onChange); };
  },
};
