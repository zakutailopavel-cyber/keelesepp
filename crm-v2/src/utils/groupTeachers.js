// Who teaches a group on a date (admin bug 2026-11-03: „после создания группы невозможно изменить … учителя”).
// A group keeps its current teacher in `teacher` / `teacherUid`; every earlier teacher is one entry of
// `teacherHistory: [{ teacher, teacherUid, until: 'YYYY-MM-DD' }]` (until = the last day that teacher taught, inclusive).
// Lessons from the change day on follow the new teacher; earlier ones keep the teacher they had. Pure.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (value) => String(value ?? '').trim();

export function shiftIsoDate(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function cleanTeacherHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter((entry) => entry && DATE.test(clean(entry.until)) && (clean(entry.teacher) || clean(entry.teacherUid)))
    .map((entry) => ({ teacher: clean(entry.teacher), teacherUid: clean(entry.teacherUid), until: clean(entry.until) }))
    .sort((left, right) => left.until.localeCompare(right.until));
}

/**
 * The teacher periods of a group, oldest first: [{ teacher, teacherUid, from, until }] — `from` / `until` are '' when
 * open. The last period is the current teacher.
 */
export function teacherPeriods(group = {}) {
  const history = cleanTeacherHistory(group.teacherHistory);
  let from = '';
  const periods = history.map((entry) => {
    const period = { teacher: entry.teacher, teacherUid: entry.teacherUid, from, until: entry.until };
    from = shiftIsoDate(entry.until, 1);
    return period;
  });
  periods.push({ teacher: clean(group.teacher), teacherUid: clean(group.teacherUid), from, until: '' });
  return periods;
}

export function groupTeacherOn(group = {}, date = '') {
  const periods = teacherPeriods(group);
  if (!DATE.test(clean(date))) return periods[periods.length - 1];
  return periods.find((period) => (!period.from || date >= period.from) && (!period.until || date <= period.until)) || periods[periods.length - 1];
}

/**
 * The group after its teacher changes from `from` on: the old teacher gets a history entry up to the day before, but
 * only when the group had a lesson date before `from` (a group without past lessons just gets the new teacher).
 * Throws when `from` is not after the previous change.
 */
export function withTeacherChange(group = {}, { teacher, teacherUid, from }) {
  const history = cleanTeacherHistory(group.teacherHistory);
  const nextUid = clean(teacherUid);
  const nextName = clean(teacher);
  const same = nextUid ? nextUid === clean(group.teacherUid) : nextName === clean(group.teacher);
  if (same) return { teacher: clean(group.teacher), teacherUid: clean(group.teacherUid), teacherHistory: history, changed: false };
  if (!DATE.test(clean(from))) throw new Error('Vali kuupäev, millest uus õpetaja alustab.');
  const last = history[history.length - 1];
  if (last && from <= last.until) throw new Error(`Õpetaja vahetus peab olema hiljem kui eelmine vahetus (${last.until}).`);
  const lessons = Array.isArray(group.lessons) ? group.lessons : [];
  const taughtBefore = lessons.some((lesson) => {
    const start = clean(lesson.recurring === false ? lesson.date || lesson.startDate : lesson.startDate || lesson.date);
    return start && start < from;
  });
  const hadTeacher = clean(group.teacher) || clean(group.teacherUid);
  const entry = taughtBefore && hadTeacher ? [{ teacher: clean(group.teacher), teacherUid: clean(group.teacherUid), until: shiftIsoDate(from, -1) }] : [];
  return { teacher: nextName, teacherUid: nextUid, teacherHistory: [...history, ...entry], changed: true };
}

// a teacher's own groups: the current teacher, and (calendar) a former teacher for the lessons he gave
export function taughtBy(group = {}, uid = '') {
  return Boolean(uid) && teacherPeriods(group).some((period) => period.teacherUid === uid);
}
