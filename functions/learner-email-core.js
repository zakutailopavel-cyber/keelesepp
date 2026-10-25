"use strict";

// E-mails to students and parents (owner 2026-10-25): lesson reminder the day before, lesson moved / cancelled (only
// changes made by staff — a learner can only ask), new schedule from the planner, homework due tomorrow, homework
// checked, „Teated”. Pure rules and texts; Firestore and delivery live in learner-email-service.js, the triggers and
// the 5-minute tick in index.js. Contract and settings: docs/EMAIL_NOTIFICATIONS.md.

const crypto = require("crypto");

const CRM_URL = "https://crm.epkoolitus.ee";
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "Europe/Tallinn";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_IDS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ET = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
const DAY_RU = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const DAY_RU_PO = ["по воскресеньям", "по понедельникам", "по вторникам", "по средам", "по четвергам", "по пятницам", "по субботам"];
const RESULT_STATUSES = new Set(["Toimunud", "Puudus_eta", "Puudus_p"]);
const CANCELLED = "Tühistatud";
const HOMEWORK_CLOSED = new Set(["Tehtud", "Suletud"]);

// minutes a lesson change waits before it is e-mailed: the calendar's „Võta tagasi” (undo) inside this window
// sends nothing, and several quick moves of the same lesson become one e-mail
const CHANGE_SETTLE_MINUTES = 10;
// the planner writes a batch of lessons at „Kinnita ajakava”; the e-mail goes when no lesson of the batch was
// written for this long
const PLANNER_QUIET_MINUTES = 3;
const REVIEW_SETTLE_MINUTES = 2;
// SMTP (smtp.zone.eu) is not flooded: at most this many messages per 5-minute tick (≈ 480 an hour), a pause between
const MAX_MESSAGES_PER_TICK = 40;
const SEND_PAUSE_MS = 400;
const MAX_ATTEMPTS = 3;
// daily reminders are never sent at night, even when the admin switches them on late
const LAST_DAILY_HOUR = 21;

const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
const isoDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(clean(value, 10)) ? clean(value, 10) : "");
const normEmail = (value) => clean(value, 254).toLowerCase();
const validEmail = (value) => EMAIL.test(normEmail(value));

// ── types and settings (emailSettings/learner) ────────────────────────────────────────────────────────────────────

const TYPES = ["lessonReminder", "lessonMoved", "lessonCancelled", "newSchedule", "homeworkDue", "homeworkChecked", "announcement"];
const TEXT_FIELDS = ["subjectEt", "subjectRu", "introEt", "introRu"];

const DEFAULT_TEXTS = {
  lessonReminder: {
    subjectEt: "Homme kell {kell}: tund ({õpilane})",
    subjectRu: "Завтра в {kell}: урок ({õpilane})",
    introEt: "Tuletame meelde homset tundi.",
    introRu: "Напоминаем о завтрашнем уроке.",
  },
  lessonMoved: {
    subjectEt: "Tunni aeg muutus ({õpilane})",
    subjectRu: "Время урока изменилось ({õpilane})",
    introEt: "Õpetaja kinnitas tunnile uue aja.",
    introRu: "Учитель подтвердил новое время урока.",
  },
  lessonCancelled: {
    subjectEt: "Tund jääb ära: {kuupäev} ({õpilane})",
    subjectRu: "Урок отменён: {kuupäev} ({õpilane})",
    introEt: "Õpetaja tühistas selle tunni. Küsimuste korral vasta sellele kirjale.",
    introRu: "Учитель отменил этот урок. Если есть вопросы, ответьте на это письмо.",
  },
  newSchedule: {
    subjectEt: "Uus tunniplaan ({õpilane})",
    subjectRu: "Новое расписание ({õpilane})",
    introEt: "Tunniplaan on kinnitatud. Need ajad kehtivad igal nädalal.",
    introRu: "Расписание подтверждено. Это время действует каждую неделю.",
  },
  homeworkDue: {
    subjectEt: "Kodutöö tähtaeg on homme ({õpilane})",
    subjectRu: "Срок домашнего задания — завтра ({õpilane})",
    introEt: "Kodutöö ei ole veel esitatud ja tähtaeg on homme.",
    introRu: "Домашнее задание ещё не сдано, а срок — завтра.",
  },
  homeworkChecked: {
    subjectEt: "Töö on kontrollitud ({õpilane})",
    subjectRu: "Работа проверена ({õpilane})",
    introEt: "Õpetaja kontrollis tööd. Parandused ja tagasiside on KeeleSepas.",
    introRu: "Учитель проверил работу. Исправления и отзыв — в KeeleSepp.",
  },
  announcement: {
    subjectEt: "Teade: {pealkiri}",
    subjectRu: "Объявление: {pealkiri}",
    introEt: "Koolil on teile teade. Logi KeeleSeppa sisse ja vasta.",
    introRu: "У школы для вас объявление. Войдите в KeeleSepp и ответьте.",
  },
};

// the placeholders each type knows (Seaded shows them next to the texts)
const PLACEHOLDERS = {
  lessonReminder: ["õpilane", "kuupäev", "kell", "õpetaja"],
  lessonMoved: ["õpilane", "kuupäev", "kell", "uus_kuupäev", "uus_kell", "õpetaja"],
  lessonCancelled: ["õpilane", "kuupäev", "kell", "õpetaja"],
  newSchedule: ["õpilane", "algus", "õpetaja"],
  homeworkDue: ["õpilane", "tähtaeg", "ülesanne", "õpetaja"],
  homeworkChecked: ["õpilane", "töö", "hinne", "õpetaja"],
  announcement: ["pealkiri"],
};

const DEFAULT_DAILY_HOUR = 17;

function normalizeSettings(raw = {}) {
  const hour = Number(raw.dailyHour);
  const types = {};
  for (const type of TYPES) {
    const stored = raw.types && typeof raw.types === "object" && raw.types[type] && typeof raw.types[type] === "object" ? raw.types[type] : {};
    const texts = {};
    for (const field of TEXT_FIELDS) texts[field] = clean(stored[field], field.startsWith("subject") ? 200 : 1000);
    types[type] = { enabled: stored.enabled === true, enabledAt: clean(stored.enabledAt, 40), ...texts };
  }
  return {
    dailyHour: Number.isInteger(hour) && hour >= 6 && hour <= LAST_DAILY_HOUR ? hour : DEFAULT_DAILY_HOUR,
    siteAddress: clean(raw.siteAddress, 200),
    types,
  };
}

const anyEnabled = (settings) => TYPES.some((type) => settings.types[type]?.enabled);

// {õpilane} → value; an unknown placeholder disappears (never shown raw to a parent)
function fill(template, vars = {}) {
  return String(template || "").replace(/\{([\p{L}_]+)\}/gu, (_, key) => clean(vars[key], 300)).replace(/\s+\(\)/g, "").replace(/ {2,}/g, " ").trim();
}

function textsFor(settings, type) {
  const stored = settings?.types?.[type] || {};
  return Object.fromEntries(TEXT_FIELDS.map((field) => [field, stored[field] || DEFAULT_TEXTS[type][field]]));
}

// ── time in Tallinn (DST-safe: Intl, never a fixed offset) ────────────────────────────────────────────────────────

function tallinnParts(now = new Date(), timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(now).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) % 24, minute: Number(parts.minute) };
}

function addDays(date, amount) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

const dayIndex = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();
const dayIdOf = (date) => DAY_IDS[dayIndex(date)];
const shortDate = (date) => (isoDate(date) ? `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}` : "");
const dateEt = (date) => (isoDate(date) ? `${DAY_ET[dayIndex(date)]}, ${shortDate(date)}` : "");
const dateRu = (date) => (isoDate(date) ? `${DAY_RU[dayIndex(date)]}, ${shortDate(date)}` : "");
const dayEtOf = (dayId) => DAY_ET[Math.max(0, DAY_IDS.indexOf(dayId))];
const dayRuPoOf = (dayId) => DAY_RU_PO[Math.max(0, DAY_IDS.indexOf(dayId))];

// the daily run (reminders) is due once a day from the chosen hour until 21:59 Tallinn time
function dailyRunDue({ now = new Date(), hour = DEFAULT_DAILY_HOUR, lastRunDate = "" } = {}) {
  const local = tallinnParts(now);
  return { due: local.hour >= hour && local.hour <= LAST_DAILY_HOUR && lastRunDate !== local.date, today: local.date, tomorrow: addDays(local.date, 1) };
}

// ── calendar occurrences (the same rules as crm-v2 calendarView.eventOccursOn / occurrenceStatus) ────────────────

function occurrenceStatusOf(event, date) {
  const own = event.occurrenceStatuses?.[date];
  if (own?.status) return own.status;
  if (!event.recurring || !RESULT_STATUSES.has(event.status)) return event.status || "Planeeritud";
  return (event.lessonOccurrenceDate || event.date) === date ? event.status : "Planeeritud";
}

function occursOn(event, date) {
  if (!event || event.status === CANCELLED || event.draft === true) return false;
  if (!event.recurring) return event.date === date;
  const start = event.startDate || event.date;
  if (!start || date < start || (event.endDate && date > event.endDate)) return false;
  if ((event.excludedDates || []).includes(date)) return false;
  return (event.day || dayIdOf(start)) === dayIdOf(date);
}

// group lessons live in groups/{id}.lessons[] (calendarView.groupCalendarEvents)
function groupEvents(groups = []) {
  return groups.flatMap((group) => (Array.isArray(group.lessons) ? group.lessons : []).map((lesson) => ({
    id: `group:${group.id}:${lesson.id}`,
    groupId: group.id,
    isGroup: true,
    studentIds: (group.students || []).filter((studentId) => {
      const selected = group.studentLessonMap?.[studentId];
      return Array.isArray(selected) ? selected.includes(lesson.id) : true;
    }),
    groupName: group.name || "",
    teacher: group.teacher || "",
    teacherUid: group.teacherUid || "",
    date: lesson.date || "",
    day: lesson.day || "Mon",
    time: lesson.time || "09:00",
    duration: Number(lesson.duration) || 60,
    status: lesson.status || "Planeeritud",
    recurring: lesson.recurring !== false,
    startDate: lesson.startDate || lesson.date || "",
    endDate: lesson.endDate || "",
    excludedDates: lesson.excludedDates || [],
    occurrenceStatuses: lesson.occurrenceStatuses || {},
    lessonOccurrenceDate: lesson.lessonOccurrenceDate || "",
    online: lesson.online === true || group.online === true,
    roomName: lesson.roomName || group.roomName || "",
    subject: group.subject || "",
  })));
}

const jobKey = (...parts) => parts.map((part) => String(part ?? "").replace(/[/\s]+/g, "_")).join("__").slice(0, 700);

// every planned lesson on `date`, one entry per student: { jobId, scheduleId, studentId, date, time, … }
function lessonOccurrencesOn(schedules = [], groups = [], date) {
  const out = [];
  const take = (event, studentId) => {
    const status = occurrenceStatusOf(event, date);
    if (status === CANCELLED || RESULT_STATUSES.has(status)) return;
    out.push({
      jobId: jobKey("lessonReminder", event.id, date, studentId),
      scheduleId: event.id,
      groupId: event.groupId || "",
      studentId,
      date,
      time: clean(event.time, 5) || "09:00",
      duration: Number(event.duration) || 60,
      teacher: clean(event.teacherFull || event.teacher, 120),
      teacherUid: clean(event.teacherUid, 128),
      online: event.online === true,
      roomName: clean(event.roomName, 80),
      subject: clean(event.subject, 80),
      groupName: clean(event.groupName, 120),
    });
  };
  for (const event of schedules) {
    if (!event?.studentId || !occursOn(event, date)) continue;
    take(event, event.studentId);
  }
  for (const event of groupEvents(groups)) {
    if (!occursOn(event, date)) continue;
    event.studentIds.forEach((studentId) => take(event, studentId));
  }
  return out.sort((a, b) => `${a.time} ${a.studentId}`.localeCompare(`${b.time} ${b.studentId}`));
}

// ── homework ──────────────────────────────────────────────────────────────────────────────────────────────────────

// open homework (not handed in, not closed) whose due date is `date`
function homeworkDueOn(homeworks = [], date) {
  return homeworks.filter((item) => item?.studentId && clean(item.due, 10) === date && !HOMEWORK_CLOSED.has(item.status)
    && item.notify !== false && clean(item.task || item.worksheetTitle, 10))
    .map((item) => ({ jobId: jobKey("homeworkDue", item.id, date), homeworkId: item.id, studentId: item.studentId, due: date }));
}

// a worksheet / exercise result became „reviewed” for the first time (homework.js reviewSubmission)
function firstReview(before = {}, after = {}) {
  if (!after?.studentId) return false;
  const was = before?.reviewStatus === "reviewed" || Boolean(before?.reviewedAt);
  return !was && after.reviewStatus === "reviewed";
}

// ── lesson changes ────────────────────────────────────────────────────────────────────────────────────────────────
// Only staff (teacher or administrator) can write `schedule` (firestore.rules); a student or parent can only ask
// („Ei saa tulla?”, lessonChangeRequests) and the teacher's „Kinnita” moves the lesson — so every change below is
// confirmed by staff. What is NOT e-mailed: deleting a one-off lesson (a mistake being removed), ending a series
// (endDate), changes to past lessons, drafts, lessons written by the planner (they get the new-schedule e-mail).

const plannerOwned = (doc) => Boolean(clean(doc?.plannerBatchId, 200));
const isResult = (status) => RESULT_STATUSES.has(status);

// → [{ jobId, scope: 'single' | 'occurrence' | 'series', scheduleId, date?, old, parentId?, studentId }]
function scheduleChangeNotices(scheduleId, before, after, { today }) {
  if (!after || plannerOwned(after) || plannerOwned(before) || after.draft === true) return [];
  const studentId = clean(after.studentId || before?.studentId, 128);
  if (!studentId) return [];
  if (!before) {
    // „this and the following” move creates a continuing series (calendarGrid.planMove scope 'series')
    if (after.recurring && clean(after.continuesSeriesId, 200) && (after.startDate || after.date) >= today) {
      return [{ jobId: jobKey("lessonChange", "series", scheduleId), scope: "series", scheduleId, parentId: clean(after.continuesSeriesId, 200), studentId, from: after.startDate || after.date }];
    }
    return [];
  }
  const out = [];
  if (!before.recurring && !after.recurring) {
    if (isResult(before.status) || !isoDate(before.date) || before.date < today) return [];
    const old = { date: before.date, time: clean(before.time, 5), duration: Number(before.duration) || 60 };
    if (before.status !== CANCELLED && after.status === CANCELLED) {
      out.push({ jobId: jobKey("lessonChange", scheduleId), scope: "single", scheduleId, studentId, old });
    } else if (after.status !== CANCELLED && !isResult(after.status) && (before.date !== after.date || clean(before.time, 5) !== clean(after.time, 5))) {
      out.push({ jobId: jobKey("lessonChange", scheduleId), scope: "single", scheduleId, studentId, old });
    }
    return out;
  }
  if (before.recurring && after.recurring) {
    const was = new Set(before.excludedDates || []);
    const added = (after.excludedDates || []).filter((date) => !was.has(date) && isoDate(date) && date >= today);
    const cancelledNow = Object.entries(after.occurrenceStatuses || {})
      .filter(([date, value]) => value?.status === CANCELLED && before.occurrenceStatuses?.[date]?.status !== CANCELLED && isoDate(date) && date >= today)
      .map(([date]) => date);
    for (const date of [...new Set([...added, ...cancelledNow])].sort()) {
      if (!occursOn({ ...before, excludedDates: [...was] }, date)) continue;
      out.push({ jobId: jobKey("lessonChange", scheduleId, date), scope: "occurrence", scheduleId, date, studentId, old: { date, time: clean(before.time, 5), duration: Number(before.duration) || 60 } });
    }
    const beforeDay = before.day || dayIdOf(before.startDate || before.date);
    const afterDay = after.day || dayIdOf(after.startDate || after.date);
    const active = after.status !== CANCELLED && (!after.endDate || after.endDate >= today);
    if (active && (beforeDay !== afterDay || clean(before.time, 5) !== clean(after.time, 5))) {
      out.push({ jobId: jobKey("lessonChange", "series", scheduleId), scope: "series", scheduleId, studentId, old: { day: beforeDay, time: clean(before.time, 5) } });
    }
  }
  return out;
}

// At send time, after the settle window: what really happened? → { type: 'lessonMoved' | 'lessonCancelled', old, next,
// series? } or { skip: reason }. `current` = the schedule doc now, `children` = schedule docs that took this occurrence
// (movedFromSeriesId + movedFromDate, or the older seriesId + originalOccurrenceDate), `parent` = for a continuing series.
function resolveLessonChange(job, { current = null, children = [], parent = null, today }) {
  if (!current) return { skip: "deleted" };
  if (plannerOwned(current)) return { skip: "planner" };
  const time = (value) => clean(value, 5);
  if (job.scope === "single") {
    if (current.status === CANCELLED) return { type: "lessonCancelled", old: job.old, lesson: current };
    if (isResult(current.status)) return { skip: "held" };
    if (current.date === job.old.date && time(current.time) === time(job.old.time)) return { skip: "unchanged" };
    if (!isoDate(current.date) || current.date < today) return { skip: "past" };
    return { type: "lessonMoved", old: job.old, next: { date: current.date, time: time(current.time), duration: Number(current.duration) || 60 }, lesson: current };
  }
  if (job.scope === "occurrence") {
    const date = job.date;
    const excluded = (current.excludedDates || []).includes(date) || current.occurrenceStatuses?.[date]?.status === CANCELLED;
    if (!excluded) return { skip: "restored" };
    const moved = children.filter((child) => child && !plannerOwned(child) && child.status !== CANCELLED && !isResult(child.status) && isoDate(child.date));
    if (moved.length) {
      const child = moved.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];
      if (child.date === date && time(child.time) === time(job.old.time)) return { skip: "unchanged" };
      return { type: "lessonMoved", old: job.old, next: { date: child.date, time: time(child.time), duration: Number(child.duration) || 60 }, lesson: { ...current, ...child } };
    }
    if (children.some((child) => child && isResult(child.status))) return { skip: "held" };
    return { type: "lessonCancelled", old: job.old, lesson: current };
  }
  if (job.scope === "series") {
    if (current.status === CANCELLED || !current.recurring) return { skip: "cancelled" };
    const from = [current.startDate || current.date, today].filter(isoDate).sort().pop();
    if (current.endDate && current.endDate < from) return { skip: "ended" };
    const old = job.parentId
      ? (parent ? { day: parent.day || dayIdOf(parent.startDate || parent.date), time: time(parent.time) } : null)
      : job.old;
    if (!old) return { skip: "no-parent" };
    const next = { day: current.day || dayIdOf(current.startDate || current.date), time: time(current.time), duration: Number(current.duration) || 60 };
    if (old.day === next.day && old.time === next.time) return { skip: "unchanged" };
    return { type: "lessonMoved", series: true, from, old, next, lesson: current };
  }
  return { skip: "unknown" };
}

// ── planner batch (docs/EMAIL_NOTIFICATIONS.md „Planner contract”) ────────────────────────────────────────────────

// all schedule docs of one plannerBatchId → per student: weekly times, one-off lessons, start date, teachers
function plannerBatchSummary(lessons = [], { today } = {}) {
  const byStudent = new Map();
  for (const lesson of lessons) {
    if (!lesson?.studentId || lesson.status === CANCELLED || lesson.draft === true) continue;
    const entry = byStudent.get(lesson.studentId) || { studentId: lesson.studentId, weekly: [], singles: [], teachers: new Set(), start: "" };
    const start = isoDate(lesson.startDate || lesson.date);
    if (lesson.recurring) {
      if (lesson.endDate && today && lesson.endDate < today) continue;
      entry.weekly.push({ day: lesson.day || (start ? dayIdOf(start) : "Mon"), time: clean(lesson.time, 5), duration: Number(lesson.duration) || 60, teacher: clean(lesson.teacherFull || lesson.teacher, 120), online: lesson.online === true, roomName: clean(lesson.roomName, 80), subject: clean(lesson.subject, 80), startDate: start });
    } else {
      if (!start || (today && start < today)) continue;
      entry.singles.push({ date: start, time: clean(lesson.time, 5), duration: Number(lesson.duration) || 60, teacher: clean(lesson.teacherFull || lesson.teacher, 120), online: lesson.online === true, roomName: clean(lesson.roomName, 80), subject: clean(lesson.subject, 80) });
    }
    const teacher = clean(lesson.teacherFull || lesson.teacher, 120);
    if (teacher) entry.teachers.add(teacher);
    if (start && (!entry.start || start < entry.start)) entry.start = start;
    byStudent.set(lesson.studentId, entry);
  }
  const order = (day) => (DAY_IDS.indexOf(day) + 6) % 7;
  return [...byStudent.values()].filter((entry) => entry.weekly.length || entry.singles.length).map((entry) => ({
    ...entry,
    teachers: [...entry.teachers],
    weekly: entry.weekly.sort((a, b) => order(a.day) - order(b.day) || a.time.localeCompare(b.time)),
    singles: entry.singles.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
  }));
}

// ── recipients ────────────────────────────────────────────────────────────────────────────────────────────────────

const unique = (values) => [...new Set(values.flat().filter(Boolean))];
const studentAccountIds = (student = {}) => unique([student.linkedUserId, student.studentUid, ...(Array.isArray(student.linkedUserIds) ? student.linkedUserIds : [])].map((id) => clean(id, 128)));
const parentAccountIds = (student = {}) => unique([student.linkedParentId, student.parentUid, student.guardianUid, ...(Array.isArray(student.linkedParentIds) ? student.linkedParentIds : [])].map((id) => clean(id, 128)));
const liveCard = (student = {}) => student.active !== false && student.archived !== true && student.convertedToParent !== true && !student.mergedInto;
const accountUsable = (profile) => Boolean(profile) && profile.disabled !== true && !["pending", "rejected"].includes(profile.approvalStatus);

// the student's own addresses and the parents' addresses of one card (card fields + linked accounts + parent contacts
// without an account), deduplicated: one person never gets the same e-mail twice. `accounts` maps uid → users doc.
function cardRecipients(student = {}, accounts = new Map(), { homework = false } = {}) {
  if (!liveCard(student)) return [];
  if (homework && student.homeworkEmailOptOut === true) return [];
  const studentEmails = unique([student.email, ...studentAccountIds(student).map((uid) => (accountUsable(accounts.get(uid)) ? accounts.get(uid).email : ""))]
    .map(normEmail).filter(validEmail));
  const contacts = Array.isArray(student.parentContacts) ? student.parentContacts.map((contact) => contact?.email) : [];
  const parentEmails = unique([student.parentEmail, student.guardianEmail, ...contacts, ...parentAccountIds(student).map((uid) => (accountUsable(accounts.get(uid)) ? accounts.get(uid).email : ""))]
    .map(normEmail).filter((email) => validEmail(email) && !studentEmails.includes(email)));
  // `preferredLanguage` ('et' | 'ru' | 'en'): the student card for the student's addresses, the parent's user profile
  // for that parent's address (agent/missing-data-gate adds the field); a contact without an account has none
  const accountLanguage = (email, ids) => ids.map((uid) => (normEmail(accounts.get(uid)?.email) === email ? clean(accounts.get(uid)?.preferredLanguage, 4) : "")).find(Boolean) || "";
  return [
    ...studentEmails.map((email) => ({ email, audience: "student", profileLanguage: clean(student.preferredLanguage, 4) })),
    ...parentEmails.map((email) => ({ email, audience: "parent", profileLanguage: accountLanguage(email, parentAccountIds(student)) })),
  ];
}

// et | ru | both: the recipient's own choice on the preferences page, else `preferredLanguage` on the card / parent
// profile when it is et or ru, else both (Estonian first). 'en' has no texts yet → both.
function languageFor(preference = {}, profileLanguage = "") {
  const chosen = clean(preference?.language, 4);
  if (["et", "ru", "both"].includes(chosen)) return chosen;
  return ["et", "ru"].includes(profileLanguage) ? profileLanguage : "both";
}

const emailHash = (email) => crypto.createHash("sha256").update(normEmail(email)).digest("hex");

// ── preferences link: a signed token per address (no login) ──────────────────────────────────────────────────────

const b64url = (value) => Buffer.from(value).toString("base64url");
const sign = (key, email) => crypto.createHmac("sha256", key).update(`learner-email-v1:${normEmail(email)}`).digest("base64url").slice(0, 32);

function preferenceToken(email, key) {
  if (!key || !validEmail(email)) throw new Error("token key and e-mail required");
  return `${b64url(normEmail(email))}.${sign(key, email)}`;
}

function verifyPreferenceToken(token, key) {
  const [encoded, signature] = clean(token, 600).split(".");
  if (!encoded || !signature || !key) return "";
  let email = "";
  try { email = Buffer.from(encoded, "base64url").toString("utf8"); } catch { return ""; }
  if (!validEmail(email)) return "";
  const expected = Buffer.from(sign(key, email));
  const given = Buffer.from(signature);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given) ? normEmail(email) : "";
}

const maskEmail = (email) => {
  const [name, domain] = normEmail(email).split("@");
  return name && domain ? `${name.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, name.length - 2)))}@${domain}` : "";
};

const preferencesUrl = (token) => `${CRM_URL}/e-kirjad/${encodeURIComponent(token)}`;

// ── composing ─────────────────────────────────────────────────────────────────────────────────────────────────────

function placeRows(lesson = {}, siteAddress = "") {
  if (lesson.online) return { et: "veebitund — logi KeeleSeppa sisse ja ava tund", ru: "онлайн-урок — войдите в KeeleSepp и откройте урок" };
  const room = clean(lesson.roomName, 80);
  if (room) return { et: [`kabinet ${room}`, siteAddress].filter(Boolean).join(", "), ru: [`кабинет ${room}`, siteAddress].filter(Boolean).join(", ") };
  return siteAddress ? { et: siteAddress, ru: siteAddress } : null;
}

const weeklyLine = (item, lang) => {
  const parts = lang === "et"
    ? [`${dayEtOf(item.day)} kell ${item.time}`, `${item.duration} min`, item.subject, item.teacher ? `õpetaja ${item.teacher}` : "", item.online ? "veebitund" : item.roomName ? `kabinet ${item.roomName}` : ""]
    : [`${dayRuPoOf(item.day)} в ${item.time}`, `${item.duration} мин`, item.subject, item.teacher ? `учитель ${item.teacher}` : "", item.online ? "онлайн" : item.roomName ? `кабинет ${item.roomName}` : ""];
  return parts.filter(Boolean).join(" · ");
};

// the content of one type → { vars, rows: { et: [[label, value]], ru: [...] }, block, buttonPath }
function contentFor(type, data = {}, { siteAddress = "" } = {}) {
  const student = clean(data.studentName, 120);
  const teacher = clean(data.teacher, 120);
  const teacherRows = teacher ? { et: [["Õpetaja", teacher]], ru: [["Учитель", teacher]] } : { et: [], ru: [] };
  const studentRows = student ? { et: [["Õpilane", student]], ru: [["Ученик", student]] } : { et: [], ru: [] };
  const subjectRows = data.subject ? { et: [["Aine", data.subject]], ru: [["Предмет", data.subject]] } : { et: [], ru: [] };
  const place = placeRows(data.lesson || data, siteAddress);
  const placeEt = place ? [["Koht", place.et]] : [];
  const placeRu = place ? [["Место", place.ru]] : [];
  if (type === "lessonReminder") {
    return {
      vars: { õpilane: student, kuupäev: shortDate(data.date), kell: data.time, õpetaja: teacher },
      rows: {
        et: [...studentRows.et, ["Aeg", `${dateEt(data.date)} kell ${data.time} (${data.duration || 60} min)`], ...subjectRows.et, ...teacherRows.et, ...placeEt],
        ru: [...studentRows.ru, ["Время", `${dateRu(data.date)} в ${data.time} (${data.duration || 60} мин)`], ...subjectRows.ru, ...teacherRows.ru, ...placeRu],
      },
      buttonPath: "/",
    };
  }
  if (type === "lessonMoved") {
    if (data.series) {
      const from = data.from;
      return {
        vars: { õpilane: student, kuupäev: shortDate(from), kell: data.old?.time, uus_kuupäev: shortDate(from), uus_kell: data.next?.time, õpetaja: teacher },
        rows: {
          et: [...studentRows.et, ["Oli", `${dayEtOf(data.old?.day)} kell ${data.old?.time}`], ["Uus aeg", `${dayEtOf(data.next?.day)} kell ${data.next?.time}`], ["Kehtib alates", dateEt(from)], ...teacherRows.et, ...placeEt],
          ru: [...studentRows.ru, ["Было", `${DAY_RU[DAY_IDS.indexOf(data.old?.day)] || ""} в ${data.old?.time}`], ["Новое время", `${DAY_RU[DAY_IDS.indexOf(data.next?.day)] || ""} в ${data.next?.time}`], ["Действует с", dateRu(from)], ...teacherRows.ru, ...placeRu],
        },
        buttonPath: "/",
      };
    }
    return {
      vars: { õpilane: student, kuupäev: shortDate(data.old?.date), kell: data.old?.time, uus_kuupäev: shortDate(data.next?.date), uus_kell: data.next?.time, õpetaja: teacher },
      rows: {
        et: [...studentRows.et, ["Oli", `${dateEt(data.old?.date)} kell ${data.old?.time}`], ["Uus aeg", `${dateEt(data.next?.date)} kell ${data.next?.time}`], ...teacherRows.et, ...placeEt],
        ru: [...studentRows.ru, ["Было", `${dateRu(data.old?.date)} в ${data.old?.time}`], ["Новое время", `${dateRu(data.next?.date)} в ${data.next?.time}`], ...teacherRows.ru, ...placeRu],
      },
      buttonPath: "/",
    };
  }
  if (type === "lessonCancelled") {
    return {
      vars: { õpilane: student, kuupäev: shortDate(data.old?.date), kell: data.old?.time, õpetaja: teacher },
      rows: {
        et: [...studentRows.et, ["Ära jääb", `${dateEt(data.old?.date)} kell ${data.old?.time}`], ...teacherRows.et],
        ru: [...studentRows.ru, ["Отменён", `${dateRu(data.old?.date)} в ${data.old?.time}`], ...teacherRows.ru],
      },
      buttonPath: "/",
    };
  }
  if (type === "newSchedule") {
    const teachers = (data.teachers || []).join(", ");
    return {
      vars: { õpilane: student, algus: shortDate(data.start), õpetaja: teachers },
      rows: {
        et: [...studentRows.et, ...(data.weekly || []).map((item) => ["Iga nädal", weeklyLine(item, "et")]), ...(data.singles || []).map((item) => ["Lisatund", `${dateEt(item.date)} kell ${item.time}`]), ["Algus", dateEt(data.start)], ...(teachers ? [["Õpetaja", teachers]] : []), ...(data.siteAddress && (data.weekly || []).some((item) => !item.online) ? [["Aadress", data.siteAddress]] : [])],
        ru: [...studentRows.ru, ...(data.weekly || []).map((item) => ["Еженедельно", weeklyLine(item, "ru")]), ...(data.singles || []).map((item) => ["Доп. урок", `${dateRu(item.date)} в ${item.time}`]), ["Начало", dateRu(data.start)], ...(teachers ? [["Учитель", teachers]] : []), ...(data.siteAddress && (data.weekly || []).some((item) => !item.online) ? [["Адрес", data.siteAddress]] : [])],
      },
      buttonPath: "/",
    };
  }
  if (type === "homeworkDue") {
    const task = clean(data.task, 1500);
    return {
      vars: { õpilane: student, tähtaeg: shortDate(data.due), ülesanne: clean(task, 80), õpetaja: teacher },
      rows: { et: [...studentRows.et, ["Tähtaeg", dateEt(data.due)], ...teacherRows.et], ru: [...studentRows.ru, ["Срок", dateRu(data.due)], ...teacherRows.ru] },
      block: task,
      buttonPath: "/homework",
    };
  }
  if (type === "homeworkChecked") {
    const grade = data.grade === null || data.grade === undefined || data.grade === "" ? "" : String(data.grade);
    const feedback = clean(data.feedback, 1200);
    return {
      vars: { õpilane: student, töö: clean(data.title, 120), hinne: grade, õpetaja: teacher },
      rows: {
        et: [...studentRows.et, ["Töö", clean(data.title, 160)], ...(grade ? [["Hinne", `${grade} / 5`]] : []), ...teacherRows.et],
        ru: [...studentRows.ru, ["Работа", clean(data.title, 160)], ...(grade ? [["Оценка", `${grade} / 5`]] : []), ...teacherRows.ru],
      },
      block: feedback,
      buttonPath: "/homework",
    };
  }
  if (type === "announcement") {
    return {
      vars: { pealkiri: clean(data.title, 160) },
      rows: { et: [...studentRows.et], ru: [...studentRows.ru] },
      blockTitle: clean(data.title, 160),
      block: clean(data.body, 5000),
      buttonPath: "/",
    };
  }
  throw new Error(`unknown e-mail type ${type}`);
}

const BUTTON = { et: "Ava KeeleSepp", ru: "Открыть KeeleSepp" };

function rowsHtml(rows) {
  if (!rows.length) return "";
  return `<table style="border-collapse:collapse;margin:8px 0 14px">${rows.map(([label, value]) => `<tr><td style="padding:3px 14px 3px 0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:3px 0;font-weight:600">${esc(value)}</td></tr>`).join("")}</table>`;
}

// one e-mail → { subject, text, html, headers }
function composeLearnerEmail(type, data = {}, { settings = normalizeSettings({}), language = "both", prefsUrl = "", oneClickUrl = "" } = {}) {
  const texts = textsFor(settings, type);
  const content = contentFor(type, data, { siteAddress: settings.siteAddress });
  const langs = language === "et" ? ["et"] : language === "ru" ? ["ru"] : ["et", "ru"];
  const subjectOf = (lang) => fill(lang === "et" ? texts.subjectEt : texts.subjectRu, content.vars);
  const introOf = (lang) => fill(lang === "et" ? texts.introEt : texts.introRu, content.vars);
  const subject = langs.map(subjectOf).join(" / ").slice(0, 250);
  const url = `${CRM_URL}${content.buttonPath || "/"}`;
  const block = clean(content.block, 5000);
  const blockHtml = block || content.blockTitle
    ? `<div style="white-space:pre-line;padding:10px 12px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb;margin:4px 0 14px">${content.blockTitle ? `<strong>${esc(content.blockTitle)}</strong>\n` : ""}${esc(block)}</div>`
    : "";
  const sections = langs.map((lang, index) => `<div lang="${lang}" style="${index ? "border-top:1px solid #e5e7eb;padding-top:12px;margin-top:6px;color:#334155" : ""}"><p style="margin:0 0 6px">${esc(introOf(lang))}</p>${rowsHtml(content.rows[lang])}</div>`);
  const footerPrefs = prefsUrl
    ? `<br><a href="${esc(prefsUrl)}" style="color:#64748b">${langs.map((lang) => (lang === "et" ? "Loobu neist kirjadest või vali keel" : "Отписаться или выбрать язык")).join(" / ")}</a>`
    : "";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1C2B3A;line-height:1.5;max-width:620px">
  ${sections[0]}${block || content.blockTitle ? blockHtml : ""}${sections.slice(1).join("")}
  <p style="margin:16px 0"><a href="${esc(url)}" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700">${esc(langs.map((lang) => BUTTON[lang]).join(" / "))}</a></p>
  <p style="font-size:12px;color:#64748b;margin-top:18px">KeeleSepp · E&amp;P Koolitus OÜ · info@epkoolitus.ee · +372 5434 4155${footerPrefs}</p>
</div>`;
  const textRows = (lang) => content.rows[lang].map(([label, value]) => `${label}: ${value}`);
  const text = [
    ...langs.flatMap((lang, index) => [introOf(lang), ...textRows(lang), ...(index === 0 && (block || content.blockTitle) ? ["", [content.blockTitle, block].filter(Boolean).join("\n")] : []), ""]),
    `${langs.map((lang) => BUTTON[lang]).join(" / ")}: ${url}`,
    "",
    "KeeleSepp · info@epkoolitus.ee · +372 5434 4155",
    ...(prefsUrl ? [`${langs.map((lang) => (lang === "et" ? "Loobu või vali keel" : "Отписаться или выбрать язык")).join(" / ")}: ${prefsUrl}`] : []),
  ].join("\n");
  const headers = oneClickUrl ? { "List-Unsubscribe": `<${oneClickUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  return { subject, text, html, ...(headers ? { headers } : {}) };
}

// sample data for the Seaded preview and the admin's test e-mail
function sampleData(type) {
  const tomorrow = addDays(tallinnParts(new Date()).date, 1);
  const lesson = { studentName: "Mari Maasikas", teacher: "Kati Kask", subject: "Eesti keel", online: false, roomName: "2" };
  return {
    lessonReminder: { ...lesson, date: tomorrow, time: "16:00", duration: 60 },
    lessonMoved: { ...lesson, old: { date: tomorrow, time: "16:00" }, next: { date: addDays(tomorrow, 1), time: "15:00" } },
    lessonCancelled: { ...lesson, old: { date: tomorrow, time: "16:00" } },
    newSchedule: { studentName: lesson.studentName, start: tomorrow, teachers: ["Kati Kask"], weekly: [{ day: "Mon", time: "16:00", duration: 60, teacher: "Kati Kask", subject: "Eesti keel", online: false, roomName: "2" }, { day: "Thu", time: "17:00", duration: 45, teacher: "Kati Kask", subject: "Eesti keel", online: true }], singles: [] },
    homeworkDue: { studentName: lesson.studentName, teacher: lesson.teacher, due: tomorrow, task: "Loe tekst lk 24 ja kirjuta 5 lauset minevikus." },
    homeworkChecked: { studentName: lesson.studentName, teacher: lesson.teacher, title: "Tund 12 · Harjuta", grade: 5, feedback: "Väga hea! Vaata veel kord osastavat käänet." },
    announcement: { studentName: lesson.studentName, title: "Koolivaheaeg", body: "Koolivaheajal 26.–30.10 tunde ei toimu. / На каникулах 26–30.10 уроков нет." },
  }[type];
}

module.exports = {
  CRM_URL, TYPES, TEXT_FIELDS, DEFAULT_TEXTS, PLACEHOLDERS, DEFAULT_DAILY_HOUR, CHANGE_SETTLE_MINUTES, PLANNER_QUIET_MINUTES,
  REVIEW_SETTLE_MINUTES, MAX_MESSAGES_PER_TICK, SEND_PAUSE_MS, MAX_ATTEMPTS, LAST_DAILY_HOUR,
  normalizeSettings, anyEnabled, fill, textsFor,
  tallinnParts, addDays, dayIdOf, dailyRunDue, shortDate, dateEt, dateRu,
  occursOn, occurrenceStatusOf, groupEvents, lessonOccurrencesOn, jobKey,
  homeworkDueOn, firstReview,
  scheduleChangeNotices, resolveLessonChange, plannerBatchSummary,
  studentAccountIds, parentAccountIds, cardRecipients, languageFor, emailHash, liveCard,
  preferenceToken, verifyPreferenceToken, maskEmail, preferencesUrl,
  contentFor, composeLearnerEmail, sampleData, normEmail, validEmail,
};
