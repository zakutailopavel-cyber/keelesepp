// „Täna” (admin start page, 2026-11-04): one screen for the school's day. Pure helpers, one per section; the panel
// passes what the dashboard and its own few reads loaded. Days are Tallinn days (the school's), whatever the browser's
// time zone.
import { occurrencesForDates } from '../../calendar/calendarView.js';
import { monthDates, studentLessonBalances } from '../../finance/monthlyBilling.js';
import { isHomeworkOpen } from '../../homework/homeworkStatus.js';
import { itemSubject, mainSubject } from '../../students/subjects.js';
import { lastSeenOf } from '../../../services/firebase/presence.js';
import { tokenAccount } from '../../../services/firebase/lessonTokens.js';

export const TIME_ZONE = 'Europe/Tallinn';
const DAY = 86400000;

export const tallinnDay = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE }).format(date);
export const tallinnClock = (date = new Date()) => new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);

export function addDays(iso, days) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export const daysFrom = (iso, count) => Array.from({ length: count }, (_, index) => addDays(iso, index));

function endClock(time, duration) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return '';
  const total = Math.min(24 * 60 - 1, hours * 60 + minutes + (Number(duration) || 60));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
const dayOf = (value) => String(value || '').slice(0, 10);
// the calendar opens this lesson's panel (CalendarPage `?lesson=<occurrenceId>|<date>`, as UnmarkedLessonsCard links)
export const lessonPath = (item) => `/calendar?lesson=${encodeURIComponent(`${item.occurrenceId}|${item.occurrenceDate}`)}`;
const activeCard = (student) => student && student.active !== false && !student.convertedToParent && !student.deletedAt;

// 1. Today's lessons: weekly series and group lessons expanded like the calendar; where (online / room) and whether it
// is over, running or ahead (`now` = Tallinn HH:MM). `path` opens the lesson's calendar panel, where „Alusta tundi”
// invites the student into the Live Classroom (the invitation is made there, never from here).
export function todayLessons({ events = [], today, now = '00:00' }) {
  return occurrencesForDates(events, [today]).map((item) => {
    const end = endClock(item.time, item.duration);
    const cancelled = item.status === 'Tühistatud';
    const marked = Boolean(item.status) && item.status !== 'Planeeritud' && !cancelled;
    const phase = cancelled ? 'cancelled' : !item.time ? 'later' : end && end <= now ? 'past' : item.time <= now ? 'now' : 'later';
    return {
      key: item.occurrenceId,
      // the schedule entry and its day: the right-click „Ava tund (siinsamas)” opens it in the side drawer
      scheduleId: item.isGroup ? '' : item.id || '',
      date: item.occurrenceDate,
      time: item.time || '',
      end,
      duration: Number(item.duration) || 60,
      studentId: item.studentId || '',
      studentName: item.studentName || (item.isGroup ? 'Grupp' : 'Õpilane'),
      teacher: item.teacher || 'Õpetaja määramata',
      isGroup: Boolean(item.isGroup),
      online: item.online === true,
      place: item.online === true ? 'Veebitund' : item.roomName || '',
      status: item.status || 'Planeeritud',
      marked,
      phase,
      path: lessonPath(item),
    };
  });
}

// 2. Homework: works handed in and not reviewed yet (the Kodutööd page's count) and tasks past their deadline in the
// last `windowDays` days, per teacher (the card's teacher, else the one who gave it). A homework that only gives a
// worksheet its deadline counts once, as the worksheet.
export function homeworkQueue({ submissions = [], homework = [], worksheets = [], students = [], today, windowDays = 30 }) {
  const cards = new Map(students.filter(activeCard).map((student) => [student.id, student]));
  const from = addDays(today, -windowDays);
  const rows = new Map();
  const row = (teacher) => {
    const name = teacher || 'Õpetaja määramata';
    if (!rows.has(name)) rows.set(name, { teacher: name, waiting: 0, overdue: 0 });
    return rows.get(name);
  };
  const teacherOf = (item) => cards.get(item.studentId)?.teacher || item.teacherName || item.teacher || '';
  submissions.forEach((item) => {
    if (!cards.has(item.studentId) || item.reviewStatus === 'reviewed') return;
    row(teacherOf(item.source || item)).waiting += 1;
  });
  const sheetIds = new Set();
  worksheets.forEach((sheet) => {
    if (!cards.has(sheet.studentId)) return;
    sheetIds.add(sheet.id);
    const due = dayOf(sheet.dueDate);
    if (!due || due >= today || due < from || sheet.status === 'done' || sheet.completedAt) return;
    row(teacherOf(sheet)).overdue += 1;
  });
  homework.forEach((item) => {
    if (!cards.has(item.studentId) || !isHomeworkOpen(item) || sheetIds.has(item.worksheetAssignmentId)) return;
    const due = dayOf(item.due);
    if (!due || due >= today || due < from) return;
    row(teacherOf(item)).overdue += 1;
  });
  const byTeacher = [...rows.values()].filter((item) => item.waiting || item.overdue)
    .sort((a, b) => (b.waiting + b.overdue) - (a.waiting + a.overdue) || a.teacher.localeCompare(b.teacher, 'et'));
  return {
    waiting: byTeacher.reduce((sum, item) => sum + item.waiting, 0),
    overdue: byTeacher.reduce((sum, item) => sum + item.overdue, 0),
    byTeacher,
  };
}

// 3. Paid lessons running out (admin and accountant only, owner 2026-11-02). Two existing balances, nothing new:
// - monthly invoices (finance/monthlyBilling.js studentLessonBalances): paid by the invoices minus held; it runs out when
//   nothing is left or fewer are left than the calendar still has this month (today on, not marked yet);
// - lesson packages (services/firebase/lessonTokens.js tokenAccount): „low” (≤ 2 left), „empty” or lessons owed.
// `students` may be empty (an accountant cannot read the cards): then packages count by their own studentName.
export function lessonsRunningOut({ students = [], plans = [], invoices = [], lessons = [], events = [], packages = [], owed = [], today }) {
  const result = [];
  const month = today.slice(0, 7);
  const rest = monthDates(month).filter((date) => date >= today);
  const planOf = new Map(plans.filter((plan) => plan.active !== false).map((plan) => [plan.studentId || plan.id, plan]));
  const known = new Map(students.filter(activeCard).map((student) => [student.id, student]));
  known.forEach((student) => {
    const plan = planOf.get(student.id);
    if (!plan) return;
    const balances = studentLessonBalances({ student, plan, invoices, lessons, month });
    if (!balances.length) return;
    const markedDays = new Set(lessons.filter((lesson) => lesson.studentId === student.id).map((lesson) => dayOf(lesson.occurrenceDate || lesson.date)));
    const main = mainSubject(student);
    const ahead = occurrencesForDates(events.filter((event) => event.studentId === student.id || (event.studentIds || []).includes(student.id)), rest)
      .filter((item) => (item.status || 'Planeeritud') === 'Planeeritud' && !markedDays.has(item.occurrenceDate));
    balances.forEach((balance) => {
      const planned = ahead.filter((item) => !balance.subject || (itemSubject(item, student) || main) === balance.subject).length;
      if (balance.left > 0 && balance.left >= planned) return;
      result.push({ key: `month:${student.id}:${balance.subject}`, studentId: student.id, studentName: student.name || 'Õpilane', subject: balance.subject, kind: 'month', left: balance.left, planned, owed: 0 });
    });
  });
  const byStudent = new Map();
  packages.forEach((item) => { if (item?.studentId) byStudent.set(item.studentId, [...(byStudent.get(item.studentId) || []), item]); });
  const owedBy = new Map();
  owed.forEach((item) => { if (item?.studentId) owedBy.set(item.studentId, [...(owedBy.get(item.studentId) || []), item]); });
  new Set([...byStudent.keys(), ...owedBy.keys()]).forEach((studentId) => {
    if (known.size && !known.has(studentId)) return; // an archived card's old package is not work for today
    const account = tokenAccount({ packages: byStudent.get(studentId) || [], owed: owedBy.get(studentId) || [] });
    if (!['low', 'empty', 'owed'].includes(account.state)) return;
    const name = known.get(studentId)?.name || (byStudent.get(studentId) || [])[0]?.studentName || (owedBy.get(studentId) || [])[0]?.studentName || 'Õpilane';
    result.push({ key: `package:${studentId}`, studentId, studentName: name, subject: '', kind: 'package', left: account.left, planned: 0, owed: account.owed });
  });
  const urgency = (item) => (item.owed ? 0 : item.left <= 0 ? 1 : 2);
  return result.sort((a, b) => urgency(a) - urgency(b) || a.left - b.left || a.studentName.localeCompare(b.studentName, 'et'));
}

// 4. Website enquiries nobody has taken yet (status „new”), newest first; `days` = how long it has waited.
export function newLeads(leads = [], today) {
  return leads.filter((lead) => (lead.status || 'new') === 'new')
    .map((lead) => {
      const day = lead.createdAt ? tallinnDay(new Date(lead.createdAt)) : '';
      const days = day && today ? Math.max(0, Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${day}T12:00:00Z`)) / DAY)) : null;
      return { ...lead, day, days };
    })
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

// 5. „Vajab kõnet”: active students showing signals of dropping out in the last `windowDays` days — not seen in the
// CRM (users.lastSeenAt / „Minu vead”, only once a visit was ever recorded), 2+ homework past due and not done, 2+
// absences (Puudus_eta / Puudus_p) in the journal, or no lesson in the calendar in the next `aheadDays` days (not for a
// card paused in planning or a self-study card). A student the admin called („Helistasin”) in the last `calledDays`
// days moves to `called` with the note; a later call log does not hide new reasons, it only shows them there.
export const CALL_WINDOW_DAYS = 21;
export const CALL_AHEAD_DAYS = 14;
export const CALLED_DAYS = 14;

export function needsCall({ students = [], lessons = [], homework = [], worksheets = [], events = [], seen = new Map(), followups = [], today, now = Date.now(), windowDays = CALL_WINDOW_DAYS, aheadDays = CALL_AHEAD_DAYS, calledDays = CALLED_DAYS }) {
  const from = addDays(today, -windowDays);
  const count = (map, id) => map.set(id, (map.get(id) || 0) + 1);
  const absences = new Map();
  lessons.forEach((lesson) => {
    const day = dayOf(lesson.date);
    if (lesson.studentId && day >= from && day <= today && String(lesson.status || '').startsWith('Puudus')) count(absences, lesson.studentId);
  });
  const missed = new Map();
  const sheetIds = new Set(worksheets.map((sheet) => sheet.id));
  worksheets.forEach((sheet) => {
    const due = dayOf(sheet.dueDate);
    if (sheet.studentId && due && due >= from && due < today && sheet.status !== 'done' && !sheet.completedAt) count(missed, sheet.studentId);
  });
  homework.forEach((item) => {
    const due = dayOf(item.due);
    if (item.studentId && due && due >= from && due < today && isHomeworkOpen(item) && !sheetIds.has(item.worksheetAssignmentId)) count(missed, item.studentId);
  });
  const booked = new Set();
  occurrencesForDates(events, daysFrom(today, aheadDays)).forEach((item) => {
    if (item.status === 'Tühistatud') return;
    if (item.isGroup) (item.studentIds || []).forEach((id) => booked.add(id));
    else if (item.studentId) booked.add(item.studentId);
  });
  const lastCall = new Map();
  followups.forEach((item) => {
    const at = Date.parse(item.at || '') || 0;
    if (item.studentId && at > (lastCall.get(item.studentId)?.time || 0)) lastCall.set(item.studentId, { ...item, time: at });
  });

  const list = [];
  const called = [];
  students.filter(activeCard).forEach((student) => {
    const reasons = [];
    const away = lastSeenOf(seen.get(student.id));
    if (away > 0 && now - away > windowDays * DAY) reasons.push({ code: 'notSeen', text: `pole ${Math.floor((now - away) / DAY)} päeva sisse loginud` });
    const notDone = missed.get(student.id) || 0;
    if (notDone >= 2) reasons.push({ code: 'homework', text: `${notDone} kodutööd tegemata` });
    const absent = absences.get(student.id) || 0;
    if (absent >= 2) reasons.push({ code: 'absences', text: `${absent} puudumist ${Math.round(windowDays / 7)} nädalaga` });
    const paused = student.planningPausedUntil && student.planningPausedUntil >= today;
    if (!booked.has(student.id) && !paused && !student.isSelfStudent) reasons.push({ code: 'noLesson', text: `järgmise ${aheadDays} päeva jooksul tundi pole` });
    if (!reasons.length) return;
    const entry = { student, reasons, call: null };
    const call = lastCall.get(student.id);
    if (call && now - call.time <= calledDays * DAY) called.push({ ...entry, call });
    else list.push({ ...entry, call: call || null });
  });
  const order = (a, b) => b.reasons.length - a.reasons.length || String(a.student.name || '').localeCompare(String(b.student.name || ''), 'et');
  return { list: list.sort(order), called: called.sort((a, b) => b.call.time - a.call.time) };
}
