// In-room attendance (teacher): Kohal / Hilines (minutes) / Puudub per participant, prefilled from who joined and when.
// The marks are kept with the lesson plan (`liveLessonPlans/{roomKey}.attendance`, staff-only). A 1:1 room started
// from the calendar hands its mark to the calendar's existing „Toimunud” flow (lessonHandoff.js → completeFromSchedule):
// Kohal / Hilines → „Toimunud”, Puudub → „Puudus_eta” — the same statuses the calendar buttons write.

export const ATTENDANCE_STATUS = ['present', 'late', 'absent'];
export const ATTENDANCE_LABEL = { present: 'Kohal', late: 'Hilines', absent: 'Puudub' };
// joining up to this many minutes after the start counts as on time
export const LATE_AFTER_MINUTES = 5;

const millis = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

// The planned start of the lesson: the calendar lesson's day and time when the room was started from it, else 0.
export function plannedStartMs(timing) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(timing?.date || ''));
  const time = /^(\d{1,2}):(\d{2})$/.exec(String(timing?.time || ''));
  if (!match || !time) return 0;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(time[1]), Number(time[2])).getTime();
}

/**
 * The suggested mark of one participant.
 * participant: { studentId, name, joinedAt (ms / Timestamp / ISO, when they came into the room), online }
 * startMs: the planned start (calendar) or the room's start. Not joined and not online → Puudub; joined more than
 * 5 minutes after the start → Hilines with the minutes; else Kohal.
 */
export function suggestMark(participant, startMs = 0) {
  const joined = millis(participant?.joinedAt);
  if (!joined && !participant?.online) return { status: 'absent', lateMinutes: 0, joinedAt: '' };
  const late = joined && startMs ? Math.round((joined - startMs) / 60_000) : 0;
  const joinedAt = joined ? new Date(joined).toISOString() : '';
  return late > LATE_AFTER_MINUTES ? { status: 'late', lateMinutes: Math.min(240, late), joinedAt } : { status: 'present', lateMinutes: 0, joinedAt };
}

// Every participant's mark: the teacher's saved one, else the suggestion (`auto: true`).
export function attendanceMarks(participants = [], saved = {}, startMs = 0) {
  return participants.filter((item) => item?.studentId).map((participant) => {
    const stored = saved?.[participant.studentId];
    if (stored && ATTENDANCE_STATUS.includes(stored.status)) {
      return { studentId: participant.studentId, name: participant.name || stored.name || 'Õpilane', status: stored.status, lateMinutes: stored.status === 'late' ? Math.max(1, Number(stored.lateMinutes) || 1) : 0, joinedAt: stored.joinedAt || '', auto: false };
    }
    return { studentId: participant.studentId, name: participant.name || 'Õpilane', ...suggestMark(participant, startMs), auto: true };
  });
}

// One saved mark (what goes into `attendance.<studentId>`).
export function markValue(mark, status, lateMinutes) {
  const next = ATTENDANCE_STATUS.includes(status) ? status : 'present';
  return {
    name: String(mark?.name || 'Õpilane').slice(0, 160),
    status: next,
    lateMinutes: next === 'late' ? Math.min(240, Math.max(1, Math.round(Number(lateMinutes ?? mark?.lateMinutes) || LATE_AFTER_MINUTES + 1))) : 0,
    joinedAt: String(mark?.joinedAt || '').slice(0, 40),
  };
}

// The calendar status of a mark (the statuses the calendar's own buttons write); null → the calendar's default.
export function calendarStatusOf(mark) {
  if (!mark) return null;
  return mark.status === 'absent' ? 'Puudus_eta' : 'Toimunud';
}

export const markLabel = (mark) => (mark?.status === 'late' ? `Hilines ${mark.lateMinutes} min` : ATTENDANCE_LABEL[mark?.status] || '');
