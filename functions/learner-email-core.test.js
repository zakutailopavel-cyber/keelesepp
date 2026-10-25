"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./learner-email-core");

const TODAY = "2026-10-24";

test("settings: every type is off by default, the hour is clamped, texts fall back to the defaults", () => {
  const settings = core.normalizeSettings({});
  assert.deepEqual(core.TYPES.filter((type) => settings.types[type].enabled), []);
  assert.equal(core.anyEnabled(settings), false);
  assert.equal(settings.dailyHour, 17);
  assert.equal(core.normalizeSettings({ dailyHour: 3 }).dailyHour, 17, "never at night");
  assert.equal(core.normalizeSettings({ dailyHour: 22 }).dailyHour, 17);
  assert.equal(core.normalizeSettings({ dailyHour: 8 }).dailyHour, 8);
  const on = core.normalizeSettings({ types: { lessonReminder: { enabled: true, subjectEt: "Homme {kell}" }, junk: { enabled: true } } });
  assert.equal(on.types.lessonReminder.enabled, true);
  assert.equal(on.types.junk, undefined);
  assert.equal(core.textsFor(on, "lessonReminder").subjectEt, "Homme {kell}");
  assert.equal(core.textsFor(on, "lessonReminder").subjectRu, core.DEFAULT_TEXTS.lessonReminder.subjectRu);
});

test("placeholders are filled; unknown ones and empty brackets disappear", () => {
  assert.equal(core.fill("Homme kell {kell}: tund ({õpilane})", { kell: "16:00", õpilane: "Mari" }), "Homme kell 16:00: tund (Mari)");
  assert.equal(core.fill("Tund ({õpilane}) {tundmatu}", {}), "Tund");
  assert.equal(core.fill("Uus aeg {uus_kuupäev}", { uus_kuupäev: "26.10.2026" }), "Uus aeg 26.10.2026");
});

test("Tallinn time across the DST change on 25.10.2026 (EEST +3 → EET +2)", () => {
  assert.deepEqual(core.tallinnParts(new Date("2026-10-24T14:00:00Z")), { date: "2026-10-24", hour: 17, minute: 0 });
  assert.deepEqual(core.tallinnParts(new Date("2026-10-25T15:00:00Z")), { date: "2026-10-25", hour: 17, minute: 0 });
  assert.equal(core.tallinnParts(new Date("2026-10-25T14:00:00Z")).hour, 16, "after the change 14:00 UTC is 16:00");
  assert.equal(core.tallinnParts(new Date("2026-10-25T00:30:00Z")).hour, 3, "03:30 summer time");
  assert.equal(core.tallinnParts(new Date("2026-10-25T01:30:00Z")).hour, 3, "03:30 winter time (the hour repeats)");
  assert.equal(core.tallinnParts(new Date("2026-10-24T21:30:00Z")).date, "2026-10-25", "00:30 local is already the next day");
  assert.equal(core.addDays("2026-10-24", 1), "2026-10-25");
  assert.equal(core.addDays("2026-10-25", 1), "2026-10-26", "the 25-hour day does not skip a date");
  assert.equal(core.dayIdOf("2026-10-25"), "Sun");
});

test("the daily run is due once a day from the chosen hour, never after 21:59", () => {
  const at = (iso, lastRunDate = "") => core.dailyRunDue({ now: new Date(iso), hour: 17, lastRunDate });
  assert.equal(at("2026-10-24T13:59:00Z").due, false, "16:59");
  assert.deepEqual(at("2026-10-24T14:00:00Z"), { due: true, today: "2026-10-24", tomorrow: "2026-10-25" });
  assert.equal(at("2026-10-24T14:05:00Z", "2026-10-24").due, false, "already ran today");
  assert.equal(at("2026-10-24T19:00:00Z").due, false, "22:00 is too late");
  assert.equal(at("2026-10-25T14:00:00Z", "2026-10-24").due, false, "16:00 on the winter-time day");
  assert.deepEqual(at("2026-10-25T15:00:00Z", "2026-10-24"), { due: true, today: "2026-10-25", tomorrow: "2026-10-26" });
});

test("lessons tomorrow: weekly series expanded like the calendar; cancelled, moved and ended ones left out", () => {
  const schedules = [
    { id: "weekly-sun", studentId: "s1", recurring: true, startDate: "2026-09-06", day: "Sun", time: "10:00", teacher: "Kati", teacherFull: "Kati Kask", online: true },
    { id: "weekly-excluded", studentId: "s2", recurring: true, startDate: "2026-09-06", day: "Sun", time: "11:00", excludedDates: ["2026-10-25"] },
    { id: "weekly-cancelled-day", studentId: "s3", recurring: true, startDate: "2026-09-06", day: "Sun", time: "12:00", occurrenceStatuses: { "2026-10-25": { status: "Tühistatud" } } },
    { id: "weekly-ended", studentId: "s4", recurring: true, startDate: "2026-09-06", endDate: "2026-10-18", day: "Sun", time: "13:00" },
    { id: "weekly-mon", studentId: "s5", recurring: true, startDate: "2026-09-07", day: "Mon", time: "13:00" },
    { id: "moved-child", studentId: "s2", recurring: false, date: "2026-10-25", time: "15:00", movedFromSeriesId: "weekly-excluded", movedFromDate: "2026-10-25", roomName: "2" },
    { id: "single-cancelled", studentId: "s6", recurring: false, date: "2026-10-25", time: "09:00", status: "Tühistatud" },
    { id: "no-student", recurring: false, date: "2026-10-25", time: "09:00" },
    { id: "draft", studentId: "s7", recurring: false, date: "2026-10-25", time: "09:00", draft: true },
    { id: "series-starts-later", studentId: "s8", recurring: true, startDate: "2026-11-01", day: "Sun", time: "09:00" },
  ];
  const groups = [{ id: "g1", name: "A2 grupp", teacher: "Kati", students: ["s9", "s10"], studentLessonMap: { s10: ["other"] }, lessons: [{ id: "l1", day: "Sun", time: "18:00", recurring: true, startDate: "2026-10-04" }] }];
  const list = core.lessonOccurrencesOn(schedules, groups, "2026-10-25");
  assert.deepEqual(list.map((item) => `${item.scheduleId}/${item.studentId}`), ["weekly-sun/s1", "moved-child/s2", "group:g1:l1/s9"]);
  assert.equal(list[0].jobId, "lessonReminder__weekly-sun__2026-10-25__s1");
  assert.equal(list[0].teacher, "Kati Kask");
  assert.equal(list[0].online, true);
  assert.equal(list[1].roomName, "2");
});

test("homework due tomorrow: open tasks only", () => {
  const list = core.homeworkDueOn([
    { id: "h1", studentId: "s1", due: "2026-10-25", task: "Loe tekst", status: "Antud" },
    { id: "h2", studentId: "s1", due: "2026-10-25", task: "Tehtud juba", status: "Tehtud" },
    { id: "h3", studentId: "s1", due: "2026-10-25", task: "Suletud", status: "Suletud" },
    { id: "h4", studentId: "s1", due: "2026-10-26", task: "Ülehomme" },
    { id: "h5", studentId: "s1", due: "2026-10-25", task: "Vaikne", notify: false },
    { id: "h6", due: "2026-10-25", task: "Kaardita" },
  ], "2026-10-25");
  assert.deepEqual(list, [{ jobId: "homeworkDue__h1__2026-10-25", homeworkId: "h1", studentId: "s1", due: "2026-10-25" }]);
});

test("homework checked: only the first review counts", () => {
  assert.equal(core.firstReview({ reviewStatus: "pending" }, { studentId: "s1", reviewStatus: "reviewed" }), true);
  assert.equal(core.firstReview({}, { studentId: "s1", reviewStatus: "reviewed" }), true);
  assert.equal(core.firstReview({ reviewStatus: "reviewed" }, { studentId: "s1", reviewStatus: "reviewed", teacherGrade: 4 }), false, "an edited review is not a second e-mail");
  assert.equal(core.firstReview({ reviewedAt: "2026-10-01" }, { studentId: "s1", reviewStatus: "reviewed" }), false);
  assert.equal(core.firstReview({ reviewStatus: "pending" }, { studentId: "s1", reviewStatus: "pending", seenByTeacher: true }), false);
});

test("lesson changes by staff: a one-off lesson moved or cancelled", () => {
  const before = { studentId: "s1", recurring: false, date: "2026-10-27", time: "16:00", duration: 60, status: "Planeeritud" };
  const moved = core.scheduleChangeNotices("x1", before, { ...before, date: "2026-10-28", time: "15:00" }, { today: TODAY });
  assert.deepEqual(moved, [{ jobId: "lessonChange__x1", scope: "single", scheduleId: "x1", studentId: "s1", old: { date: "2026-10-27", time: "16:00", duration: 60 } }]);
  assert.equal(core.scheduleChangeNotices("x1", before, { ...before, status: "Tühistatud" }, { today: TODAY }).length, 1);
  assert.equal(core.scheduleChangeNotices("x1", before, { ...before, duration: 90 }, { today: TODAY }).length, 0, "only the length changed");
  assert.equal(core.scheduleChangeNotices("x1", before, { ...before, status: "Toimunud" }, { today: TODAY }).length, 0, "marking held");
  assert.equal(core.scheduleChangeNotices("x1", { ...before, date: "2026-10-20" }, { ...before, date: "2026-10-21" }, { today: TODAY }).length, 0, "past lesson fixed");
  assert.equal(core.scheduleChangeNotices("x1", before, null, { today: TODAY }).length, 0, "a deleted one-off lesson is a mistake removed");
  assert.equal(core.scheduleChangeNotices("x1", null, { ...before }, { today: TODAY }).length, 0, "a new lesson is not a change");
  assert.equal(core.scheduleChangeNotices("x1", before, { ...before, date: "2026-10-28", plannerBatchId: "b1" }, { today: TODAY }).length, 0, "planner owns it");
  assert.equal(core.scheduleChangeNotices("x1", { ...before, studentId: "" }, { ...before, studentId: "", date: "2026-10-28" }, { today: TODAY }).length, 0);
});

test("lesson changes by staff: one occurrence of a weekly series, and the series itself", () => {
  const series = { studentId: "s1", recurring: true, startDate: "2026-09-07", day: "Mon", time: "16:00", duration: 60, excludedDates: ["2026-10-19"] };
  const one = core.scheduleChangeNotices("ser", series, { ...series, excludedDates: ["2026-10-19", "2026-10-26"] }, { today: TODAY });
  assert.deepEqual(one, [{ jobId: "lessonChange__ser__2026-10-26", scope: "occurrence", scheduleId: "ser", date: "2026-10-26", studentId: "s1", old: { date: "2026-10-26", time: "16:00", duration: 60 } }]);
  assert.equal(core.scheduleChangeNotices("ser", series, { ...series, excludedDates: ["2026-10-19", "2026-10-27"] }, { today: TODAY }).length, 0, "a Tuesday is not a lesson day");
  assert.equal(core.scheduleChangeNotices("ser", series, { ...series, occurrenceStatuses: { "2026-11-02": { status: "Tühistatud" } } }, { today: TODAY }).length, 1);
  const whole = core.scheduleChangeNotices("ser", series, { ...series, day: "Tue", time: "17:00", startDate: "2026-10-27" }, { today: TODAY });
  assert.deepEqual(whole.map((item) => item.scope), ["series"]);
  assert.deepEqual(whole[0].old, { day: "Mon", time: "16:00" });
  assert.equal(core.scheduleChangeNotices("ser", series, { ...series, endDate: "2026-10-31" }, { today: TODAY }).length, 0, "ending a series is silent");
  const continuing = core.scheduleChangeNotices("ser2", null, { ...series, startDate: "2026-11-03", day: "Tue", continuesSeriesId: "ser" }, { today: TODAY });
  assert.deepEqual(continuing, [{ jobId: "lessonChange__series__ser2", scope: "series", scheduleId: "ser2", parentId: "ser", studentId: "s1", from: "2026-11-03" }]);
});

test("at send time: undo, moved occurrence, cancellation and series move are resolved from the data as it is now", () => {
  const old = { date: "2026-10-26", time: "16:00", duration: 60 };
  const single = { scope: "single", scheduleId: "x1", old };
  assert.deepEqual(core.resolveLessonChange(single, { current: { date: "2026-10-26", time: "16:00" }, today: TODAY }), { skip: "unchanged" }, "undo inside the window");
  assert.equal(core.resolveLessonChange(single, { current: { date: "2026-10-27", time: "15:00" }, today: TODAY }).type, "lessonMoved");
  assert.equal(core.resolveLessonChange(single, { current: { date: "2026-10-26", time: "16:00", status: "Tühistatud" }, today: TODAY }).type, "lessonCancelled");
  assert.deepEqual(core.resolveLessonChange(single, { current: null, today: TODAY }), { skip: "deleted" });

  const occurrence = { scope: "occurrence", scheduleId: "ser", date: "2026-10-26", old };
  const parent = { recurring: true, day: "Mon", time: "16:00", excludedDates: ["2026-10-26"] };
  assert.deepEqual(core.resolveLessonChange(occurrence, { current: { ...parent, excludedDates: [] }, today: TODAY }), { skip: "restored" });
  const movedTo = core.resolveLessonChange(occurrence, { current: parent, children: [{ date: "2026-10-28", time: "17:00", status: "Planeeritud" }], today: TODAY });
  assert.equal(movedTo.type, "lessonMoved");
  assert.deepEqual(movedTo.next, { date: "2026-10-28", time: "17:00", duration: 60 });
  assert.equal(core.resolveLessonChange(occurrence, { current: parent, children: [], today: TODAY }).type, "lessonCancelled");
  assert.equal(core.resolveLessonChange(occurrence, { current: parent, children: [{ date: "2026-10-28", time: "17:00", status: "Tühistatud" }], today: TODAY }).type, "lessonCancelled");

  const series = { scope: "series", scheduleId: "ser", old: { day: "Mon", time: "16:00" } };
  const moved = core.resolveLessonChange(series, { current: { recurring: true, day: "Tue", time: "17:00", startDate: "2026-10-27" }, today: TODAY });
  assert.equal(moved.type, "lessonMoved");
  assert.equal(moved.series, true);
  assert.equal(moved.from, "2026-10-27");
  assert.deepEqual(core.resolveLessonChange(series, { current: { recurring: true, day: "Mon", time: "16:00", startDate: "2026-09-07" }, today: TODAY }), { skip: "unchanged" });
  const continuing = core.resolveLessonChange({ scope: "series", scheduleId: "ser2", parentId: "ser" }, { current: { recurring: true, day: "Tue", time: "17:00", startDate: "2026-11-03" }, parent: { day: "Mon", time: "16:00" }, today: TODAY });
  assert.deepEqual([continuing.old, continuing.next.day, continuing.from], [{ day: "Mon", time: "16:00" }, "Tue", "2026-11-03"]);
});

test("planner batch: one summary per student with weekly times, start date and teachers", () => {
  const summary = core.plannerBatchSummary([
    { studentId: "s1", plannerBatchId: "b1", recurring: true, startDate: "2026-11-05", day: "Thu", time: "17:00", duration: 45, teacher: "Kati", online: true },
    { studentId: "s1", plannerBatchId: "b1", recurring: true, startDate: "2026-11-02", day: "Mon", time: "16:00", duration: 60, teacher: "Kati", teacherFull: "Kati Kask", roomName: "2" },
    { studentId: "s2", plannerBatchId: "b1", recurring: true, startDate: "2026-11-03", day: "Tue", time: "15:00", teacher: "Jaan" },
    { studentId: "s2", plannerBatchId: "b1", recurring: true, startDate: "2026-11-03", day: "Wed", time: "15:00", teacher: "Jaan", status: "Tühistatud" },
    { studentId: "s3", plannerBatchId: "b1", recurring: true, startDate: "2026-11-03", day: "Wed", time: "15:00", draft: true },
  ], { today: TODAY });
  assert.equal(summary.length, 2);
  const s1 = summary.find((entry) => entry.studentId === "s1");
  assert.deepEqual(s1.weekly.map((item) => `${item.day} ${item.time}`), ["Mon 16:00", "Thu 17:00"], "Monday first");
  assert.equal(s1.start, "2026-11-02");
  assert.deepEqual(s1.teachers.sort(), ["Kati", "Kati Kask"]);
  assert.deepEqual(summary.find((entry) => entry.studentId === "s2").weekly.map((item) => item.day), ["Tue"]);
});

test("recipients: card + accounts + parent contacts, deduplicated, inactive cards and unusable accounts left out", () => {
  const accounts = new Map([
    ["u1", { email: "Mari@Example.com", preferredLanguage: "et" }],
    ["p1", { email: "ema@example.com", preferredLanguage: "ru" }],
    ["p2", { email: "isa@example.com", disabled: true }],
    ["p3", { email: "pending@example.com", approvalStatus: "pending" }],
  ]);
  const card = { name: "Mari", email: "mari@example.com", linkedUserId: "u1", parentEmail: "EMA@example.com", linkedParentIds: ["p1", "p2", "p3"], parentContacts: [{ email: "vanaema@example.com" }, { email: "bad" }] };
  const list = core.cardRecipients(card, accounts);
  assert.deepEqual(list.map((item) => `${item.audience}:${item.email}`), ["student:mari@example.com", "parent:ema@example.com", "parent:vanaema@example.com"]);
  assert.equal(list[0].profileLanguage, "", "the student's language is on the card, not the account");
  assert.equal(core.cardRecipients({ ...card, preferredLanguage: "ru" }, accounts)[0].profileLanguage, "ru");
  assert.equal(list[1].profileLanguage, "ru", "the parent's language is on the parent's profile");
  assert.equal(list[2].profileLanguage, "", "a contact without an account");
  assert.deepEqual(core.cardRecipients({ ...card, active: false }, accounts), []);
  assert.deepEqual(core.cardRecipients({ ...card, mergedInto: "other" }, accounts), []);
  assert.deepEqual(core.cardRecipients({ name: "Ilma e-postita" }, accounts), [], "a card without an e-mail gets nothing");
  assert.deepEqual(core.cardRecipients({ ...card, homeworkEmailOptOut: true }, accounts, { homework: true }), []);
  assert.equal(core.cardRecipients({ ...card, homeworkEmailOptOut: true }, accounts).length, 3, "the homework opt-out is for homework only");
});

test("language: the recipient's choice, else the profile, else Estonian + Russian", () => {
  assert.equal(core.languageFor({ language: "ru" }, "et"), "ru");
  assert.equal(core.languageFor({}, "et"), "et");
  assert.equal(core.languageFor({}, ""), "both");
  assert.equal(core.languageFor({ language: "xx" }, "de"), "both");
  assert.equal(core.languageFor({}, "en"), "both", "no English texts yet");
});

test("preferences token: signed per address, tamper-proof", () => {
  const token = core.preferenceToken("Mari@Example.com", "secret-key");
  assert.equal(core.verifyPreferenceToken(token, "secret-key"), "mari@example.com");
  assert.equal(core.verifyPreferenceToken(token, "other-key"), "");
  const [encoded, signature] = token.split(".");
  const forged = `${Buffer.from("ema@example.com").toString("base64url")}.${signature}`;
  assert.equal(core.verifyPreferenceToken(forged, "secret-key"), "", "another address with the same signature");
  assert.equal(core.verifyPreferenceToken(`${encoded}.x`, "secret-key"), "");
  assert.equal(core.verifyPreferenceToken("", "secret-key"), "");
  assert.equal(core.maskEmail("mari@example.com"), "ma••@example.com");
  assert.match(core.preferencesUrl(token), /^https:\/\/crm\.epkoolitus\.ee\/e-kirjad\//);
});

test("every type composes in Estonian first and Russian, HTML escaped, with the preferences link", () => {
  for (const type of core.TYPES) {
    const mail = core.composeLearnerEmail(type, core.sampleData(type), { prefsUrl: "https://crm.epkoolitus.ee/e-kirjad/t", oneClickUrl: "https://x/one-click?t=t" });
    assert.ok(mail.subject.includes(" / "), `${type}: both subjects`);
    assert.ok(mail.html.indexOf('lang="et"') < mail.html.indexOf('lang="ru"'), `${type}: Estonian first`);
    assert.ok(mail.html.includes("/e-kirjad/t") && mail.text.includes("/e-kirjad/t"), `${type}: preferences link`);
    assert.equal(mail.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
    assert.ok(!/\{[\p{L}_]+\}/u.test(mail.subject + mail.text), `${type}: no raw placeholder`);
  }
  const ru = core.composeLearnerEmail("lessonReminder", { studentName: "<b>Mari</b>", date: "2026-10-25", time: "10:00", teacher: "Kati" }, { language: "ru" });
  assert.equal(ru.subject, "Завтра в 10:00: урок (<b>Mari</b>)");
  assert.ok(!ru.html.includes('lang="et"'));
  assert.ok(ru.html.includes("&lt;b&gt;Mari&lt;/b&gt;") && !ru.html.includes("<b>Mari</b>"));
  assert.ok(ru.text.includes("воскресенье, 25.10.2026 в 10:00"));
});

test("texts: the lesson moved e-mail shows old and new time; the series move says from when", () => {
  const moved = core.composeLearnerEmail("lessonMoved", { studentName: "Mari", teacher: "Kati", old: { date: "2026-10-26", time: "16:00" }, next: { date: "2026-10-28", time: "17:00" } });
  assert.ok(moved.text.includes("Oli: esmaspäev, 26.10.2026 kell 16:00"));
  assert.ok(moved.text.includes("Uus aeg: kolmapäev, 28.10.2026 kell 17:00"));
  assert.ok(moved.text.includes("Новое время: среда, 28.10.2026 в 17:00"));
  const series = core.composeLearnerEmail("lessonMoved", { studentName: "Mari", series: true, from: "2026-10-27", old: { day: "Mon", time: "16:00" }, next: { day: "Tue", time: "17:00" } });
  assert.ok(series.text.includes("Kehtib alates: teisipäev, 27.10.2026"));
  const custom = core.normalizeSettings({ types: { lessonCancelled: { subjectEt: "Ära jääb {kuupäev} kell {kell}", subjectRu: "Отмена {kuupäev}" } } });
  assert.equal(core.composeLearnerEmail("lessonCancelled", { studentName: "Mari", old: { date: "2026-10-26", time: "16:00" } }, { settings: custom }).subject, "Ära jääb 26.10.2026 kell 16:00 / Отмена 26.10.2026");
  const online = core.composeLearnerEmail("lessonReminder", { date: "2026-10-25", time: "10:00", lesson: { online: true } }, { language: "et" });
  assert.ok(online.text.includes("Koht: veebitund"));
  const room = core.composeLearnerEmail("lessonReminder", { date: "2026-10-25", time: "10:00", lesson: { roomName: "3" } }, { language: "et", settings: core.normalizeSettings({ siteAddress: "Pärnu mnt 10, Tallinn" }) });
  assert.ok(room.text.includes("Koht: kabinet 3, Pärnu mnt 10, Tallinn"));
  const schedule = core.composeLearnerEmail("newSchedule", core.sampleData("newSchedule"), { language: "ru" });
  assert.ok(schedule.text.includes("по понедельникам в 16:00"));
});
