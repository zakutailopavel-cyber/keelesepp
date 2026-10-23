// „Riskis õpilased” (owner 2026-10-23: удержание учеников — главные деньги школы). Who may stop learning soon, and why,
// in words the administrator can act on: absences and cancellations, a long break, no lesson ahead, no own practice,
// an unpaid invoice. And who is about to finish a package — the moment to talk about the next one.
// Pure: built from the cards, the lesson journal, the calendar, invoices and studentWords the CRM already has.

const DAY = 86400000;
const time = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const isAbsence = (status = '') => String(status).startsWith('Puudus');
const isCancelled = (status = '') => status === 'Tühistatud';
const isHeld = (status = '') => !status || status === 'Toimunud';

export const RISK_WEIGHTS = Object.freeze({ absences: 2, longBreak: 2, veryLongBreak: 3, noLessonAhead: 2, noPractice: 1, unpaid: 1 });
export const HIGH_RISK = 4;
export const SOME_RISK = 2;

// Teachers do not always mark held lessons in the journal (a weekly series runs while the journal stops in June), so a
// lesson the calendar had in the last `days` days also counts as a recent lesson: a one-off on such a date or a weekly
// series running then (not cancelled).
export function recentlyScheduled(events = [], today, days = 21) {
  const from = new Date(Date.parse(today) - days * DAY).toISOString().slice(0, 10);
  const ids = new Set();
  for (const event of events) {
    if (event.status === 'Tühistatud') continue;
    const add = () => { if (event.isGroup) (event.studentIds || []).forEach((id) => ids.add(id)); else if (event.studentId) ids.add(event.studentId); };
    if (event.recurring) { if ((event.startDate || '') <= today && (!event.endDate || event.endDate >= from)) add(); } else if (event.date && event.date >= from && event.date <= today) add();
  }
  return ids;
}

/**
 * students: active cards; lessons: journal records (date, status, studentId); unplannedIds: cards with no lesson ahead
 * (calendar/unplannedStudents.js); invoices: with studentId and an `overdue` test; words: studentWords.
 * Returns { risky: [{ student, score, level, reasons }], renewals: [{ student, left }] } — the riskiest first.
 */
export function retentionRisk({ students = [], lessons = [], unplannedIds = [], scheduledIds = [], overdueInvoices = [], words = [], seen = new Map(), now = Date.now() } = {}) {
  const byStudent = new Map();
  lessons.forEach((lesson) => {
    if (!lesson.studentId || !lesson.date || lesson.status === 'Planeeritud') return;
    if (time(lesson.date) > now) return;
    const list = byStudent.get(lesson.studentId) || [];
    list.push(lesson);
    byStudent.set(lesson.studentId, list);
  });
  const unplanned = new Set(unplannedIds);
  const scheduled = new Set(scheduledIds);
  const unpaid = new Set(overdueInvoices.map((invoice) => invoice.studentId).filter(Boolean));
  const practice = new Map();
  words.forEach((word) => {
    const at = time(word.reviewedAt);
    const current = practice.get(word.studentId) || { words: 0, last: 0 };
    practice.set(word.studentId, { words: current.words + 1, last: Math.max(current.last, at) });
  });

  const risky = [];
  const renewals = [];
  students.filter((student) => student.active !== false).forEach((student) => {
    const reasons = [];
    let score = 0;
    const journal = (byStudent.get(student.id) || []).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const lastFour = journal.slice(0, 4);
    const missed = lastFour.filter((lesson) => isAbsence(lesson.status) || isCancelled(lesson.status)).length;
    if (missed >= 2) { score += RISK_WEIGHTS.absences; reasons.push(`${missed} viimasest ${lastFour.length} tunnist jäi ära`); }
    const held = journal.find((lesson) => isHeld(lesson.status));
    if (held && !scheduled.has(student.id)) {
      const days = Math.floor((now - time(held.date)) / DAY);
      if (days > 90) { score += RISK_WEIGHTS.veryLongBreak; reasons.push(`kaart on aktiivne, aga tunde pole olnud ${Math.round(days / 30)} kuud — võta ühendust või arhiveeri`); } else if (days > 35) { score += RISK_WEIGHTS.veryLongBreak; reasons.push(`viimane tund ${days} päeva tagasi`); } else if (days > 21) { score += RISK_WEIGHTS.longBreak; reasons.push(`viimane tund ${days} päeva tagasi`); }
    }
    // no lesson ahead weighs little right after a lesson (the next one may simply not be in the calendar yet) and not at
    // all for a self-study card (it has no teacher's calendar)
    const recent = scheduled.has(student.id) || (held && now - time(held.date) <= 21 * DAY);
    if (unplanned.has(student.id) && !student.isSelfStudent) { score += recent ? 1 : RISK_WEIGHTS.noLessonAhead; reasons.push('järgmist tundi pole kalendris'); }
    // own practice: word reviews and „Minu vead” days; the last visit (presence.js) only once it is recorded
    const account = seen.get(student.id) || null;
    const practiceDays = Array.isArray(account?.practice?.days) ? account.practice.days : [];
    const own = practice.get(student.id) || { words: 0, last: 0 };
    const lastPractice = Math.max(own.last, ...practiceDays.map((day) => time(`${day}T12:00:00`)));
    const lastVisit = Math.max(account?.lastSeenAt || 0, lastPractice);
    if ((own.words || practiceDays.length) && (!lastPractice || now - lastPractice > 14 * DAY)) {
      score += RISK_WEIGHTS.noPractice;
      reasons.push(!lastPractice ? 'pole kordagi ise harjutanud' : account?.lastSeenAt && now - lastVisit > 14 * DAY ? `pole ${Math.floor((now - lastVisit) / DAY)} päeva sisse loginud` : 'pole 2 nädalat ise harjutanud');
    } else if (account?.lastSeenAt && now - lastVisit > 21 * DAY) {
      score += RISK_WEIGHTS.noPractice;
      reasons.push(`pole ${Math.floor((now - lastVisit) / DAY)} päeva sisse loginud`);
    }
    if (unpaid.has(student.id)) { score += RISK_WEIGHTS.unpaid; reasons.push('tasumata arve'); }
    // a student who has never had a lesson yet is new, not leaving: only the calendar gap counts for him
    if (!journal.length && reasons.length === 1 && reasons[0] === 'järgmist tundi pole kalendris') score = 1;
    if (score >= SOME_RISK) risky.push({ student, score, level: score >= HIGH_RISK ? 'high' : 'some', reasons });

    const total = Number(student.packageTotal) || 0;
    const used = Number(student.packageUsed) || 0;
    if (total > 0 && used <= total && total - used <= 1) renewals.push({ student, left: Math.max(0, total - used) });
  });
  risky.sort((a, b) => b.score - a.score || String(a.student.name).localeCompare(String(b.student.name), 'et'));
  renewals.sort((a, b) => a.left - b.left);
  return { risky, renewals };
}
