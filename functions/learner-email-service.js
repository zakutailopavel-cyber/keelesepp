"use strict";

// E-mails to students and parents — loading, queueing and sending (rules and texts: learner-email-core.js).
//
// Every e-mail starts as a job in the server-only collection learnerEmailJobs/{jobId}. The id is deterministic
// (lessonReminder__<schedule>__<date>__<student>, lessonChange__<schedule>[__<date>], newSchedule__<batch>, …), so a
// lesson, a homework or an announcement is e-mailed once. The 5-minute tick (index.js learnerEmailsTick) creates the
// daily jobs, then sends what is due: at most MAX_MESSAGES_PER_TICK messages a tick with a pause between them; every
// address already sent is kept on the job (`done`), so a retry never sends it twice. Settings:
// emailSettings/learner (Seaded → E-kirjad, all types off by default). Opt-out and language per address:
// emailPreferences/<sha256(address)>. Log without addresses: emailLog.

const core = require("./learner-email-core");
const { normalizeAnnouncement, isActive: announcementActive, allTargets, cardMatches, studentUidsOf, parentUidsOf } = require("./announcements-core");

const JOBS = "learnerEmailJobs";
const RUNS = "learnerEmailRuns";
const PREFS = "emailPreferences";
const LOG = "emailLog";
const SETTINGS_PATH = ["emailSettings", "learner"];
const KEY_PATH = ["serverConfig", "learnerEmail"];
const LEASE_SECONDS = 280;
const RETRY_MINUTES = 15;
const STALE_HOURS = 36;

const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);
const minutesFrom = (now, minutes) => new Date(now.getTime() + minutes * 60000).toISOString();
const alreadyExists = (error) => error?.code === 6 || /already exists/i.test(String(error?.message || ""));

// settingsId: tests use their own settings document, so triggers running in the functions emulator stay silent
function createLearnerEmailService({ db, deliver, settingsId = SETTINGS_PATH[1], now = () => new Date(), sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), pauseMs = core.SEND_PAUSE_MS, maxPerTick = core.MAX_MESSAGES_PER_TICK, randomKey = () => require("crypto").randomBytes(32).toString("hex") }) {
  const jobs = () => db.collection(JOBS);

  async function loadSettings() {
    const snap = await db.collection(SETTINGS_PATH[0]).doc(settingsId).get();
    return core.normalizeSettings(snap.exists ? snap.data() : {});
  }

  // the signing key of the preferences links: made once, kept server-only (serverConfig is closed to browsers)
  let cachedKey = "";
  async function tokenKey() {
    if (cachedKey) return cachedKey;
    const ref = db.collection(KEY_PATH[0]).doc(KEY_PATH[1]);
    cachedKey = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      if (snap.exists && snap.data().tokenKey) return snap.data().tokenKey;
      const key = randomKey();
      transaction.set(ref, { tokenKey: key, createdAt: now().toISOString() }, { merge: true });
      return key;
    });
    return cachedKey;
  }

  async function log(entry) {
    await db.collection(LOG).add({ ...entry, at: now().toISOString() });
  }

  // ── queueing ───────────────────────────────────────────────────────────────────────────────────────────────────

  async function createMissing(list, base) {
    let created = 0;
    for (let index = 0; index < list.length; index += 300) {
      const part = list.slice(index, index + 300);
      const snaps = await db.getAll(...part.map((item) => jobs().doc(item.jobId)));
      const batch = db.batch();
      let writes = 0;
      snaps.forEach((snap, position) => {
        if (snap.exists) return;
        const { jobId, ...refs } = part[position];
        batch.create(snap.ref, { ...base, refs, status: "pending", done: [], attempts: 0, createdAt: now().toISOString(), sendAfter: base.sendAfter || now().toISOString() });
        writes++;
      });
      if (writes) await batch.commit();
      created += writes;
    }
    return created;
  }

  // a staff change of a lesson → one pending job per lesson (or occurrence); a second change inside the settle window
  // keeps the first „old” time and waits again
  async function onScheduleWrite(scheduleId, before, after) {
    const result = { changes: 0, planner: "" };
    const today = core.tallinnParts(now()).date;
    const batchId = clean(after?.plannerBatchId, 200);
    const plannerNew = Boolean(batchId) && (!before || clean(before.plannerBatchId, 200) !== batchId);
    const notices = core.scheduleChangeNotices(scheduleId, before, after, { today });
    // most writes (Google sync status, marks) are neither: no settings read for them
    if (!plannerNew && !notices.length) return result;
    const settings = await loadSettings();
    if (plannerNew && settings.types.newSchedule.enabled) {
      await queuePlannerBatch(batchId);
      result.planner = batchId;
    }
    if (!settings.types.lessonMoved.enabled && !settings.types.lessonCancelled.enabled) return result;
    for (const notice of notices) {
      const ref = jobs().doc(notice.jobId);
      const { jobId, ...refs } = notice;
      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(ref);
        const sendAfter = minutesFrom(now(), core.CHANGE_SETTLE_MINUTES);
        if (snap.exists && snap.data().status === "pending") transaction.update(ref, { sendAfter, changedAgainAt: now().toISOString() });
        else transaction.set(ref, { kind: "lessonChange", refs, status: "pending", done: [], attempts: 0, createdAt: now().toISOString(), sendAfter, version: (snap.exists ? Number(snap.data().version) || 1 : 0) + 1 });
      });
      result.changes++;
    }
    return result;
  }

  async function queuePlannerBatch(batchId) {
    const ref = jobs().doc(core.jobKey("newSchedule", batchId));
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      const sendAfter = minutesFrom(now(), core.PLANNER_QUIET_MINUTES);
      if (!snap.exists) transaction.set(ref, { kind: "newSchedule", refs: { batchId }, status: "pending", done: [], attempts: 0, createdAt: now().toISOString(), sendAfter });
      else if (snap.data().status === "pending" && !(snap.data().done || []).length) transaction.update(ref, { sendAfter });
    });
  }

  // a worksheet / exercise result reviewed for the first time
  async function onReviewWrite(collectionName, docId, before, after) {
    if (!core.firstReview(before || {}, after || {})) return false;
    const settings = await loadSettings();
    if (!settings.types.homeworkChecked.enabled) return false;
    const created = await createMissing([{ jobId: core.jobKey("homeworkChecked", collectionName, docId), collection: collectionName, docId, studentId: clean(after.studentId, 128) }],
      { kind: "homeworkChecked", sendAfter: minutesFrom(now(), core.REVIEW_SETTLE_MINUTES) });
    return created > 0;
  }

  async function runDaily(kind, settings, select) {
    const ref = db.collection(RUNS).doc(kind);
    const snap = await ref.get();
    const due = core.dailyRunDue({ now: now(), hour: settings.dailyHour, lastRunDate: snap.exists ? snap.data().lastRunDate : "" });
    if (!due.due) return null;
    const list = await select(due.tomorrow);
    const created = await createMissing(list, { kind });
    await ref.set({ lastRunDate: due.today, forDate: due.tomorrow, selected: list.length, created, at: now().toISOString() });
    return { forDate: due.tomorrow, selected: list.length, created };
  }

  async function selectLessonReminders(date) {
    const [schedules, groups] = await Promise.all([db.collection("schedule").get(), db.collection("groups").get()]);
    return core.lessonOccurrencesOn(schedules.docs.map((doc) => ({ id: doc.id, ...doc.data() })), groups.docs.map((doc) => ({ id: doc.id, ...doc.data() })), date)
      .map((item) => ({ jobId: item.jobId, scheduleId: item.scheduleId, groupId: item.groupId, studentId: item.studentId, date }));
  }

  async function selectHomeworkDue(date) {
    const snap = await db.collection("homework").where("due", "==", date).get();
    return core.homeworkDueOn(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })), date);
  }

  // published, active announcements published after the type was switched on → one job each
  async function queueAnnouncements(settings) {
    const type = settings.types.announcement;
    if (!type.enabled || !type.enabledAt) return 0;
    const today = core.tallinnParts(now()).date;
    const snap = await db.collection("announcements").where("status", "==", "published").get();
    const list = snap.docs.map((doc) => normalizeAnnouncement(doc.id, doc.data()))
      .filter((item) => announcementActive(item, today) && item.publishedAt && item.publishedAt >= type.enabledAt)
      .map((item) => ({ jobId: core.jobKey("announcement", item.id), announcementId: item.id }));
    return list.length ? createMissing(list, { kind: "announcement" }) : 0;
  }

  // ── planning one job: what to send to whom ──────────────────────────────────────────────────────────────────────

  async function accountsFor(uids) {
    const ids = [...new Set(uids.filter(Boolean))];
    const map = new Map();
    for (let index = 0; index < ids.length; index += 300) {
      const snaps = await db.getAll(...ids.slice(index, index + 300).map((uid) => db.collection("users").doc(uid)));
      snaps.filter((snap) => snap.exists).forEach((snap) => map.set(snap.id, snap.data()));
    }
    return map;
  }

  async function studentMessages(studentId, data, { homework = false } = {}) {
    const snap = await db.collection("students").doc(clean(studentId, 128)).get();
    if (!snap.exists) return { student: null, messages: [] };
    const student = { id: snap.id, ...snap.data() };
    const accounts = await accountsFor([...core.studentAccountIds(student), ...core.parentAccountIds(student)]);
    const messages = core.cardRecipients(student, accounts, { homework }).map((recipient) => ({
      key: `${student.id}|${core.emailHash(recipient.email)}`, ...recipient, data: { studentName: clean(student.name, 120), ...data },
    }));
    return { student, messages };
  }

  const docData = async (collectionName, id) => {
    if (!id) return null;
    const snap = await db.collection(collectionName).doc(clean(id, 300)).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  };

  async function planJob(job, settings) {
    const refs = job.refs || {};
    const today = core.tallinnParts(now()).date;
    const enabled = (type) => settings.types[type]?.enabled === true;
    // a job left waiting (e-mails switched off for a while) is not sent days later
    const created = Date.parse(job.createdAt || "");
    if (Number.isFinite(created) && now().getTime() - created > STALE_HOURS * 3600000) return { skip: "stale", type: job.kind };
    if (job.kind === "lessonReminder") {
      if (!enabled("lessonReminder")) return { skip: "disabled", type: "lessonReminder" };
      // the lesson as it is now: cancelled, moved or ended after the reminder was queued → nothing is sent
      const group = refs.groupId ? await docData("groups", refs.groupId) : null;
      const event = refs.groupId ? null : await docData("schedule", refs.scheduleId);
      if (!group && !event) return { skip: "deleted", type: "lessonReminder" };
      const occurrence = core.lessonOccurrencesOn(event ? [event] : [], group ? [group] : [], refs.date)
        .find((item) => item.scheduleId === refs.scheduleId && item.studentId === refs.studentId);
      if (!occurrence) return { skip: "not-on-date", type: "lessonReminder" };
      const { messages } = await studentMessages(refs.studentId, { date: refs.date, time: occurrence.time, duration: occurrence.duration, teacher: occurrence.teacher, subject: occurrence.subject, lesson: { online: occurrence.online, roomName: occurrence.roomName } });
      return { type: "lessonReminder", messages };
    }
    if (job.kind === "lessonChange") {
      const current = await docData("schedule", refs.scheduleId);
      let children = [];
      if (refs.scope === "occurrence" && current) {
        const [moved, older] = await Promise.all([
          db.collection("schedule").where("movedFromSeriesId", "==", refs.scheduleId).get(),
          db.collection("schedule").where("seriesId", "==", refs.scheduleId).get(),
        ]);
        children = [
          ...moved.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((child) => child.movedFromDate === refs.date),
          ...older.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((child) => child.originalOccurrenceDate === refs.date),
        ];
      }
      const parent = refs.parentId ? await docData("schedule", refs.parentId) : null;
      const outcome = core.resolveLessonChange(refs, { current, children, parent, today });
      if (outcome.skip) return { skip: outcome.skip, type: "lessonMoved" };
      if (!enabled(outcome.type)) return { skip: "disabled", type: outcome.type };
      const lesson = outcome.lesson || {};
      const { messages } = await studentMessages(refs.studentId, {
        teacher: clean(lesson.teacherFull || lesson.teacher, 120), subject: clean(lesson.subject, 80), lesson: { online: lesson.online === true, roomName: clean(lesson.roomName, 80) },
        old: outcome.old, next: outcome.next, series: outcome.series === true, from: outcome.from,
      });
      return { type: outcome.type, messages };
    }
    if (job.kind === "newSchedule") {
      if (!enabled("newSchedule")) return { skip: "disabled", type: "newSchedule" };
      const batch = await docData("plannerBatches", refs.batchId);
      if (batch && (batch.notify === false || ["cancelled", "draft"].includes(batch.status))) return { skip: `batch-${batch.notify === false ? "silent" : batch.status}`, type: "newSchedule" };
      const snap = await db.collection("schedule").where("plannerBatchId", "==", refs.batchId).get();
      const summary = core.plannerBatchSummary(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })), { today });
      if (!summary.length) return { skip: "no-lessons", type: "newSchedule" };
      const messages = [];
      for (const entry of summary) {
        const planned = await studentMessages(entry.studentId, { start: entry.start, weekly: entry.weekly, singles: entry.singles, teachers: entry.teachers, siteAddress: settings.siteAddress });
        messages.push(...planned.messages);
      }
      return { type: "newSchedule", messages, students: summary.length };
    }
    if (job.kind === "homeworkDue") {
      if (!enabled("homeworkDue")) return { skip: "disabled", type: "homeworkDue" };
      const homework = await docData("homework", refs.homeworkId);
      if (!homework || !core.homeworkDueOn([homework], refs.due).length) return { skip: "done-or-changed", type: "homeworkDue" };
      const { messages } = await studentMessages(homework.studentId, { due: refs.due, task: homework.task || homework.worksheetTitle, teacher: clean(homework.teacherName, 120) }, { homework: true });
      return { type: "homeworkDue", messages };
    }
    if (job.kind === "homeworkChecked") {
      if (!enabled("homeworkChecked")) return { skip: "disabled", type: "homeworkChecked" };
      const work = await docData(refs.collection === "exerciseResults" ? "exerciseResults" : "worksheetAssignments", refs.docId);
      if (!work || work.reviewStatus !== "reviewed") return { skip: "not-reviewed", type: "homeworkChecked" };
      const { messages } = await studentMessages(work.studentId, {
        title: clean(work.lessonTitle || work.exerciseTitle || work.worksheetDoc?.meta?.title || work.title || "Kodutöö", 160),
        grade: work.teacherGrade ?? "", feedback: clean(work.teacherFeedback, 1200), teacher: clean(work.reviewedByName, 120),
      }, { homework: true });
      return { type: "homeworkChecked", messages };
    }
    if (job.kind === "announcement") {
      if (!enabled("announcement")) return { skip: "disabled", type: "announcement" };
      const raw = await docData("announcements", refs.announcementId);
      const announcement = raw ? normalizeAnnouncement(raw.id, raw) : null;
      if (!announcement || !announcementActive(announcement, today)) return { skip: "not-active", type: "announcement" };
      const studentsSnap = await db.collection("students").get();
      const students = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((card) => cardMatches(announcement, card));
      const users = await accountsFor(students.flatMap((card) => [...studentUidsOf(card), ...parentUidsOf(card)]));
      const targets = allTargets(announcement, students, users);
      const answered = await db.collection("announcementResponses").where("announcementId", "==", announcement.id).get();
      const answeredKeys = new Set(answered.docs.map((doc) => doc.data().targetKey));
      const messages = [];
      for (const target of targets.filter((item) => !answeredKeys.has(item.key))) {
        for (const uid of target.uids) {
          const email = core.normEmail(users.get(uid)?.email);
          if (!core.validEmail(email) || messages.some((message) => message.email === email)) continue;
          messages.push({ key: `${target.key}|${core.emailHash(email)}`, email, audience: target.kind, profileLanguage: clean(target.kind === "student" ? students.find((card) => card.id === target.studentId)?.preferredLanguage : users.get(uid)?.preferredLanguage, 4), data: { title: announcement.title, body: announcement.body, studentName: target.studentName } });
        }
      }
      return { type: "announcement", messages };
    }
    return { skip: "unknown-kind", type: job.kind };
  }

  // ── sending ────────────────────────────────────────────────────────────────────────────────────────────────────

  async function preferencesFor(emails) {
    const map = new Map();
    const unique = [...new Set(emails)];
    for (let index = 0; index < unique.length; index += 300) {
      const part = unique.slice(index, index + 300);
      const snaps = await db.getAll(...part.map((email) => db.collection(PREFS).doc(core.emailHash(email))));
      snaps.forEach((snap, position) => map.set(part[position], snap.exists ? snap.data() : {}));
    }
    return map;
  }

  function oneClickUrl(token) {
    const base = clean(process.env.LEARNER_EMAIL_ONE_CLICK_URL || "https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi/email-preferences/one-click", 300);
    return `${base}?t=${encodeURIComponent(token)}`;
  }

  async function finish(ref, job, status, extra) {
    const final = { status, finishedAt: now().toISOString(), ...extra };
    await ref.update(final);
    await log({ kind: extra.type || job.kind, jobKind: job.kind, jobId: ref.id, refs: job.refs || {}, status, reason: extra.reason || "", recipientCount: extra.recipientCount || 0, optedOut: extra.optedOut || 0 });
  }

  // → messages sent from this job (stops when the tick budget is used up; the job then stays pending)
  async function processJob(ref, job, settings, budget) {
    const plan = await planJob(job, settings);
    if (plan.skip) {
      await finish(ref, job, "skipped", { type: plan.type, reason: plan.skip });
      return { sent: 0, finished: true };
    }
    const done = new Set(job.done || []);
    const prefs = await preferencesFor(plan.messages.map((message) => message.email));
    const optedOut = plan.messages.filter((message) => prefs.get(message.email)?.optOut === true);
    const open = plan.messages.filter((message) => !done.has(message.key) && prefs.get(message.email)?.optOut !== true);
    let sent = 0;
    const key = open.length ? await tokenKey() : "";
    for (const message of open) {
      if (sent >= budget) return { sent, finished: false };
      const token = core.preferenceToken(message.email, key);
      const mail = core.composeLearnerEmail(plan.type, message.data, {
        settings, language: core.languageFor(prefs.get(message.email), message.profileLanguage), prefsUrl: core.preferencesUrl(token), oneClickUrl: oneClickUrl(token),
      });
      try {
        if (sent > 0 && pauseMs) await sleep(pauseMs);
        await deliver({ ...mail, to: message.email }, { kind: `learner-${plan.type}`, jobId: ref.id });
      } catch (error) {
        const attempts = (Number(job.attempts) || 0) + 1;
        const detail = clean(error?.detail || error?.message || error, 300);
        if (attempts >= core.MAX_ATTEMPTS) await finish(ref, { ...job, done: [...done] }, "failed", { type: plan.type, reason: detail, recipientCount: done.size, attempts });
        else await ref.update({ attempts, lastError: detail, sendAfter: minutesFrom(now(), RETRY_MINUTES) });
        return { sent, finished: attempts >= core.MAX_ATTEMPTS, error: detail };
      }
      done.add(message.key);
      sent++;
      await ref.update({ done: [...done], type: plan.type });
    }
    const delivered = plan.messages.filter((message) => done.has(message.key)).length;
    await finish(ref, job, delivered ? "sent" : "skipped", {
      type: plan.type, reason: delivered ? "" : plan.messages.length ? "opted-out" : "no-email", recipientCount: delivered, optedOut: optedOut.length,
    });
    return { sent, finished: true };
  }

  async function processDue(settings, budget = maxPerTick) {
    const nowIso = now().toISOString();
    const snap = await jobs().where("status", "==", "pending").limit(500).get();
    const due = snap.docs.filter((doc) => clean(doc.data().sendAfter, 40) <= nowIso)
      .sort((a, b) => clean(a.data().sendAfter, 40).localeCompare(clean(b.data().sendAfter, 40)));
    const out = { due: due.length, sent: 0, finished: 0, errors: 0 };
    for (const doc of due) {
      if (out.sent >= budget) break;
      const result = await processJob(doc.ref, doc.data(), settings, budget - out.sent);
      out.sent += result.sent;
      if (result.finished) out.finished++;
      if (result.error) out.errors++;
    }
    return out;
  }

  // one tick at a time (a slow SMTP run must not overlap the next tick)
  async function withLease(work) {
    const ref = db.collection(RUNS).doc("lease");
    const until = new Date(now().getTime() + LEASE_SECONDS * 1000).toISOString();
    const taken = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      if (snap.exists && clean(snap.data().until, 40) > now().toISOString()) return false;
      transaction.set(ref, { until });
      return true;
    });
    if (!taken) return { busy: true };
    try { return await work(); } finally { await ref.set({ until: "" }); }
  }

  async function tick() {
    const settings = await loadSettings();
    if (!core.anyEnabled(settings)) return { off: true };
    return withLease(async () => {
      const out = {};
      if (settings.types.lessonReminder.enabled) out.lessonReminder = await runDaily("lessonReminder", settings, selectLessonReminders);
      if (settings.types.homeworkDue.enabled) out.homeworkDue = await runDaily("homeworkDue", settings, selectHomeworkDue);
      out.announcements = await queueAnnouncements(settings);
      out.processed = await processDue(settings);
      return out;
    });
  }

  // ── the recipient's own preferences (CRM page /e-kirjad/<token>, no login) ─────────────────────────────────────

  async function preferenceAddress(token) {
    const email = core.verifyPreferenceToken(token, await tokenKey());
    if (!email) { const error = new Error("Link ei kehti."); error.status = 400; throw error; }
    return email;
  }

  async function preferenceStatus(token) {
    const email = await preferenceAddress(token);
    const snap = await db.collection(PREFS).doc(core.emailHash(email)).get();
    const data = snap.exists ? snap.data() : {};
    return { email: core.maskEmail(email), optOut: data.optOut === true, language: ["et", "ru", "both"].includes(data.language) ? data.language : "both" };
  }

  async function savePreferences(token, { optOut, language } = {}, source = "page") {
    const email = await preferenceAddress(token);
    const value = { optOut: optOut === true, updatedAt: now().toISOString(), source };
    if (["et", "ru", "both"].includes(language)) value.language = language;
    await db.collection(PREFS).doc(core.emailHash(email)).set(value, { merge: true });
    await log({ kind: "preferences", jobKind: "preferences", jobId: "", refs: {}, status: value.optOut ? "opt-out" : "opt-in", reason: source, recipientCount: 0, optedOut: value.optOut ? 1 : 0 });
    return preferenceStatus(token);
  }

  // ── Seaded: preview and a test e-mail to the administrator ─────────────────────────────────────────────────────

  async function preview(type, { language = "both", overrides = null } = {}) {
    if (!core.TYPES.includes(type)) { const error = new Error("Unknown type"); error.status = 400; throw error; }
    const stored = await loadSettings();
    const settings = overrides ? core.normalizeSettings({ ...stored, ...overrides, types: { ...stored.types, ...(overrides.types || {}) } }) : stored;
    return core.composeLearnerEmail(type, core.sampleData(type), { settings, language: ["et", "ru", "both"].includes(language) ? language : "both", prefsUrl: `${core.CRM_URL}/e-kirjad/naidis` });
  }

  async function sendTest(type, toEmail, options = {}) {
    if (!core.validEmail(toEmail)) { const error = new Error("Administraatori e-posti aadress puudub."); error.status = 400; throw error; }
    const mail = await preview(type, options);
    await deliver({ ...mail, subject: `[PROOV] ${mail.subject}`, to: core.normEmail(toEmail) }, { kind: `learner-${type}-test` });
    await log({ kind: type, jobKind: "test", jobId: "", refs: {}, status: "test", reason: "", recipientCount: 1, optedOut: 0 });
    return { sent: true };
  }

  return { loadSettings, tokenKey, onScheduleWrite, onReviewWrite, queuePlannerBatch, runDaily, selectLessonReminders, selectHomeworkDue, queueAnnouncements, planJob, processJob, processDue, tick, preferenceStatus, savePreferences, preview, sendTest };
}

module.exports = { createLearnerEmailService, JOBS, RUNS, PREFS, LOG };
