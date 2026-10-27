// „Ärinäitajad” (owner 2026-10-27: „больше информации по кол-ву проведённых уроков и отчётности, которая может следить
// за состоянием бизнеса в целом”). Pure: every lesson of the calendar in a period with what happened to it (the same
// rules as financeDashboard.lessonRevenue), then the lessons, students, money, teachers and subjects of the period
// compared with the period before. Calendar lessons at the students' prices — not the bookkeeping.
import { monthDates, shiftMonth } from './monthlyBilling.js';
import { groupCalendarEvents, occurrencesForDates } from '../calendar/calendarView.js';
import { itemSubject } from '../students/subjects.js';
import { lessonPriceCents } from './financeDashboard.js';
import { canonicalTeacherName } from '../../utils/teachers.js';

// one row per student and lesson: { date, studentId, teacher, subject, state, cents }
// state: held | unmarked | covered | absentNotified | absentCharged | absentFree | cancelled | planned
export function lessonFacts({ from, to, today, students = [], plans = [], schedule = [], groups = [], lessons = [] } = {}) {
  const studentById = new Map(students.map((student) => [student.id, student]));
  const planById = new Map(plans.map((plan) => [plan.studentId || plan.id, plan]));
  const events = [...schedule, ...groupCalendarEvents(groups)];
  const journal = new Map();
  lessons.forEach((lesson) => {
    const date = lesson.occurrenceDate || lesson.date;
    if (lesson.scheduleId && date) journal.set(`${lesson.scheduleId}:${date}`, lesson);
    if (lesson.studentId && lesson.date) journal.set(`${lesson.studentId}@${lesson.date}`, lesson);
  });
  const dates = [];
  for (let month = from.slice(0, 7); month <= to.slice(0, 7); month = shiftMonth(month, 1)) dates.push(...monthDates(month).filter((date) => date >= from && date <= to));
  const out = [];
  const seen = new Set();
  occurrencesForDates(events, dates).forEach((item) => {
    (item.isGroup ? item.studentIds || [] : [item.studentId]).forEach((studentId) => {
      const student = studentById.get(studentId);
      if (!student) return;
      const plan = planById.get(studentId);
      const record = journal.get(`${item.id}:${item.occurrenceDate}`) || journal.get(`${studentId}@${item.occurrenceDate}`);
      if (record) seen.add(record.id || `${studentId}@${item.occurrenceDate}`);
      const status = record?.status || item.status || 'Planeeritud';
      const cents = lessonPriceCents(item, student, plan);
      const base = { date: item.occurrenceDate, studentId, studentName: student.name || item.studentName || '', teacher: item.teacher || student.teacher || '', subject: itemSubject(item, student) || 'Eesti keel', group: Boolean(item.isGroup), cents, priced: cents > 0 };
      let state;
      if (status === 'Tühistatud') state = 'cancelled';
      else if (item.occurrenceDate >= today) state = status === 'Puudus_p' ? 'absentNotified' : 'planned';
      else if (status === 'Puudus_p') state = 'absentNotified';
      else if (status === 'Puudus_eta') state = plan?.chargeNoShow !== false && !record?.billingWaived ? 'absentCharged' : 'absentFree';
      else if (status === 'Toimunud') state = record?.billingStatus === 'school_covered' ? 'covered' : 'held';
      else state = 'unmarked';
      out.push({ ...base, state });
    });
  });
  // a one-off lesson cancelled as a whole is not an occurrence any more
  schedule.filter((event) => !event.recurring && event.status === 'Tühistatud' && event.date >= from && event.date <= to && studentById.has(event.studentId))
    .forEach((event) => out.push({ date: event.date, studentId: event.studentId, studentName: studentById.get(event.studentId).name || '', teacher: event.teacher || '', subject: itemSubject(event, studentById.get(event.studentId)) || 'Eesti keel', group: false, cents: 0, priced: true, state: 'cancelled' }));
  // journal lessons not in the calendar
  lessons.filter((lesson) => lesson.date >= from && lesson.date <= to && lesson.date < today && !seen.has(lesson.id || `${lesson.studentId}@${lesson.date}`) && studentById.has(lesson.studentId)).forEach((lesson) => {
    const student = studentById.get(lesson.studentId);
    const cents = lessonPriceCents(lesson, student, planById.get(lesson.studentId));
    const state = lesson.status === 'Puudus_p' ? 'absentNotified' : lesson.status === 'Puudus_eta' ? 'absentCharged' : lesson.billingStatus === 'school_covered' ? 'covered' : 'held';
    out.push({ date: lesson.date, studentId: lesson.studentId, studentName: student.name || '', teacher: lesson.teacher || student.teacher || '', subject: itemSubject(lesson, student) || 'Eesti keel', group: false, cents, priced: cents > 0, state });
  });
  return out;
}

const PAID = new Set(['held', 'unmarked', 'absentCharged']); // what the period earns
const TOOK_PLACE = new Set(['held', 'unmarked', 'covered']);
const MISSED = new Set(['absentNotified', 'absentCharged', 'absentFree', 'cancelled']);

function sums(facts) {
  const count = (state) => facts.filter((fact) => fact.state === state).length;
  const paid = facts.filter((fact) => PAID.has(fact.state));
  const took = facts.filter((fact) => TOOK_PLACE.has(fact.state)).length;
  const missed = facts.filter((fact) => MISSED.has(fact.state)).length;
  const earned = paid.reduce((sum, fact) => sum + fact.cents, 0);
  const planned = facts.filter((fact) => fact.state === 'planned');
  const students = new Set(facts.filter((fact) => TOOK_PLACE.has(fact.state) || fact.state === 'absentCharged').map((fact) => fact.studentId));
  return {
    held: count('held'), unmarked: count('unmarked'), covered: count('covered'), absentNotified: count('absentNotified'),
    absentCharged: count('absentCharged'), absentFree: count('absentFree'), cancelled: count('cancelled'), planned: planned.length,
    tookPlace: took, missed, attendance: took + missed ? Math.round((took / (took + missed)) * 100) : null,
    earnedCents: earned, plannedCents: planned.reduce((sum, fact) => sum + fact.cents, 0),
    perLessonCents: paid.length ? Math.round(earned / paid.length) : 0,
    students: students.size, perStudentCents: students.size ? Math.round(earned / students.size) : 0,
  };
}

function groupBy(facts, key) {
  const map = new Map();
  facts.forEach((fact) => { const name = fact[key] || '—'; if (!map.has(name)) map.set(name, []); map.get(name).push(fact); });
  return [...map].map(([name, list]) => ({ name, ...sums(list) })).sort((a, b) => b.earnedCents - a.earnedCents || b.tookPlace - a.tookPlace);
}

// one name per teacher: the calendar writes „Pavel” and „Pavel Zakutailo” — a first name alone goes to the one full name
// that starts with it
export function teacherNames(names) {
  const full = [...new Set(names.map((name) => canonicalTeacherName(name || '').trim()).filter(Boolean))];
  const key = (name) => name.toLocaleLowerCase('et');
  return (name) => {
    const own = canonicalTeacherName(name || '').trim();
    if (!own) return '—';
    if (own.includes(' ')) return own;
    const longer = full.filter((other) => other.includes(' ') && key(other).startsWith(`${key(own)} `));
    return longer.length === 1 ? longer[0] : own;
  };
}

const change = (now, before) => (before ? Math.round(((now - before) / before) * 100) : null);

/**
 * The business report of a period of `months` months ending with the current month, compared with the months before.
 * → { from, to, now: sums, before: sums, change: { tookPlace, earned, students }, newStudents, lostStudents,
 *     unpriced, byTeacher, bySubject }
 */
export function businessReport({ current, months = 1, today, students = [], plans = [], schedule = [], groups = [], lessons = [] } = {}) {
  const fromMonth = shiftMonth(current, -(months - 1));
  const from = `${fromMonth}-01`;
  const to = monthDates(current).pop();
  const beforeFrom = `${shiftMonth(fromMonth, -months)}-01`;
  const beforeTo = monthDates(shiftMonth(fromMonth, -1)).pop();
  const args = { today, students, plans, schedule, groups, lessons };
  const facts = lessonFacts({ ...args, from, to });
  const earlier = lessonFacts({ ...args, from: '2000-01-01', to: beforeTo });
  const previous = earlier.filter((fact) => fact.date >= beforeFrom);
  const now = sums(facts);
  const before = sums(previous);
  const came = (list) => new Set(list.filter((fact) => TOOK_PLACE.has(fact.state)).map((fact) => fact.studentId));
  const nowStudents = came(facts);
  const everBefore = came(earlier);
  const beforeStudents = came(previous);
  const ahead = new Set(facts.filter((fact) => fact.state === 'planned').map((fact) => fact.studentId));
  const nameOf = (id) => students.find((student) => student.id === id)?.name || 'Õpilane';
  const teacherOf = teacherNames(facts.map((fact) => fact.teacher));
  const unpriced = [...new Set(facts.filter((fact) => !fact.priced && fact.state !== 'cancelled').map((fact) => fact.studentId))];
  return {
    from, to, now, before,
    change: { tookPlace: change(now.tookPlace, before.tookPlace), earned: change(now.earnedCents, before.earnedCents), students: change(now.students, before.students) },
    newStudents: [...nowStudents].filter((id) => !everBefore.has(id)).map(nameOf).sort((a, b) => a.localeCompare(b, 'et')),
    lostStudents: [...beforeStudents].filter((id) => !nowStudents.has(id) && !ahead.has(id)).map(nameOf).sort((a, b) => a.localeCompare(b, 'et')),
    unpriced: unpriced.map(nameOf).sort((a, b) => a.localeCompare(b, 'et')),
    byTeacher: groupBy(facts.map((fact) => ({ ...fact, teacher: teacherOf(fact.teacher) })), 'teacher'),
    bySubject: groupBy(facts, 'subject'),
  };
}
