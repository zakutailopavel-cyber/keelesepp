"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const core = require("./teacher-unmarked-digest-core");
const { createTeacherDigestService, envDryRun } = require("./teacher-unmarked-digest-service");

const TODAY = "2026-11-09"; // a Monday

test("ISO week ids, also across a year", () => {
  assert.equal(core.isoWeekId("2026-11-09"), "2026-W46");
  assert.equal(core.isoWeekId("2026-11-15"), "2026-W46"); // Sunday, same week
  assert.equal(core.isoWeekId("2026-11-16"), "2026-W47");
  assert.equal(core.isoWeekId("2027-01-01"), "2026-W53");
  assert.equal(core.isoWeekId("2026-01-01"), "2026-W01");
  assert.equal(core.isoWeekId("2024-12-30"), "2025-W01");
  assert.equal(core.tallinnDate(new Date("2026-11-08T22:30:00Z")), "2026-11-09"); // 00:30 in Tallinn
});

// ── the set: past, unmarked, window ───────────────────────────────────────────────────────────────────────────────

const weekly = { id: "w1", recurring: true, startDate: "2026-09-07", day: "Mon", time: "16:00", studentId: "s1", studentName: "Mari Maasikas", teacherUid: "t1", teacher: "Kati Kask", subject: "Eesti keel" };

test("past unmarked occurrences: today and the future do not count, marked ones do not", () => {
  const schedule = [
    weekly,
    { id: "one", date: "2026-11-05", time: "10:00", studentId: "s2", teacherUid: "t1" },
    { id: "future", date: "2026-11-12", time: "10:00", studentId: "s2", teacherUid: "t1" },
    { id: "today", date: TODAY, time: "08:00", studentId: "s2", teacherUid: "t1" },
    { id: "cancelled", date: "2026-11-04", time: "10:00", studentId: "s2", teacherUid: "t1", status: "Tühistatud" },
    { id: "group", date: "2026-11-04", time: "10:00", isGroup: true, studentId: "s3", teacherUid: "t1" },
    { id: "held", date: "2026-11-03", time: "12:00", studentId: "s4", teacherUid: "t1", status: "Toimunud" },
  ];
  const lessons = [
    { id: "L1", scheduleId: "w1", date: "2026-11-02" }, // linked mark
    { id: "L2", studentId: "s1", teacherUid: "t1", date: "2026-10-26", time: "16:05" }, // old mark at the same time
  ];
  const items = core.unmarkedOccurrences({ schedule, lessons, today: TODAY, days: 60 });
  const ids = items.map((item) => item.occurrenceId);
  assert.ok(ids.includes("one:2026-11-05"));
  assert.ok(!ids.includes("future:2026-11-12"));
  assert.ok(!ids.includes("today:2026-11-09"));
  assert.ok(!ids.includes("w1:2026-11-09"), "today's weekly lesson is not past yet");
  assert.ok(!ids.includes("w1:2026-11-02"), "linked mark");
  assert.ok(!ids.includes("w1:2026-10-26"), "a record of the same student and teacher within 15 min");
  assert.ok(ids.includes("w1:2026-10-19"));
  assert.ok(ids.includes("w1:2026-09-14"));
  assert.ok(!ids.includes("w1:2026-09-07"), "older than the window");
  assert.ok(!ids.some((id) => id.startsWith("cancelled") || id.startsWith("group") || id.startsWith("held")));
  assert.ok(items.every((item, index) => !index || items[index - 1].occurrenceDate >= item.occurrenceDate), "newest first");
});

test("the same set as the CRM page (crm-v2 findUnmarkedLessons)", async () => {
  const modulePath = pathToFileURL(path.join(__dirname, "../crm-v2/src/features/calendar/unmarkedLessons.js")).href;
  const crm = await import(modulePath);
  // deterministic pseudo-random calendar
  let seed = 7;
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const schedule = [];
  const lessons = [];
  for (let index = 0; index < 120; index++) {
    const recurring = rand() < 0.5;
    const offset = Math.floor(rand() * 90);
    const date = core.addDays(TODAY, -offset);
    const event = {
      id: `e${index}`, studentId: `s${Math.floor(rand() * 15)}`, teacherUid: pick(["t1", "t2", ""]), time: `${String(8 + Math.floor(rand() * 10)).padStart(2, "0")}:${pick(["00", "30"])}`,
      status: pick(["Planeeritud", "Planeeritud", "Planeeritud", "Toimunud", "Tühistatud", undefined]),
      isGroup: rand() < 0.05,
      ...(recurring ? { recurring: true, startDate: date, day: pick(days), ...(rand() < 0.3 ? { endDate: core.addDays(date, 40) } : {}), ...(rand() < 0.3 ? { excludedDates: [core.addDays(date, 7)] } : {}) } : { date }),
    };
    if (event.status === undefined) delete event.status;
    if (recurring && rand() < 0.2) event.occurrenceStatuses = { [core.addDays(date, 14)]: { status: "Puudus_p" } };
    schedule.push(event);
    if (rand() < 0.4) lessons.push({ id: `l${index}`, scheduleId: event.id, date: core.addDays(TODAY, -Math.floor(rand() * 60)) });
    if (rand() < 0.3) lessons.push({ id: `m${index}`, studentId: event.studentId, teacherUid: pick([event.teacherUid, "t9"]), date: core.addDays(TODAY, -Math.floor(rand() * 60)), time: pick([event.time, "", "07:00"]) });
  }
  const crmSchedule = schedule.map((event) => ({ status: "Planeeritud", duration: 60, ...event }));
  for (const window of [60, 365]) {
    const ours = core.unmarkedOccurrences({ schedule, lessons, today: TODAY, days: window }).map((item) => item.occurrenceId).sort();
    const theirs = crm.findUnmarkedLessons({ schedule: crmSchedule, lessons, sessions: [], today: TODAY, days: window }).map((item) => item.occurrenceId).sort();
    assert.ok(theirs.length > 10, "the fixture has unmarked lessons");
    assert.deepEqual(ours, theirs, `same set for ${window} days`);
  }
});

// ── recipients ────────────────────────────────────────────────────────────────────────────────────────────────────

test("recipients: teachers only, verified address, not disabled / trashed", () => {
  const users = [
    { id: "t1", role: "teacher", email: "Kati@Kool.ee", displayName: "Kati Kask" },
    { id: "t2", role: "teacher", email: "unverified@kool.ee", displayName: "Tiit" },
    { id: "t3", role: "teacher", email: "off@kool.ee", disabled: true },
    { id: "t4", role: "teacher", email: "gone@kool.ee", deletedAt: "2026-11-01" },
    { id: "a1", role: "admin", email: "boss@kool.ee" },
    { id: "a2", role: "admin", email: "teaching-boss@kool.ee", displayName: "Pavel" },
    { id: "s1", role: "student", email: "student@kool.ee" },
    { id: "p1", role: "parent", email: "parent@kool.ee" },
    { id: "t5", role: "teacher", email: "doc@kool.ee" }, // Auth address differs
    { id: "t6", role: "teacher", email: "pending@kool.ee", approvalStatus: "pending" },
  ];
  const auth = new Map([
    ["t1", { email: "kati@kool.ee", emailVerified: true }],
    ["t2", { email: "unverified@kool.ee", emailVerified: false }],
    ["t3", { email: "off@kool.ee", emailVerified: true }],
    ["t4", { email: "gone@kool.ee", emailVerified: true }],
    ["a1", { email: "boss@kool.ee", emailVerified: true, customClaims: { roles: ["admin"] } }],
    ["a2", { email: "teaching-boss@kool.ee", emailVerified: true, customClaims: { roles: ["admin", "teacher"] } }],
    ["s1", { email: "student@kool.ee", emailVerified: true, customClaims: { role: "teacher" } }],
    ["p1", { email: "parent@kool.ee", emailVerified: true }],
    ["t5", { email: "other@kool.ee", emailVerified: true }],
    ["t6", { email: "pending@kool.ee", emailVerified: true }],
  ]);
  const teachers = core.digestTeachers(users, auth);
  assert.deepEqual(teachers.map((item) => item.uid), ["t1", "t2", "a2", "t5"]);
  assert.equal(teachers.find((item) => item.uid === "t1").email, "kati@kool.ee");
  assert.equal(teachers.find((item) => item.uid === "t2").email, "", "unverified: bell only, no e-mail");
  assert.equal(teachers.find((item) => item.uid === "t5").email, "", "address must be the Auth account's");
  assert.ok(!teachers.some((item) => ["s1", "p1"].includes(item.uid)), "never a learner or parent, whatever the claims");
});

test("lessons are the teacher's by uid, an entry without uid by the teacher's name", () => {
  const items = [
    { occurrenceId: "a", teacherUid: "t1", teacher: "Someone" },
    { occurrenceId: "b", teacherUid: "", teacher: "Kati Kask" },
    { occurrenceId: "c", teacherUid: "t2", teacher: "Kati Kask" },
    { occurrenceId: "d", teacher: "elena" },
    { occurrenceId: "e" },
  ];
  assert.deepEqual(core.lessonsOfTeacher(items, { uid: "t1", name: "Kati Kask" }).map((item) => item.occurrenceId), ["a", "b"]);
  assert.deepEqual(core.lessonsOfTeacher(items, { uid: "t9", name: "Elena Zakutailo" }).map((item) => item.occurrenceId), ["d"]);
});

// ── which lessons count (owner 2026-11-09: from 01.11.2026, active cards, with a teacher, open periods) ─────────────

function itemsFor(count, { from = 1, step = 1, time = "10:00" } = {}) {
  return Array.from({ length: count }, (_, index) => ({ occurrenceId: `x${index}`, occurrenceDate: core.addDays(TODAY, -(from + Math.floor(index / step))), time, studentId: "s1", teacherUid: "t1" }));
}

test("countable: fixed cutoff 2026-11-01 up to yesterday, active cards only, a teacher, no closed day", () => {
  const students = new Map([
    ["s1", { name: "Mari", active: true }],
    ["s2", { name: "Ended", active: false }],
    ["s3", { name: "Trashed", deletedAt: "2026-11-02" }],
    ["s4", { name: "Merged", mergedIntoStudentId: "s1" }],
  ]);
  const item = (id, date, extra = {}) => ({ occurrenceId: id, occurrenceDate: date, studentId: "s1", teacherUid: "t1", ...extra });
  const items = [
    item("in-first", "2026-11-01"),
    item("in-last", "2026-11-08"),
    item("before-cutoff", "2026-10-31"),
    item("today", TODAY),
    item("inactive", "2026-11-03", { studentId: "s2" }),
    item("trashed", "2026-11-03", { studentId: "s3" }),
    item("merged", "2026-11-03", { studentId: "s4" }),
    item("unknown-card", "2026-11-03", { studentId: "nobody" }),
    item("no-teacher", "2026-11-03", { teacherUid: "", teacher: "" }),
    item("name-only", "2026-11-04", { teacherUid: "", teacher: "Kati Kask" }),
    item("closed-day", "2026-11-05"),
  ];
  const ids = core.countableUnmarked(items, { today: TODAY, students, lockedDates: new Set(["2026-11-05"]) }).map((entry) => entry.occurrenceId);
  assert.deepEqual(ids, ["in-first", "in-last", "name-only"]);
  assert.equal(core.CUTOFF_DATE, "2026-11-01");
  assert.equal(core.daysSinceCutoff(TODAY), 8);
  assert.equal(core.daysSinceCutoff("2026-10-20"), 0);
});

// ── digest: grouping, caps ────────────────────────────────────────────────────────────────────────────────────────

test("digest: grouped by date, newest first, at most 30 rows", () => {
  const recent = itemsFor(40, { step: 2 }); // 2 a day
  recent.forEach((entry, index) => { entry.time = index % 2 ? "09:00" : "15:00"; });
  const students = new Map([["s1", { name: "Mari Maasikas", enrollments: [{ subject: "Eesti keel", teacherUid: "t1" }] }]]);
  const digest = core.buildDigest(recent, { students });
  assert.equal(digest.total, 40);
  assert.equal(digest.older, undefined, "older ones are not counted");
  assert.equal(digest.shown, 30);
  assert.equal(digest.more, 10);
  assert.equal(digest.days.length, 15);
  assert.equal(digest.days[0].date, "2026-11-08", "newest day first");
  assert.equal(digest.days[0].label, "pühapäev 08.11.2026");
  assert.deepEqual(digest.days[0].rows.map((row) => row.time), ["09:00", "15:00"], "rows by time inside a day");
  assert.deepEqual(digest.days[0].rows[0], { time: "09:00", name: "Mari Maasikas", subject: "Eesti keel" });
  assert.equal(core.buildDigest([]).total, 0);
});

// ── the e-mail ────────────────────────────────────────────────────────────────────────────────────────────────────

test("e-mail: subject, rows, more, one button, Russian line, no older line, nothing private, escaped", () => {
  const students = new Map([["s1", { name: "Mari <b>Maasikas</b>", subject: "Eesti keel", email: "mari@kool.ee", parentEmail: "ema@kool.ee", price: 25 }]]);
  const digest = core.buildDigest(itemsFor(33), { students });
  const mail = core.composeDigestEmail({ teacher: { name: "Kati Kask" }, digest });
  assert.equal(mail.subject, "Märkimata tunnid: 33");
  assert.match(mail.html, /Tere, Kati!/);
  assert.match(mail.text, /Sul on alates 01\.11\.2026 33 tundi, millel pole märget/);
  assert.match(mail.html, /Mari &lt;b&gt;Maasikas&lt;\/b&gt;/);
  assert.ok(!mail.html.includes("<b>Maasikas"));
  assert.match(mail.html, /… ja veel 3/);
  assert.ok(!/Lisaks|vanem/.test(mail.text), "no older-lessons line");
  assert.equal((mail.html.match(/href="https:\/\/crm\.epkoolitus\.ee\/calendar\/markimata"/g) || []).length, 1, "one button");
  assert.equal((mail.html.match(/<a /g) || []).length, 1, "no other links");
  assert.match(mail.html, /lang="ru"/);
  // phones: fluid up to 600 px, fixed table, wrapping text, no nowrap columns
  assert.match(mail.html, /^<div style="[^"]*width:100%;max-width:600px/);
  assert.match(mail.html, /table-layout:fixed/);
  assert.ok(!mail.html.includes("white-space:nowrap"));
  assert.equal((mail.html.match(/<p[^>]*overflow-wrap:break-word/g) || []).length, (mail.html.match(/<p[ >]/g) || []).length, "every paragraph wraps");
  assert.match(mail.text, /RU: у вас 33 неотмеченных урока с 01\.11\.2026/);
  assert.match(mail.text, /Ava märkimata tunnid: https:\/\/crm\.epkoolitus\.ee\/calendar\/markimata/);
  assert.match(mail.text, /esmaspäev 02\.11\.2026/);
  assert.equal((mail.text.match(/Mari <b>Maasikas<\/b>/g) || []).length, 30, "30 rows in the text too");
  for (const secret of ["mari@kool.ee", "ema@kool.ee", "€", "hind"]) assert.ok(!mail.html.includes(secret) && !mail.text.includes(secret), `no ${secret}`);
  const one = core.composeDigestEmail({ teacher: { name: "" }, digest: core.buildDigest(itemsFor(1)) });
  assert.equal(one.subject, "Märkimata tunnid: 1");
  assert.match(one.text, /^Tere!/);
  assert.match(one.text, /1 tund, millel/);
  assert.match(one.text, /1 неотмеченный урок/);
  assert.ok(!one.text.includes("ja veel"));
});

test("settings default OFF (owner sees a test e-mail first); markers allow only a retry after a failure", () => {
  assert.equal(core.normalizeDigestSettings(undefined).weeklyUnmarked, false);
  assert.equal(core.normalizeDigestSettings({}).weeklyUnmarked, false);
  assert.equal(core.normalizeDigestSettings({ weeklyUnmarked: true }).weeklyUnmarked, true);
  assert.equal(core.normalizeDigestSettings({ weeklyUnmarked: false }).weeklyUnmarked, false);
  assert.equal(core.markerAllowsSend(null), true);
  for (const status of ["sending", "sent", "no-email"]) assert.equal(core.markerAllowsSend({ status, attempts: 1 }), false);
  assert.equal(core.markerAllowsSend({ status: "failed", attempts: 1 }), true);
  assert.equal(core.markerAllowsSend({ status: "failed", attempts: 3 }), false);
  assert.equal(core.markerId("abc", "2026-W46"), "abc_2026-W46");
});

// ── the service against an in-memory Firestore ────────────────────────────────────────────────────────────────────

function fakeDb(initial = {}) {
  const store = new Map(Object.entries(initial));
  const added = [];
  const docRef = (collection, id) => ({
    id, path: `${collection}/${id}`,
    async get() { return snap(`${collection}/${id}`); },
    async set(data) { store.set(`${collection}/${id}`, { ...data }); },
    async update(data) { store.set(`${collection}/${id}`, { ...(store.get(`${collection}/${id}`) || {}), ...data }); },
  });
  const snap = (key) => ({ exists: store.has(key), data: () => store.get(key), id: key.split("/").pop() });
  const collectionDocs = (collection) => [...store.entries()].filter(([key]) => key.startsWith(`${collection}/`) && key.split("/").length === 2)
    .map(([key, value]) => ({ id: key.split("/")[1], data: () => value }));
  const query = (collection, filters = []) => ({
    where(field, op, value) { return query(collection, [...filters, { field, op, value }]); },
    async get() {
      return { docs: collectionDocs(collection).filter((doc) => filters.every(({ field, op, value }) => (op === "in" ? value.includes(doc.data()[field]) : op === ">=" ? String(doc.data()[field] || "") >= value : doc.data()[field] === value))) };
    },
  });
  return {
    store, added,
    collection(collection) {
      return {
        doc: (id) => docRef(collection, id),
        where: (...args) => query(collection).where(...args),
        get: () => query(collection).get(),
        async add(data) { added.push({ collection, data }); return { id: `auto${added.length}` }; },
      };
    },
    async getAll(...refs) { return Promise.all(refs.map((ref) => ref.get())); },
    async runTransaction(work) {
      return work({ get: (ref) => ref.get(), set: (ref, data) => { store.set(ref.path, { ...data }); } });
    },
  };
}

function seeded(extra = {}) {
  return fakeDb({
    "users/t1": { role: "teacher", email: "kati@kool.ee", displayName: "Kati Kask" },
    "users/t2": { role: "teacher", email: "tiit@kool.ee", displayName: "Tiit Tamm" },
    "users/t3": { role: "teacher", email: "noemail@kool.ee", displayName: "Uus Õpetaja" },
    "users/s1": { role: "student", email: "mari@kool.ee" },
    "students/s1": { name: "Mari Maasikas", subject: "Eesti keel", email: "mari@kool.ee", parentEmail: "ema@kool.ee" },
    "schedule/w1": weekly,
    "schedule/w3": { ...weekly, id: "w3", teacherUid: "t3", teacher: "Uus Õpetaja" },
    "emailSettings/teacherDigest": { weeklyUnmarked: true },
    ...extra,
  });
}
const fakeAuth = {
  async getUsers(ids) {
    const known = { t1: "kati@kool.ee", t2: "tiit@kool.ee", t3: "noemail@kool.ee", s1: "mari@kool.ee" };
    return { users: ids.filter(({ uid }) => known[uid]).map(({ uid }) => ({ uid, email: known[uid], emailVerified: uid !== "t3" })) };
  },
};
const monday = () => new Date("2026-11-09T06:00:00Z"); // 08:00 Tallinn

test("service: sends to teachers with lessons only, once per week, marker + bell, logs counts", async () => {
  const db = seeded();
  const sent = [];
  const deliver = async (message, context) => { sent.push({ message, context }); return { status: "sent", provider: "smtp" }; };
  const service = createTeacherDigestService({ db, auth: fakeAuth, deliver, now: monday, pauseMs: 0, env: {} });
  const result = await service.run();
  assert.equal(result.week, "2026-W46");
  assert.equal(result.sent, 1);
  assert.equal(result.noEmail, 1, "t3 gets the bell notice without an e-mail");
  assert.equal(result.zero, 1, "t2 has nothing → skipped");
  assert.deepEqual(sent.map((item) => item.message.to), ["kati@kool.ee"]);
  assert.match(sent[0].message.subject, /^Märkimata tunnid: \d+$/);
  assert.ok(!sent.some((item) => /mari@|ema@/.test(item.message.to)), "never to learners or parents");
  assert.equal(db.store.get("teacherUnmarkedDigests/t1_2026-W46").status, "sent");
  assert.equal(db.store.get("teacherUnmarkedDigests/t3_2026-W46").status, "no-email");
  assert.ok(!db.store.has("teacherUnmarkedDigests/t2_2026-W46"));
  const marker = db.store.get("teacherUnmarkedDigests/t1_2026-W46");
  assert.equal(marker.teacherUid, "t1");
  assert.ok(marker.total > 0);
  assert.ok(!JSON.stringify(marker).includes("Mari"), "the marker has counts only");
  const log = db.added.find((item) => item.collection === "activityLog");
  assert.equal(log.data.type, "system.teacher_unmarked_digest");
  assert.equal(log.data.meta.sent, 1);
  assert.ok(!JSON.stringify(log.data).includes("@"), "no addresses in the log");

  // second run the same week: nothing more
  const again = await service.run();
  assert.equal(again.sent, 0);
  assert.equal(again.already, 2);
  assert.equal(sent.length, 1);
});

test("service: a failed send is retried in the same week, then stops", async () => {
  const db = seeded();
  let calls = 0;
  const deliver = async () => { calls++; if (calls < 2) throw new Error("SMTP down"); return { status: "sent" }; };
  const service = createTeacherDigestService({ db, auth: fakeAuth, deliver, now: monday, pauseMs: 0, env: {} });
  assert.equal((await service.run()).failed, 1);
  assert.equal(db.store.get("teacherUnmarkedDigests/t1_2026-W46").status, "failed");
  assert.equal((await service.run()).sent, 1);
  assert.equal(db.store.get("teacherUnmarkedDigests/t1_2026-W46").attempts, 2);
  assert.equal((await service.run()).sent, 0);
  assert.equal(calls, 2);
});

test("service: switched off → nothing; dry run → plan only, nothing written or sent", async () => {
  const off = seeded({ "emailSettings/teacherDigest": { weeklyUnmarked: false } });
  const sent = [];
  const deliver = async (message) => { sent.push(message); return { status: "sent" }; };
  assert.deepEqual(await createTeacherDigestService({ db: off, auth: fakeAuth, deliver, now: monday, env: {} }).run(), { off: true, week: "2026-W46" });
  const fresh = seeded();
  fresh.store.delete("emailSettings/teacherDigest");
  assert.deepEqual(await createTeacherDigestService({ db: fresh, auth: fakeAuth, deliver, now: monday, env: {} }).run(), { off: true, week: "2026-W46" }, "no settings document = off");
  assert.equal(sent.length, 0);

  const db = seeded();
  const result = await createTeacherDigestService({ db, auth: fakeAuth, deliver, now: monday, env: { TEACHER_DIGEST_DRY_RUN: "1" } }).run();
  assert.equal(result.dryRun, true);
  assert.equal(result.preview.length, 2);
  assert.match(result.preview.find((item) => item.uid === "t1").mail.subject, /^Märkimata tunnid: /);
  assert.equal(result.preview.find((item) => item.uid === "t3").mail, null);
  assert.equal(sent.length, 0);
  assert.equal(db.added.length, 0);
  assert.ok(![...db.store.keys()].some((key) => key.startsWith("teacherUnmarkedDigests/")));
  assert.equal(envDryRun({ FUNCTIONS_EMULATOR: "true" }), true, "the functions emulator never sends");
  assert.equal(envDryRun({}), false);
});

test("service: test e-mail goes to the administrator only, marks nothing", async () => {
  const db = seeded();
  const sent = [];
  const service = createTeacherDigestService({ db, auth: fakeAuth, deliver: async (message, context) => { sent.push({ message, context }); return { status: "sent" }; }, now: monday, env: {} });
  const result = await service.sendTest("Boss@Kool.ee");
  assert.equal(result.sent, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].message.to, "boss@kool.ee");
  assert.match(sent[0].message.subject, /^\[PROOV · (Kati Kask|Uus Õpetaja)\] Märkimata tunnid: \d+$/);
  assert.ok(![...db.store.keys()].some((key) => key.startsWith("teacherUnmarkedDigests/")));
  await assert.rejects(service.sendTest(""), /Administraatori/);
  assert.deepEqual(await service.sendTest("boss@kool.ee", { teacherUid: "t2" }), { sent: false, teacherName: "Tiit Tamm", total: 0 });
});

test("service: saving the switch writes the document and the activity log", async () => {
  const db = seeded();
  const service = createTeacherDigestService({ db, auth: fakeAuth, deliver: async () => ({}), now: monday, env: {} });
  assert.deepEqual(await service.saveSettings({ weeklyUnmarked: false }, { uid: "a1", name: "Admin" }), { weeklyUnmarked: false });
  assert.equal(db.store.get("emailSettings/teacherDigest").weeklyUnmarked, false);
  assert.equal(db.added[0].data.type, "settings.teacher_unmarked_digest");
  assert.equal((await service.loadSettings()).weeklyUnmarked, false);
});

test("service: counts only from the cutoff, skips inactive cards and closed days", async () => {
  const sent = [];
  const deliver = async (message) => { sent.push(message); return { status: "sent" }; };
  const run = (extra) => createTeacherDigestService({ db: seeded(extra), auth: fakeAuth, deliver, now: monday, pauseMs: 0, env: { TEACHER_DIGEST_DRY_RUN: "1" } }).run();
  const base = await run();
  assert.equal(base.preview.find((item) => item.uid === "t1").total, 1, "Mon 02.11 only: the September–October Mondays are before the cutoff");
  const locked = await run({ "financialLockedDates/2026-11-02": { closedAt: "2026-11-05" } });
  assert.equal(locked.preview.find((item) => item.uid === "t1"), undefined, "a closed day does not count");
  const inactive = await run({ "students/s1": { name: "Mari Maasikas", active: false } });
  assert.equal(inactive.withLessons, 0, "an archived card does not count");
  assert.equal(sent.length, 0);
});
