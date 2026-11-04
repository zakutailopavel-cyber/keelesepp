import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { lessonsService, normalizeLesson } from './lessons.js';
import { scheduleService } from './schedule.js';
import { toIsoDate, shiftDate } from '../../features/calendar/calendarView.js';
import { REVIEW_DAYS, findUnmarkedLessons, liveSessions, summarizeUnmarked } from '../../features/calendar/unmarkedLessons.js';

// „Märkimata tunnid”: loads the calendar, the lesson marks and (for the page) the Live Classroom's summaries and
// recordings, and hands them to the pure findUnmarkedLessons. An admin sees every teacher; a teacher his own lessons
// (the rules let a teacher read only his own schedule / lessons / recordings). Reused by the admin's morning digest:
// `unmarkedLessonsService.count({ user, isAdmin })` → { total, evidence, duplicate, teacher }.
export const UNMARKED_CHANGED_EVENT = 'keelesepp:unmarked-lessons-changed';

// an admin reads only the marks of the period (single-field range, no extra index); a teacher reads his own
async function readLessons({ isAdmin, uid, from }) {
  if (!isAdmin) return lessonsService.listForCalendar({ teacherUid: uid });
  const { db } = requireFirebaseClient();
  const snapshot = await getDocs(query(collection(db, 'lessons'), where('date', '>=', from)));
  return snapshot.docs.map((item) => normalizeLesson(item.id, item.data()));
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

export const unmarkedLessonsService = {
  // { items, schedule } — items from findUnmarkedLessons; schedule = the raw entries (the cancel path needs them)
  async load({ user, isAdmin = false, today = toIsoDate(), days = REVIEW_DAYS, withEvidence = true } = {}) {
    const uid = user?.uid || '';
    if (!isAdmin && !uid) return { items: [], schedule: [] };
    const from = shiftDate(today, -days);
    const [schedule, lessons, sessions] = await Promise.all([
      scheduleService.list(isAdmin ? {} : { teacherUid: uid }),
      readLessons({ isAdmin, uid, from }),
      withEvidence ? readSessions({ isAdmin, uid, from }) : Promise.resolve([]),
    ]);
    const items = findUnmarkedLessons({ schedule, lessons, sessions, today, days, teacherUid: isAdmin ? '' : uid });
    return { items, schedule };
  },
  // the numbers only (nav badge, morning digest); without evidence the split is not known, so only `total` counts
  async count({ user, isAdmin = false, today = toIsoDate(), withEvidence = false } = {}) {
    const { items } = await unmarkedLessonsService.load({ user, isAdmin, today, withEvidence });
    return summarizeUnmarked(items);
  },
  // the calendar's own „Toimunud / Puudus” path (lesson record + schedule status + activityLog in one transaction)
  async mark(item, user, status = 'Toimunud') {
    const lesson = await lessonsService.completeFromSchedule(item, user, { status });
    unmarkedLessonsService.notifyChanged();
    return lesson;
  },
  // the calendar's own „Tühista tund” path, never a delete: one lesson of a weekly series gets its date excluded,
  // a one-off lesson gets the status „Tühistatud” (both can be undone in the calendar)
  async cancel(item, event = item) {
    if (!item?.id || !item.occurrenceDate) throw new Error('Tundi ei leitud.');
    if (item.recurring) {
      const excluded = event.excludedDates || [];
      await scheduleService.patch(item.id, { excludedDates: [...new Set([...excluded, item.occurrenceDate])] });
    } else {
      const { kind: _kind, evidence: _evidence, duplicateOf: _duplicateOf, ...current } = event;
      await scheduleService.cancel(item.id, current);
    }
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
