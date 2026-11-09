"use strict";

// Weekly „Märkimata tunnid” e-mail to every teacher (owner 2026-11-09: „раз в неделю отправлять каждому учителю список
// ЕГО неотмеченных прошедших уроков”). Pure: no Firebase. The service (teacher-unmarked-digest-service.js) loads and
// sends; index.js `weeklyUnmarkedLessonsDigest` runs it on Mondays 08:00 Tallinn.
//
// The set of unmarked lessons is the CRM's own (crm-v2/src/features/calendar/unmarkedLessons.js findUnmarkedLessons,
// on top of calendarView.occurrencesForDates): past occurrences of single (not group) schedule entries, still
// „Planeeritud”, without a lesson record linked to them (scheduleId + date, the entry's own lessonEntryId) and without a
// record of the same student and teacher at that very time. The Live Classroom evidence only sorts the page's rows
// into kinds; it never adds or removes a row, so it is not read here. teacher-unmarked-digest-core.test.js runs both
// implementations on the same data so they cannot drift apart.
//
// Which of them the e-mail counts (owner 2026-11-09, one rule in `countableUnmarked`, so it can be swapped for the
// shared definition agent/fast-marking is building in crm-v2): from the fixed CUTOFF_DATE 2026-11-01 up to yesterday
// (older ones are ignored, not mentioned), only active students' cards, only entries with a teacher, never a day of a
// closed financial period (financialLockedDates). Disabled teachers get nothing (digestTeachers).
// Never in the e-mail: prices, parent contacts, learners' addresses.

const CRM_URL = "https://crm.epkoolitus.ee";
const PAGE_URL = `${CRM_URL}/calendar/markimata`;
const APP_TIME_ZONE = "Europe/Tallinn";
const CUTOFF_DATE = "2026-11-01";
const REVIEW_DAYS = 60; // the CRM page's window: used only for the parity test with crm-v2
const MAX_ROWS = 30;
const SAME_LESSON_MINUTES = 15;
const DAY_IDS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ET = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
const RESULT_STATUSES = new Set(["Toimunud", "Puudus_eta", "Puudus_p"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
const normEmail = (value) => clean(value, 254).toLowerCase();
const validEmail = (value) => EMAIL.test(normEmail(value));

// ── dates (Tallinn, DST-safe) ─────────────────────────────────────────────────────────────────────────────────────

function tallinnDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(now).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(date, amount) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}
const dayIndex = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();

// ISO 8601 week of a calendar date: „2026-W46” (the year is the week's own year: 2027-01-01 is 2026-W53)
function isoWeekId(date) {
  const value = new Date(`${date}T12:00:00Z`);
  const weekday = (value.getUTCDay() + 6) % 7; // Mon 0 … Sun 6
  value.setUTCDate(value.getUTCDate() - weekday + 3); // the Thursday of that week decides the year
  const year = value.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4, 12));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  const week = 1 + Math.round((value - firstThursday) / (7 * 86400000));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// ── teacher names (same as crm-v2/src/utils/teachers.js canonicalTeacherName / isSameTeacher) ─────────────────────

const TEACHER_ALIASES = Object.freeze({
  pavel: "Pavel Zakutailo", jelena: "Elena Zakutailo", elena: "Elena Zakutailo", elizaveta: "Yelyzaveta Lukiianchuk",
  yelyzaveta: "Yelyzaveta Lukiianchuk", angelina: "Anhelina Korotka", anhelina: "Anhelina Korotka",
});
const EXACT_ALIASES = Object.freeze({ jegor: "Jegor Fjodorov" });
function canonicalTeacherName(value) {
  const name = String(value || "").trim();
  if (!name) return "";
  const lower = name.toLocaleLowerCase("et");
  if (EXACT_ALIASES[lower]) return EXACT_ALIASES[lower];
  const alias = Object.keys(TEACHER_ALIASES).find((key) => lower === key || lower.startsWith(`${key} `));
  return alias ? TEACHER_ALIASES[alias] : name;
}
const isSameTeacherName = (left, right) => Boolean(clean(left)) && canonicalTeacherName(left).toLocaleLowerCase("et") === canonicalTeacherName(right).toLocaleLowerCase("et");

// ── calendar occurrences (crm-v2 calendarView.eventOccursOn / occurrenceStatus / occurrencesForDates) ─────────────

function eventOccursOn(event, date) {
  if (event.status === "Tühistatud") return false;
  if (!event.recurring) return event.date === date;
  const start = event.startDate || event.date;
  if (!start || date < start || (event.endDate && date > event.endDate)) return false;
  if ((event.excludedDates || []).includes(date)) return false;
  return (event.day || DAY_IDS[dayIndex(start)]) === DAY_IDS[dayIndex(date)];
}

function occurrenceStatus(event, date) {
  const occurrence = event.occurrenceStatuses?.[date];
  if (occurrence?.status) return occurrence.status;
  if (!event.recurring || !RESULT_STATUSES.has(event.status)) return event.status;
  return (event.lessonOccurrenceDate || event.date) === date ? event.status : "Planeeritud";
}

function clockMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time || ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
function absoluteMinutes(date, time) {
  const minutes = clockMinutes(time);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (minutes === null || !match) return null;
  return Math.round(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 60000) + minutes;
}
const sameTeacherUid = (left = "", right = "") => !left || !right || left === right;
const recordDate = (lesson) => lesson.occurrenceDate || lesson.date || "";

// every past unmarked occurrence of the last `days` days (up to yesterday), newest first — the rows of the CRM page
// „Märkimata tunnid” (all teachers). Schedule entries as stored (status defaults to „Planeeritud”).
function unmarkedOccurrences({ schedule = [], lessons = [], today, days = REVIEW_DAYS } = {}) {
  const dates = Array.from({ length: days }, (_, index) => addDays(today, -(index + 1)));
  const first = dates[dates.length - 1] || "";
  const linked = new Set();
  const byReference = new Set();
  const recordsByDay = new Map();
  lessons.forEach((lesson) => {
    const date = recordDate(lesson);
    if (lesson.scheduleId && date) linked.add(`${lesson.scheduleId}:${date}`);
    if (lesson.id) byReference.add(lesson.id);
    if (!lesson.studentId || !date || date < first) return;
    const key = `${lesson.studentId}@${date}`;
    recordsByDay.set(key, [...(recordsByDay.get(key) || []), lesson]);
  });
  const ownReference = (item) => item.occurrenceStatuses?.[item.occurrenceDate]?.lessonEntryId
    || ((!item.recurring || (item.lessonOccurrenceDate || item.date) === item.occurrenceDate) ? item.lessonEntryId : "");
  const events = schedule
    .map((event) => ({ status: "Planeeritud", ...event }))
    .filter((event) => !event.isGroup && event.studentId);
  const items = [];
  dates.forEach((date) => events.forEach((event) => {
    if (!eventOccursOn(event, date)) return;
    const item = { ...event, status: occurrenceStatus(event, date), occurrenceDate: date, occurrenceId: `${event.id}:${date}` };
    if ((item.status || "Planeeritud") !== "Planeeritud") return;
    if (linked.has(`${item.id}:${date}`)) return;
    const reference = ownReference(item);
    if (reference && byReference.has(reference)) return;
    const minutes = absoluteMinutes(date, item.time);
    const ownMark = (recordsByDay.get(`${item.studentId}@${date}`) || []).some((record) => {
      if (!sameTeacherUid(record.teacherUid, item.teacherUid)) return false;
      const recordMinutes = absoluteMinutes(recordDate(record), record.time);
      return recordMinutes === null || minutes === null || Math.abs(recordMinutes - minutes) <= SAME_LESSON_MINUTES;
    });
    if (!ownMark) items.push(item);
  }));
  return items.sort((a, b) => `${b.occurrenceDate} ${b.time || ""}`.localeCompare(`${a.occurrenceDate} ${a.time || ""}`));
}

// ── recipients ────────────────────────────────────────────────────────────────────────────────────────────────────

// Staff who teach: users doc role „teacher” (or an administrator whose signed Auth claims also carry „teacher”), not
// disabled / pending, not in the card trash. Never a student or parent account. `authById`: uid → { email,
// emailVerified, customClaims } from Firebase Auth. The address is the users doc's own and must be the Auth account's
// verified one; otherwise the teacher still gets the bell notice, but no e-mail.
function digestTeachers(users = [], authById = new Map()) {
  return users.flatMap((user) => {
    if (!user?.id) return [];
    const role = clean(user.role, 40).toLowerCase();
    const auth = authById.get(user.id) || null;
    const claims = auth?.customClaims || {};
    const claimRoles = [claims.role, ...(Array.isArray(claims.roles) ? claims.roles : [])].map((value) => clean(value, 40).toLowerCase());
    const teaches = role === "teacher" || (role === "admin" && claimRoles.includes("teacher"));
    if (!teaches) return [];
    if (user.disabled === true || ["pending", "rejected"].includes(user.approvalStatus) || user.deletedAt || user.purgedAt || user.archived === true) return [];
    const email = normEmail(user.email);
    const verified = Boolean(auth && auth.emailVerified === true && validEmail(email) && normEmail(auth.email) === email);
    const name = clean(user.displayName || user.name, 160) || email || "Õpetaja";
    return [{ uid: user.id, name, email: verified ? email : "", emailVerified: verified }];
  });
}

// one teacher's lessons of the list: the entry's teacherUid, or (an old entry without one) the teacher's name
// ── the e-mail's rule: which unmarked lessons count ───────────────────────────────────────────────────────────────

// students: id → card ({ active, deletedAt, purgedAt, mergedIntoStudentId }); lockedDates: Set of closed days
function isActiveStudentCard(card) {
  return Boolean(card) && card.active !== false && !card.deletedAt && !card.purgedAt && !card.mergedIntoStudentId;
}
function countableUnmarked(items = [], { today, cutoff = CUTOFF_DATE, students = new Map(), lockedDates = new Set() } = {}) {
  return items.filter((item) => item.occurrenceDate >= cutoff && item.occurrenceDate < today
    && (clean(item.teacherUid) || clean(item.teacher))
    && isActiveStudentCard(students.get(item.studentId))
    && !lockedDates.has(item.occurrenceDate));
}

// days from the cutoff up to yesterday (how far back unmarkedOccurrences must look)
function daysSinceCutoff(today, cutoff = CUTOFF_DATE) {
  return Math.max(0, Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${cutoff}T12:00:00Z`)) / 86400000));
}

function lessonsOfTeacher(items = [], teacher = {}) {
  return items.filter((item) => (item.teacherUid ? item.teacherUid === teacher.uid : isSameTeacherName(item.teacher, teacher.name)));
}

// ── one teacher's digest ──────────────────────────────────────────────────────────────────────────────────────────

// the lesson's subject: its own, else the student's study track with this teacher, else the only track, else the card's
// (crm-v2 calendarView.lessonSubjectOf)
function subjectOf(item, student) {
  if (item.subject) return clean(item.subject, 80);
  const tracks = (student?.enrollments || []).filter((track) => track && track.active !== false && track.subject);
  return clean(tracks.find((track) => track.teacherUid && track.teacherUid === item.teacherUid)?.subject
    || (tracks.length === 1 ? tracks[0].subject : "")
    || student?.subject || "", 80);
}

// items: this teacher's countable lessons (countableUnmarked) → { total, shown, more, days: [{ date, label, rows:
// [{ time, name, subject }] }] }, newest day first. Only names, times and subjects leave the CRM.
function buildDigest(items = [], { students = new Map(), maxRows = MAX_ROWS } = {}) {
  const recent = [...items].sort((a, b) => `${b.occurrenceDate} ${b.time || ""}`.localeCompare(`${a.occurrenceDate} ${a.time || ""}`));
  const shownItems = recent.slice(0, maxRows);
  const days = [];
  shownItems.forEach((item) => {
    const student = students.get(item.studentId);
    const row = { time: clean(item.time, 5), name: clean(student?.name || item.studentName, 120) || "Õpilane", subject: subjectOf(item, student) };
    const last = days[days.length - 1];
    if (last && last.date === item.occurrenceDate) last.rows.push(row);
    else days.push({ date: item.occurrenceDate, label: dateLabel(item.occurrenceDate), rows: [row] });
  });
  days.forEach((day) => day.rows.sort((a, b) => a.time.localeCompare(b.time)));
  return { total: recent.length, shown: shownItems.length, more: recent.length - shownItems.length, days };
}

function dateLabel(date) {
  return `${DAY_ET[dayIndex(date)]} ${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}`;
}
const lessonWord = (count) => (count === 1 ? "tund" : "tundi");
const ruLessons = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "неотмеченный урок";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "неотмеченных урока";
  return "неотмеченных уроков";
};

// one e-mail → { subject, html, text }. Plain, one column, inline styles (mail programs drop <style>), readable at
// 320 px; the same look as the learner e-mails (learner-email-core composeLearnerEmail).
const shortDate = (date) => `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}`;
function composeDigestEmail({ teacher = {}, digest, cutoff = CUTOFF_DATE, pageUrl = PAGE_URL } = {}) {
  const firstName = clean(teacher.name, 160).split(/\s+/)[0] || "";
  const subject = `Märkimata tunnid: ${digest.total}`;
  const greeting = firstName ? `Tere, ${firstName}!` : "Tere!";
  const intro = `Sul on alates ${shortDate(cutoff)} ${digest.total} ${lessonWord(digest.total)}, millel pole märget. Märkimata tund ei jõua arvele ega õpilase ajalukku. Märgi iga tund: toimus või puudus.`;
  const moreLine = digest.more > 0 ? `… ja veel ${digest.more}` : "";
  const ruLine = `RU: у вас ${digest.total} ${ruLessons(digest.total)} с ${shortDate(cutoff)}. Отметьте в CRM: урок состоялся или ученик отсутствовал.`;
  const button = "Ava märkimata tunnid";
  const footer = "Saadame selle kirja esmaspäeviti, kui sul on märkimata tunde. KeeleSepp · E&P Koolitus OÜ";

  // phone mail clients (owner 2026-11-09: text was cut off at 420 px): fluid 100 % up to 600 px, fixed table layout so a
  // long name never widens the page, every text block wraps (overflow-wrap / word-break for clients without the first)
  const wrap = "overflow-wrap:break-word;word-wrap:break-word;word-break:break-word";
  const p = (style, content, attrs = "") => `<p${attrs} style="margin:0;${style};${wrap}">${content}</p>`;
  const dayHtml = digest.days.map((day) => `<tr><td colspan="3" style="padding:12px 0 4px;font-weight:700;border-bottom:1px solid #e5e7eb;${wrap}">${esc(day.label)}</td></tr>${day.rows.map((row) => `<tr><td style="padding:4px 6px 4px 0;vertical-align:top;color:#334155">${esc(row.time || "–")}</td><td style="padding:4px 8px 4px 0;vertical-align:top;font-weight:600;${wrap}">${esc(row.name)}</td><td style="padding:4px 0;vertical-align:top;color:#64748b;${wrap}">${esc(row.subject)}</td></tr>`).join("")}`).join("");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1C2B3A;line-height:1.5;font-size:15px;width:100%;max-width:600px;box-sizing:border-box;${wrap}">
  ${p("margin-bottom:8px", esc(greeting))}
  ${p("margin-bottom:12px", esc(intro))}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:600px;table-layout:fixed;margin:0 0 8px"><colgroup><col style="width:52px"><col><col style="width:38%"></colgroup>${dayHtml}</table>
  ${moreLine ? p("margin:4px 0 8px;color:#334155", esc(moreLine)) : ""}
  ${p("margin:18px 0", `<a href="${esc(pageUrl)}" style="display:inline-block;max-width:100%;box-sizing:border-box;background:#2F5D50;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">${esc(button)}</a>`)}
  ${p("margin-bottom:12px;color:#334155;border-top:1px solid #e5e7eb;padding-top:10px", esc(ruLine), ' lang="ru"')}
  ${p("font-size:12px;color:#64748b;margin-top:18px", esc(footer))}
</div>`;
  const text = [
    greeting,
    "",
    intro,
    "",
    ...digest.days.flatMap((day) => [day.label, ...day.rows.map((row) => `  ${row.time || "–"}  ${row.name}${row.subject ? ` · ${row.subject}` : ""}`)]),
    ...(moreLine ? ["", moreLine] : []),
    "",
    `${button}: ${pageUrl}`,
    "",
    ruLine,
    "",
    footer,
  ].join("\n");
  return { subject, html, text };
}

// ── settings and the weekly marker ────────────────────────────────────────────────────────────────────────────────

// emailSettings/teacherDigest; no document = OFF (owner 2026-11-09: he sees a real test e-mail first, then switches
// it on in Seaded)
function normalizeDigestSettings(raw = {}) {
  return { weeklyUnmarked: raw?.weeklyUnmarked === true };
}

const markerId = (uid, week) => `${String(uid).replace(/[/\s]+/g, "_")}_${week}`;

// may this run send to this teacher this week? A marker that exists means: sent, being sent, or done without e-mail;
// only a failed send is tried again (at most maxAttempts times)
function markerAllowsSend(marker, { maxAttempts = 3 } = {}) {
  if (!marker) return true;
  return marker.status === "failed" && Number(marker.attempts || 0) < maxAttempts;
}

module.exports = {
  CRM_URL, PAGE_URL, APP_TIME_ZONE, CUTOFF_DATE, REVIEW_DAYS, MAX_ROWS,
  tallinnDate, addDays, isoWeekId, canonicalTeacherName, isSameTeacherName,
  eventOccursOn, occurrenceStatus, unmarkedOccurrences,
  digestTeachers, isActiveStudentCard, countableUnmarked, daysSinceCutoff, lessonsOfTeacher, subjectOf, buildDigest, dateLabel, composeDigestEmail,
  normalizeDigestSettings, markerId, markerAllowsSend, normEmail, validEmail,
};
