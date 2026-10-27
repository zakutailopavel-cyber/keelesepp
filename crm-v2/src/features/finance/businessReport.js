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
      const base = { occurrence: `${item.id}:${item.occurrenceDate}`, minutes: Number(item.duration) || 60, date: item.occurrenceDate, studentId, studentName: student.name || item.studentName || '', teacher: item.teacher || student.teacher || '', subject: itemSubject(item, student) || 'Eesti keel', group: Boolean(item.isGroup), cents, priced: cents > 0 };
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
    .forEach((event) => out.push({ occurrence: event.id, minutes: Number(event.duration) || 60, date: event.date, studentId: event.studentId, studentName: studentById.get(event.studentId).name || '', teacher: event.teacher || '', subject: itemSubject(event, studentById.get(event.studentId)) || 'Eesti keel', group: false, cents: 0, priced: true, state: 'cancelled' }));
  // journal lessons not in the calendar
  lessons.filter((lesson) => lesson.date >= from && lesson.date <= to && lesson.date < today && !seen.has(lesson.id || `${lesson.studentId}@${lesson.date}`) && studentById.has(lesson.studentId)).forEach((lesson) => {
    const student = studentById.get(lesson.studentId);
    const cents = lessonPriceCents(lesson, student, planById.get(lesson.studentId));
    const state = lesson.status === 'Puudus_p' ? 'absentNotified' : lesson.status === 'Puudus_eta' ? 'absentCharged' : lesson.billingStatus === 'school_covered' ? 'covered' : 'held';
    out.push({ occurrence: lesson.id || `${lesson.studentId}@${lesson.date}`, minutes: Number(lesson.duration) || 60, date: lesson.date, studentId: lesson.studentId, studentName: student.name || '', teacher: lesson.teacher || student.teacher || '', subject: itemSubject(lesson, student) || 'Eesti keel', group: false, cents, priced: cents > 0, state });
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

// the teacher is paid for every lesson given (also a charged no-show: the hour was kept), a group lesson once
const TEACHER_PAID = new Set(['held', 'unmarked', 'covered', 'absentCharged']);

/**
 * Teacher pay and what stays with the school, per teacher (owner 2026-10-27: „доход с каждого учителя, у Ангелины час
 * стоит 10 евро, у Егора 10, у Лизы 12”). The rate is the staff account's `workHourlyRateCents` (Palk ja kulud);
 * a teacher without a rate has `payCents: null`.
 */
export function withTeacherPay(rows, facts, rateOf) {
  return rows.map((row) => {
    const given = new Map();
    facts.filter((fact) => fact.teacher === row.name && TEACHER_PAID.has(fact.state)).forEach((fact) => given.set(fact.occurrence, fact.minutes));
    const minutes = [...given.values()].reduce((sum, value) => sum + value, 0);
    const rate = rateOf(row.name);
    const payCents = rate ? Math.round((minutes / 60) * rate) : null;
    return { ...row, hours: Math.round((minutes / 60) * 10) / 10, rateCents: rate || null, payCents, schoolCents: row.earnedCents - (payCents || 0) };
  });
}

const change = (now, before) => (before ? Math.round(((now - before) / before) * 100) : null);

/**
 * The business report of a period of `months` months ending with the current month, compared with the months before.
 * → { from, to, now: sums, before: sums, change: { tookPlace, earned, students }, newStudents, lostStudents,
 *     unpriced, byTeacher (+ hours, rateCents, payCents, schoolCents), pay: { payCents, schoolCents, unrated }, bySubject }
 */
export function businessReport({ current, months = 1, today, students = [], plans = [], schedule = [], groups = [], lessons = [], teachers = [], settings = {} } = {}) {
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
  const teacherOf = teacherNames([...facts.map((fact) => fact.teacher), ...teachers.map((teacher) => teacher.name)]);
  const rates = new Map(teachers.filter((teacher) => Number(teacher.workHourlyRateCents) > 0).map((teacher) => [teacherOf(teacher.name), Number(teacher.workHourlyRateCents)]));
  const byTeacherFacts = facts.map((fact) => ({ ...fact, teacher: teacherOf(fact.teacher) }));
  const byTeacher = withTeacherPay(groupBy(byTeacherFacts, 'teacher'), byTeacherFacts, (name) => rates.get(name));
  const payCents = byTeacher.reduce((sum, row) => sum + (row.payCents || 0), 0);
  const unpriced = [...new Set(facts.filter((fact) => !fact.priced && fact.state !== 'cancelled').map((fact) => fact.studentId))];
  return {
    from, to, now, before,
    change: { tookPlace: change(now.tookPlace, before.tookPlace), earned: change(now.earnedCents, before.earnedCents), students: change(now.students, before.students) },
    newStudents: [...nowStudents].filter((id) => !everBefore.has(id)).map(nameOf).sort((a, b) => a.localeCompare(b, 'et')),
    lostStudents: [...beforeStudents].filter((id) => !nowStudents.has(id) && !ahead.has(id)).map(nameOf).sort((a, b) => a.localeCompare(b, 'et')),
    unpriced: unpriced.map(nameOf).sort((a, b) => a.localeCompare(b, 'et')),
    byTeacher,
    pay: { payCents, schoolCents: now.earnedCents - payCents, unrated: byTeacher.filter((row) => !row.rateCents && row.tookPlace).map((row) => row.name) },
    bySubject: groupBy(facts, 'subject'),
    ...economics({ current, fromMonth, facts, args, teacherOf, rates, settings, students }),
  };
}

// ---------- the school's economy (owner 2026-10-27: „содержание школы около 400 € в месяц и зп админу 750 € …
// максимально подробная информация о доходах и всему прочему, чтобы я понимал состояние дел школы”) ----------

// businessSettings/current: the school's monthly fixed costs and whose lessons are the owner's own
export function normalizeBusinessSettings(data = {}) {
  const fixedCosts = (Array.isArray(data?.fixedCosts) ? data.fixedCosts : [])
    .map((item) => ({ label: String(item?.label || '').trim().slice(0, 60), cents: Math.max(0, Math.round(Number(item?.cents) || 0)) }))
    .filter((item) => item.label && item.cents > 0).slice(0, 20);
  return {
    fixedCosts,
    ownerTeacher: String(data?.ownerTeacher || '').trim().slice(0, 80),
    ownerRateCents: Math.max(0, Math.round(Number(data?.ownerRateCents) || 0)),
  };
}

const monthOf = (date) => date.slice(0, 7);
const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : null);

function economics({ current, fromMonth, facts, args, teacherOf, rates, settings, students }) {
  const config = normalizeBusinessSettings(settings);
  const fixedMonthCents = config.fixedCosts.reduce((sum, item) => sum + item.cents, 0);
  const owner = config.ownerTeacher ? teacherOf(config.ownerTeacher) : '';
  const named = (list) => list.map((fact) => ({ ...fact, teacher: teacherOf(fact.teacher) }));
  // teacher pay of a set of lessons (planned ones too when asked: the forecast)
  const payOf = (list, { planned = false } = {}) => {
    const given = new Map();
    list.filter((fact) => TEACHER_PAID.has(fact.state) || (planned && fact.state === 'planned')).forEach((fact) => given.set(`${fact.teacher}|${fact.occurrence}`, fact));
    let payCents = 0; let minutes = 0; let ownerMinutes = 0;
    given.forEach((fact) => {
      minutes += fact.minutes;
      if (fact.teacher === owner) ownerMinutes += fact.minutes;
      const rate = rates.get(fact.teacher);
      if (rate) payCents += (fact.minutes / 60) * rate;
    });
    return { payCents: Math.round(payCents), hours: minutes / 60, ownerHours: ownerMinutes / 60 };
  };
  const all = named(facts);
  const monthsList = [];
  for (let month = fromMonth; month <= current; month = shiftMonth(month, 1)) monthsList.push(month);

  const monthly = monthsList.map((month) => {
    const list = all.filter((fact) => monthOf(fact.date) === month);
    const total = sums(list);
    const pay = payOf(list);
    const row = { month, ...total, payCents: pay.payCents, hours: Math.round(pay.hours * 10) / 10, fixedCents: fixedMonthCents, profitCents: total.earnedCents - pay.payCents - fixedMonthCents };
    if (month === current && total.planned) {
      const expected = payOf(list, { planned: true });
      row.expectedCents = total.earnedCents + total.plannedCents;
      row.expectedProfitCents = row.expectedCents - expected.payCents - fixedMonthCents;
    }
    return row;
  });

  // the period's profit and loss
  const total = sums(all);
  const pay = payOf(all);
  const fixedCents = fixedMonthCents * monthsList.length;
  const profitCents = total.earnedCents - pay.payCents - fixedCents;
  const ownerFacts = owner ? all.filter((fact) => fact.teacher === owner) : [];
  const ownerEarned = sums(ownerFacts).earnedCents;
  const ownerPayCents = Math.round(pay.ownerHours * config.ownerRateCents);
  const hiredFacts = all.filter((fact) => fact.teacher !== owner && rates.get(fact.teacher));
  const hired = payOf(hiredFacts);
  const hiredEarned = sums(hiredFacts).earnedCents;
  const marginPerHiredHour = hired.hours ? (hiredEarned - hired.payCents) / hired.hours : 0;
  const pnl = {
    revenueCents: total.earnedCents,
    teacherPayCents: pay.payCents,
    fixedCents,
    fixedMonthCents,
    fixedCosts: config.fixedCosts,
    profitCents,
    marginPercent: percent(profitCents, total.earnedCents),
    hours: Math.round(pay.hours * 10) / 10,
    revenuePerHourCents: pay.hours ? Math.round(total.earnedCents / pay.hours) : 0,
    owner: owner ? {
      name: owner,
      earnedCents: ownerEarned,
      hours: Math.round(pay.ownerHours * 10) / 10,
      share: percent(ownerEarned, total.earnedCents),
      rateCents: config.ownerRateCents,
      payAtRateCents: ownerPayCents,
      profitAfterOwnerPayCents: config.ownerRateCents ? profitCents - ownerPayCents : null,
      // what the school earns without the owner's own lessons
      withoutOwnerCents: total.earnedCents - ownerEarned - pay.payCents - fixedCents,
    } : null,
    breakEven: marginPerHiredHour > 0 && fixedMonthCents ? {
      marginPerHourCents: Math.round(marginPerHiredHour),
      hoursNeededPerMonth: Math.ceil(fixedMonthCents / marginPerHiredHour),
      hoursPerMonthNow: Math.round((hired.hours / monthsList.length) * 10) / 10,
    } : null,
  };

  // next month from the calendar
  const nextMonth = shiftMonth(current, 1);
  const nextFacts = named(lessonFacts({ ...args, from: `${nextMonth}-01`, to: monthDates(nextMonth).pop() }));
  const nextTotal = sums(nextFacts);
  const nextPay = payOf(nextFacts, { planned: true });
  const forecast = { month: nextMonth, lessons: nextTotal.planned, revenueCents: nextTotal.plannedCents, teacherPayCents: nextPay.payCents, fixedCents: fixedMonthCents, profitCents: nextTotal.plannedCents - nextPay.payCents - fixedMonthCents };

  // individual and group lessons (a group lesson once)
  const kinds = { individual: { lessons: 0, earnedCents: 0 }, group: { lessons: 0, earnedCents: 0 } };
  const seenLesson = new Set();
  all.filter((fact) => PAID.has(fact.state) || fact.state === 'covered').forEach((fact) => {
    const kind = fact.group ? kinds.group : kinds.individual;
    if (PAID.has(fact.state)) kind.earnedCents += fact.cents;
    if (!seenLesson.has(fact.occurrence)) { seenLesson.add(fact.occurrence); kind.lessons += 1; }
  });

  // every student of the period
  const byStudent = new Map();
  all.forEach((fact) => { if (!byStudent.has(fact.studentId)) byStudent.set(fact.studentId, []); byStudent.get(fact.studentId).push(fact); });
  const futureIds = new Set([...all, ...nextFacts].filter((fact) => fact.state === 'planned').map((fact) => fact.studentId));
  const studentRows = [...byStudent].map(([id, list]) => {
    const row = sums(list);
    const took = list.filter((fact) => TOOK_PLACE.has(fact.state)).map((fact) => fact.date).sort();
    return { id, name: list[0].studentName || 'Õpilane', teachers: [...new Set(list.map((fact) => fact.teacher))].join(', '), subjects: [...new Set(list.map((fact) => fact.subject))].join(', '), tookPlace: row.tookPlace, missed: row.missed, attendance: row.attendance, earnedCents: row.earnedCents, perLessonCents: row.perLessonCents, lastLesson: took[took.length - 1] || '', planned: futureIds.has(id) };
  }).filter((row) => row.tookPlace || row.missed || row.planned).sort((a, b) => b.earnedCents - a.earnedCents || a.name.localeCompare(b.name, 'et'));
  const top = studentRows.slice(0, 10).reduce((sum, row) => sum + row.earnedCents, 0);
  const active = new Set(students.filter((student) => student.active !== false).map((student) => student.id));
  return {
    monthly, pnl, forecast, kinds,
    studentRows,
    topTenShare: percent(top, total.earnedCents),
    nothingAhead: studentRows.filter((row) => !row.planned && row.tookPlace && active.has(row.id)).map((row) => row.name),
  };
}
