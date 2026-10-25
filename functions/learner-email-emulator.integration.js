"use strict";

// E-mails to students and parents (docs/EMAIL_NOTIFICATIONS.md) against the Firestore emulator: the real rules for
// Seaded → E-kirjad and the log, and the whole queue — daily reminders, lesson changes after the settle window (undo
// sends nothing), planner batch, homework checked, „Teated”, opt-out, idempotency, retry. Nothing is e-mailed: the
// mailer is a mock that records the messages.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { createLearnerEmailService } = require("./learner-email-service");
const core = require("./learner-email-core");

const PROJECT_ID = "demo-keelesepp-finance";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;
const DOMAIN = "learner-mail.test";

function requireSafeEmulatorEnvironment() {
  const activeProject = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (activeProject !== PROJECT_ID) throw new Error(`Refusing integration test for non-demo project: ${activeProject || "missing"}`);
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(AUTH_EMULATOR || "") || !/^(127\.0\.0\.1|localhost):\d+$/.test(FIRESTORE_EMULATOR || "")) {
    throw new Error("Auth and Firestore emulator hosts are required");
  }
}

function db() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  return admin.firestore();
}

const run = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
async function account(role, name) {
  const response = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `lem-${role}-${name}-${run}@example.com`.toLowerCase(), password: "emulator-only-password", returnSecureToken: true }),
  });
  const body = await response.json();
  assert.ok(body.idToken, JSON.stringify(body));
  const uid = JSON.parse(Buffer.from(body.idToken.split(".")[1], "base64url").toString("utf8")).user_id;
  await db().collection("users").doc(uid).set({ role, displayName: name });
  return { token: body.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const docUrl = (path) => `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
const put = (who, path, data) => fetch(docUrl(path), { method: "PATCH", headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) }) }).then((r) => r.status);
const get = (who, path) => fetch(docUrl(path), { headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);
const del = (who, path) => fetch(docUrl(path), { method: "DELETE", headers: { Authorization: `Bearer ${who.token}` } }).then((r) => r.status);

const type = (enabled = false, extra = {}) => ({ enabled, enabledAt: enabled ? "2026-10-24T00:00:00.000Z" : "", subjectEt: "", subjectRu: "", introEt: "", introRu: "", ...extra });
const allTypes = (enabled) => Object.fromEntries(core.TYPES.map((name) => [name, type(enabled)]));

test("Seaded → E-kirjad: only the administrator reads and writes the settings; the log is read-only", async () => {
  requireSafeEmulatorEnvironment();
  const owner = await account("admin", "owner");
  const teacher = await account("teacher", "kati");
  const student = await account("student", "mari");
  const parent = await account("parent", "ema");
  const valid = { dailyHour: 17, siteAddress: "Pärnu mnt 10", types: allTypes(false), updatedAt: "2026-10-25T10:00:00Z", updatedBy: owner.uid, updatedByName: "Owner" };

  assert.equal(await put(owner, "emailSettings/learner", valid), 200, "administrator saves");
  assert.equal(await get(owner, "emailSettings/learner"), 200);
  for (const who of [teacher, student, parent]) {
    assert.equal(await get(who, "emailSettings/learner"), 403, "nobody else reads");
    assert.equal(await put(who, "emailSettings/learner", { ...valid, updatedBy: who.uid }), 403, "nobody else writes");
  }
  assert.equal(await put(owner, "emailSettings/other", valid), 403, "one settings document");
  assert.equal(await put(owner, "emailSettings/learner", { ...valid, dailyHour: 3 }), 403, "not at night");
  assert.equal(await put(owner, "emailSettings/learner", { ...valid, extra: 1 }), 403, "fixed keys");
  assert.equal(await put(owner, "emailSettings/learner", { ...valid, types: { ...valid.types, spam: type(true) } }), 403, "known types only");
  assert.equal(await put(owner, "emailSettings/learner", { ...valid, types: { ...valid.types, lessonReminder: { ...type(true), html: "<b>" } } }), 403, "fixed type keys");
  assert.equal(await put(owner, "emailSettings/learner", { ...valid, types: { ...valid.types, lessonReminder: type(true, { subjectEt: "x".repeat(201) }) } }), 403, "short subject");
  assert.equal(await put(owner, "emailSettings/learner", { ...valid, updatedBy: teacher.uid }), 403, "signed by the writer");
  assert.equal(await del(owner, "emailSettings/learner"), 403, "never deleted");

  await db().collection("emailLog").doc(`log-${run}`).set({ kind: "lessonReminder", recipientCount: 1 });
  assert.equal(await get(owner, `emailLog/log-${run}`), 200, "administrator reads the log");
  assert.equal(await get(teacher, `emailLog/log-${run}`), 403);
  assert.equal(await put(owner, `emailLog/log-${run}`, { kind: "x" }), 403, "server writes the log");
  for (const path of [`learnerEmailJobs/j-${run}`, `emailPreferences/p-${run}`, "serverConfig/learnerEmail", "learnerEmailRuns/lease"]) {
    await db().doc(path).set({ secret: true }, { merge: true });
    assert.equal(await get(owner, path), 403, `${path} is server-only`);
  }
  await db().doc("emailSettings/learner").delete();
});

test("the queue: reminders, changes, planner batch, review, announcement, opt-out, idempotency and retry", async () => {
  requireSafeEmulatorEnvironment();
  const firestore = db();
  for (const path of ["learnerEmailRuns/lessonReminder", "learnerEmailRuns/homeworkDue", "learnerEmailRuns/lease"]) await firestore.doc(path).delete();
  let clock = new Date("2026-10-24T14:00:00Z"); // Saturday 17:00 in Tallinn (summer time; winter time starts 25.10 04:00)
  const sent = [];
  let failNext = false;
  const deliver = async (message, context) => {
    if (failNext) { failNext = false; throw new Error("535 authentication failed"); }
    sent.push({ ...message, context });
    return { status: "queued" };
  };
  const settingsId = `queue-test-${run}`;
  const service = createLearnerEmailService({ db: firestore, deliver, settingsId, now: () => clock, sleep: async () => {}, pauseMs: 0 });
  const ours = () => sent.filter((mail) => String(mail.to).endsWith(`@${DOMAIN}`));
  const take = () => { const list = ours(); sent.length = 0; return list; };
  const at = (iso) => { clock = new Date(iso); };

  await firestore.doc(`emailSettings/${settingsId}`).set({ dailyHour: 17, siteAddress: "Pärnu mnt 10", types: allTypes(true), updatedBy: "test" });
  await firestore.doc("users/lem-stu1").set({ role: "student", email: `mari@${DOMAIN}` });
  await firestore.doc("users/lem-par1").set({ role: "parent", email: `ema@${DOMAIN}`, preferredLanguage: "ru" });
  await firestore.doc("students/lem-s1").set({ name: "Mari", email: `MARI@${DOMAIN}`, linkedUserId: "lem-stu1", linkedParentIds: ["lem-par1"], parentContacts: [{ email: `vanaema@${DOMAIN}` }], active: true, subject: "Eesti keel" });
  await firestore.doc("students/lem-s2").set({ name: "Ilma e-postita", active: true });
  await firestore.doc("students/lem-s3").set({ name: "Lahkunud", email: `lahkunud@${DOMAIN}`, active: false });
  await firestore.doc("schedule/lem-weekly").set({ studentId: "lem-s1", recurring: true, startDate: "2026-09-06", date: "2026-09-06", day: "Sun", time: "10:00", duration: 60, teacher: "Kati", teacherUid: "t1", online: true, status: "Planeeritud" });
  await firestore.doc("schedule/lem-s2-lesson").set({ studentId: "lem-s2", recurring: false, date: "2026-10-25", time: "11:00", status: "Planeeritud" });
  await firestore.doc("schedule/lem-s3-lesson").set({ studentId: "lem-s3", recurring: false, date: "2026-10-25", time: "12:00", status: "Planeeritud" });
  await firestore.doc("homework/lem-h1").set({ studentId: "lem-s1", task: "Loe tekst lk 24", due: "2026-10-25", status: "Antud", teacherName: "Kati" });
  await firestore.doc("homework/lem-h2").set({ studentId: "lem-s1", task: "Juba tehtud", due: "2026-10-25", status: "Tehtud" });
  await firestore.doc(`emailPreferences/${core.emailHash(`vanaema@${DOMAIN}`)}`).set({ optOut: true });
  await firestore.doc("announcements/lem-ann").set({ title: "Koolivaheaeg", body: "Vaheajal tunde ei ole.", audience: "both", studentIds: ["lem-s1"], activeFrom: "2026-10-24", activeTo: "2026-10-31", responseType: "read", status: "published", publishedAt: "2026-10-24T12:00:00.000Z" });

  // 16:59 — nothing daily yet
  at("2026-10-24T13:59:00Z");
  await service.tick();
  const early = take();
  assert.deepEqual(early.map((mail) => `${mail.context.kind}:${mail.to.split("@")[0]}`).sort(), ["learner-announcement:ema", "learner-announcement:mari"],
    "reminders wait for 17:00; the announcement goes to the accounts (not the grandmother's contact address)");
  assert.ok(early.find((mail) => mail.to.startsWith("mari")).text.includes("Vaheajal tunde ei ole."));
  await firestore.doc("learnerEmailRuns/lease").delete();

  at("2026-10-24T14:00:00Z");
  const first = await service.tick();
  assert.equal(first.lessonReminder.forDate, "2026-10-25", "17:00 on Saturday → Sunday's lessons (the DST day)");
  const daily = take();
  const kinds = (list) => list.map((mail) => `${mail.context.kind}:${mail.to.split("@")[0]}`).sort();
  assert.deepEqual(kinds(daily), [
    "learner-homeworkDue:ema", "learner-homeworkDue:mari",
    "learner-lessonReminder:ema", "learner-lessonReminder:mari",
  ], "no grandmother (opted out), no card without e-mail, no inactive card; the announcement went in the 16:59 tick");
  const reminder = daily.find((mail) => mail.context.kind === "learner-lessonReminder" && mail.to.startsWith("mari"));
  assert.ok(reminder.subject.includes("Homme kell 10:00") && reminder.subject.includes("Завтра в 10:00"), "Estonian + Russian");
  assert.ok(reminder.text.includes("pühapäev, 25.10.2026 kell 10:00") && reminder.text.includes("veebitund"));
  assert.ok(reminder.headers["List-Unsubscribe"].includes("/email-preferences/one-click?t="));
  const parentMail = daily.find((mail) => mail.context.kind === "learner-lessonReminder" && mail.to.startsWith("ema"));
  assert.ok(!parentMail.subject.includes(" / ") && parentMail.subject.startsWith("Завтра"), "the parent's profile language is Russian");
  const s2Job = await firestore.doc("learnerEmailJobs/lessonReminder__lem-s2-lesson__2026-10-25__lem-s2").get();
  assert.equal(s2Job.data().status, "skipped");
  assert.equal(s2Job.data().reason, "no-email");
  const logs = await firestore.collection("emailLog").where("jobId", "==", "lessonReminder__lem-weekly__2026-10-25__lem-s1").get();
  assert.equal(logs.size, 1);
  assert.deepEqual([logs.docs[0].data().recipientCount, logs.docs[0].data().optedOut], [2, 1]);
  assert.ok(!JSON.stringify(logs.docs[0].data()).includes("@"), "the log has no addresses");

  // the same tick again, and the daily selection forced again: nothing twice
  await service.tick();
  await firestore.doc("learnerEmailRuns/lessonReminder").delete();
  await service.tick();
  assert.equal(take().length, 0, "idempotent per occurrence and recipient");

  // ── a one-off lesson moved by the teacher; another moved and moved back (undo) inside the window
  at("2026-10-24T15:00:00Z");
  const single = { studentId: "lem-s1", recurring: false, date: "2026-10-27", time: "16:00", duration: 60, teacher: "Kati", status: "Planeeritud", roomName: "2" };
  await firestore.doc("schedule/lem-single").set({ ...single, date: "2026-10-28", time: "15:00" });
  await service.onScheduleWrite("lem-single", single, { ...single, date: "2026-10-28", time: "15:00" });
  await firestore.doc("schedule/lem-undo").set(single);
  await service.onScheduleWrite("lem-undo", single, { ...single, time: "18:00" });
  at("2026-10-24T15:05:00Z");
  await service.processDue(await service.loadSettings());
  assert.equal(take().length, 0, "the settle window");
  at("2026-10-24T15:11:00Z");
  await service.processDue(await service.loadSettings());
  const moved = take();
  assert.deepEqual(kinds(moved), ["learner-lessonMoved:ema", "learner-lessonMoved:mari"]);
  assert.ok(moved.find((mail) => mail.to.startsWith("mari")).text.includes("Oli: teisipäev, 27.10.2026 kell 16:00"));
  assert.ok(moved.find((mail) => mail.to.startsWith("mari")).text.includes("Uus aeg: kolmapäev, 28.10.2026 kell 15:00"));
  assert.equal((await firestore.doc("learnerEmailJobs/lessonChange__lem-undo").get()).data().reason, "unchanged", "undo sends nothing");

  // ── one occurrence of the weekly lesson moved (calendar drag: excluded + child) and another cancelled
  const weekly = (await firestore.doc("schedule/lem-weekly").get()).data();
  await firestore.doc("schedule/lem-weekly").update({ excludedDates: ["2026-11-01", "2026-11-08"] });
  await firestore.doc("schedule/lem-child").set({ studentId: "lem-s1", recurring: false, date: "2026-11-02", time: "17:00", duration: 60, status: "Planeeritud", movedFromSeriesId: "lem-weekly", movedFromDate: "2026-11-01" });
  await service.onScheduleWrite("lem-weekly", weekly, { ...weekly, excludedDates: ["2026-11-01", "2026-11-08"] });
  await service.onScheduleWrite("lem-child", null, (await firestore.doc("schedule/lem-child").get()).data());
  at("2026-10-24T15:25:00Z");
  await service.processDue(await service.loadSettings());
  const occurrence = take();
  assert.deepEqual(kinds(occurrence), ["learner-lessonCancelled:ema", "learner-lessonCancelled:mari", "learner-lessonMoved:ema", "learner-lessonMoved:mari"]);
  assert.ok(occurrence.find((mail) => mail.context.kind === "learner-lessonMoved" && mail.to.startsWith("mari")).text.includes("Uus aeg: esmaspäev, 02.11.2026 kell 17:00"));
  assert.ok(occurrence.find((mail) => mail.context.kind === "learner-lessonCancelled" && mail.to.startsWith("mari")).text.includes("pühapäev, 08.11.2026 kell 10:00"));

  // ── the planner's „Kinnita ajakava”: three lessons, one batch → one e-mail per student and parent
  at("2026-10-24T16:00:00Z");
  const planned = [
    ["lem-p1", { studentId: "lem-s1", day: "Mon", time: "16:00", startDate: "2026-11-02" }],
    ["lem-p2", { studentId: "lem-s1", day: "Thu", time: "17:00", startDate: "2026-11-05", online: true }],
    ["lem-p3", { studentId: "lem-s2", day: "Tue", time: "15:00", startDate: "2026-11-03" }],
  ];
  for (const [id, lesson] of planned) {
    const data = { ...lesson, recurring: true, date: lesson.startDate, duration: 60, teacher: "Kati", status: "Planeeritud", source: "planner", plannerBatchId: "lem-batch" };
    await firestore.doc(`schedule/${id}`).set(data);
    await service.onScheduleWrite(id, null, data);
  }
  at("2026-10-24T16:02:00Z");
  await service.processDue(await service.loadSettings());
  assert.equal(take().length, 0, "waits until the batch is quiet");
  at("2026-10-24T16:04:00Z");
  await service.processDue(await service.loadSettings());
  const schedule = take();
  assert.deepEqual(kinds(schedule), ["learner-newSchedule:ema", "learner-newSchedule:mari"]);
  const scheduleText = schedule.find((mail) => mail.to.startsWith("mari")).text;
  assert.ok(scheduleText.includes("Iga nädal: esmaspäev kell 16:00") && scheduleText.includes("Iga nädal: neljapäev kell 17:00"));
  assert.ok(scheduleText.includes("Algus: esmaspäev, 02.11.2026"));
  await firestore.doc("plannerBatches/lem-silent").set({ status: "confirmed", notify: false });
  await firestore.doc("schedule/lem-p4").set({ studentId: "lem-s1", recurring: true, day: "Fri", time: "10:00", startDate: "2026-11-06", status: "Planeeritud", plannerBatchId: "lem-silent" });
  await service.onScheduleWrite("lem-p4", null, { studentId: "lem-s1", plannerBatchId: "lem-silent" });
  at("2026-10-24T16:10:00Z");
  await service.processDue(await service.loadSettings());
  assert.equal(take().length, 0, "a batch marked notify: false is silent");

  // ── homework checked once
  await firestore.doc("worksheetAssignments/lem-w1").set({ studentId: "lem-s1", lessonTitle: "Tund 12 · Harjuta", reviewStatus: "reviewed", teacherGrade: 5, teacherFeedback: "Väga hea!", reviewedByName: "Kati" });
  assert.equal(await service.onReviewWrite("worksheetAssignments", "lem-w1", { reviewStatus: "pending" }, { studentId: "lem-s1", reviewStatus: "reviewed" }), true);
  assert.equal(await service.onReviewWrite("worksheetAssignments", "lem-w1", { reviewStatus: "pending" }, { studentId: "lem-s1", reviewStatus: "reviewed" }), false, "one job per work");
  at("2026-10-24T16:13:00Z");
  await service.processDue(await service.loadSettings());
  const checked = take();
  assert.deepEqual(kinds(checked), ["learner-homeworkChecked:ema", "learner-homeworkChecked:mari"]);
  assert.ok(checked.find((mail) => mail.to.startsWith("mari")).text.includes("Hinne: 5 / 5"));

  // ── the recipient turns e-mails off through the link in the footer; a forged link does nothing
  const token = core.preferenceToken(`mari@${DOMAIN}`, await service.tokenKey());
  assert.deepEqual(await service.preferenceStatus(token), { email: "ma••@learner-mail.test", optOut: false, language: "both" });
  await assert.rejects(service.preferenceStatus(token.replace(/.$/, (ch) => (ch === "A" ? "B" : "A"))), /Link ei kehti/);
  assert.equal((await service.savePreferences(token, { optOut: true, language: "et" })).optOut, true);
  await firestore.doc("worksheetAssignments/lem-w2").set({ studentId: "lem-s1", lessonTitle: "Tund 13", reviewStatus: "reviewed", teacherGrade: 4 });
  await service.onReviewWrite("worksheetAssignments", "lem-w2", {}, { studentId: "lem-s1", reviewStatus: "reviewed" });
  at("2026-10-24T16:20:00Z");
  await service.processDue(await service.loadSettings());
  assert.deepEqual(kinds(take()), ["learner-homeworkChecked:ema"], "only the parent now");

  // ── the SMTP fails once: the job waits and is retried, nobody gets it twice
  await firestore.doc("worksheetAssignments/lem-w3").set({ studentId: "lem-s1", lessonTitle: "Tund 14", reviewStatus: "reviewed" });
  await service.onReviewWrite("worksheetAssignments", "lem-w3", {}, { studentId: "lem-s1", reviewStatus: "reviewed" });
  at("2026-10-24T16:30:00Z");
  failNext = true;
  const failed = await service.processDue(await service.loadSettings());
  assert.equal(failed.errors, 1);
  const waiting = (await firestore.doc("learnerEmailJobs/homeworkChecked__worksheetAssignments__lem-w3").get()).data();
  assert.deepEqual([waiting.status, waiting.attempts], ["pending", 1]);
  at("2026-10-24T16:46:00Z");
  await service.processDue(await service.loadSettings());
  assert.deepEqual(kinds(take()), ["learner-homeworkChecked:ema"]);

  // ── a type switched off stops its pending jobs
  await firestore.doc(`emailSettings/${settingsId}`).set({ types: { ...allTypes(true), homeworkChecked: type(false) } }, { merge: true });
  await firestore.doc("worksheetAssignments/lem-w4").set({ studentId: "lem-s1", lessonTitle: "Tund 15", reviewStatus: "reviewed" });
  assert.equal(await service.onReviewWrite("worksheetAssignments", "lem-w4", {}, { studentId: "lem-s1", reviewStatus: "reviewed" }), false, "not queued while off");

  // ── a job that waited too long (e-mails were off) is dropped, not sent days later
  await firestore.doc("learnerEmailJobs/lem-stale").set({ kind: "homeworkDue", refs: { homeworkId: "lem-h1", studentId: "lem-s1", due: "2026-10-25" }, status: "pending", done: [], attempts: 0, createdAt: "2026-10-21T10:00:00.000Z", sendAfter: "2026-10-21T10:00:00.000Z" });
  await service.processDue(await service.loadSettings());
  assert.equal((await firestore.doc("learnerEmailJobs/lem-stale").get()).data().reason, "stale");
  assert.equal(take().length, 0);

  // ── a tick while another one still runs (lease held) does nothing; after the lease it runs
  await firestore.doc("learnerEmailRuns/lease").set({ until: new Date(clock.getTime() + 60000).toISOString() });
  assert.deepEqual(await service.tick(), { busy: true });
  at("2026-10-24T16:48:00Z");
  assert.equal((await service.tick()).busy, undefined);
});

test("staffOperationsApi: the preferences link works without a login, a forged one does not; preview is admin-only", async (t) => {
  requireSafeEmulatorEnvironment();
  const base = `http://${process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001"}/${PROJECT_ID}/us-central1/staffOperationsApi`;
  const post = (path, body, who = null) => fetch(`${base}${path}`, { method: "POST", headers: { "Content-Type": "application/json", ...(who ? { Authorization: `Bearer ${who.token}` } : {}) }, body: JSON.stringify(body) })
    .then(async (response) => ({ status: response.status, body: await response.json().catch(() => ({})) }));
  try { await fetch(base, { method: "OPTIONS" }); } catch { t.skip("functions emulator not running"); return; }
  const service = createLearnerEmailService({ db: db(), deliver: async () => ({}) });
  const token = core.preferenceToken(`route-${run}@${DOMAIN}`, await service.tokenKey());

  const status = await post("/email-preferences/status", { token });
  assert.equal(status.status, 200, JSON.stringify(status.body));
  assert.equal(status.body.optOut, false);
  assert.equal(status.body.email.endsWith(`@${DOMAIN}`), true);
  assert.equal(status.body.email.includes(`route-${run}`), false, "the address is masked");
  assert.equal((await post("/email-preferences/status", { token: `${token.split(".")[0]}.forged` })).status, 400);
  const saved = await post("/email-preferences/save", { token, optOut: true, language: "ru" });
  assert.deepEqual([saved.status, saved.body.optOut, saved.body.language], [200, true, "ru"]);
  const oneClick = await fetch(`${base}/email-preferences/one-click?t=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" });
  assert.equal(oneClick.status, 200, "one-click unsubscribe from the mail program");

  const owner = await account("admin", "route-owner");
  const teacher = await account("teacher", "route-teacher");
  const preview = await post("/learner-emails/preview", { type: "lessonMoved", language: "et" }, owner);
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.ok(preview.body.subject.startsWith("Tunni aeg muutus") && !preview.body.subject.includes(" / "));
  assert.ok(preview.body.html.includes("Uus aeg"));
  assert.equal((await post("/learner-emails/preview", { type: "lessonMoved" }, teacher)).status, 403);
  assert.equal((await post("/learner-emails/preview", { type: "lessonMoved" })).status, 401);
  assert.equal((await post("/learner-emails/preview", { type: "spam" }, owner)).status, 400);

  // the deployed trigger queues a teacher's move (settings on), and stays silent while the type is off
  const firestore = db();
  await firestore.doc("emailSettings/learner").set({ dailyHour: 17, types: { ...allTypes(false), lessonMoved: type(true), lessonCancelled: type(true) }, updatedBy: "test" });
  const lesson = { studentId: "lem-trigger-s", recurring: false, date: "2030-03-04", time: "16:00", duration: 60, status: "Planeeritud" };
  await firestore.doc(`schedule/lem-trigger-${run}`).set(lesson);
  await firestore.doc(`schedule/lem-trigger-${run}`).update({ date: "2030-03-05" });
  let job = null;
  for (let attempt = 0; attempt < 40 && !job; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const snap = await firestore.doc(`learnerEmailJobs/lessonChange__lem-trigger-${run}`).get();
    if (snap.exists) job = snap.data();
  }
  assert.ok(job, "queueLearnerScheduleEmail made the job");
  assert.deepEqual([job.kind, job.status, job.refs.old.date], ["lessonChange", "pending", "2030-03-04"]);
  await firestore.doc("emailSettings/learner").delete();
  await firestore.doc(`schedule/lem-silent-${run}`).set(lesson);
  await firestore.doc(`schedule/lem-silent-${run}`).update({ status: "Tühistatud" });
  await new Promise((resolve) => setTimeout(resolve, 2500));
  assert.equal((await firestore.doc(`learnerEmailJobs/lessonChange__lem-silent-${run}`).get()).exists, false, "off = nothing queued");
});
