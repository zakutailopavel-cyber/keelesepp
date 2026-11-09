"use strict";

// Weekly „Märkimata tunnid” e-mail to teachers — loading, the weekly marker, sending (rules and texts:
// teacher-unmarked-digest-core.js). Run by index.js `weeklyUnmarkedLessonsDigest` (Mondays 08:00 Tallinn); the
// administrator switches it in Seaded (emailSettings/teacherDigest.weeklyUnmarked, no document = OFF) and can send
// himself a test copy (staffOperationsApi /teacher-digest/test).
//
// Per teacher and ISO week one marker teacherUnmarkedDigests/{uid}_{YYYY-Www} (server-only writes; the teacher reads his
// own for the bell notice). The marker is created before the e-mail goes out (create() fails if it exists), so two
// runs in the same week never send twice; only a failed send is tried again. A teacher without a verified address gets
// the marker (= the bell notice) with status „no-email”. Learners and parents are never read as recipients.
// Dry run (option `dryRun`, env TEACHER_DIGEST_DRY_RUN=1, or the functions emulator): computes and returns the plan,
// writes nothing and sends nothing.

const core = require("./teacher-unmarked-digest-core");

const MARKERS = "teacherUnmarkedDigests";
const SETTINGS = ["emailSettings", "teacherDigest"];
const SEND_PAUSE_MS = 400;
const LESSON_LOOKBACK_EXTRA_DAYS = 31; // a mark written with a later `date` than its occurrence still counts

const alreadyExists = (error) => error?.code === 6 || /already exists/i.test(String(error?.message || ""));

function envDryRun(env = process.env) {
  return env.TEACHER_DIGEST_DRY_RUN === "1" || env.TEACHER_DIGEST_DRY_RUN === "true" || env.FUNCTIONS_EMULATOR === "true";
}

function createTeacherDigestService({ db, auth, deliver, now = () => new Date(), sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), pauseMs = SEND_PAUSE_MS, env = process.env }) {
  async function loadSettings() {
    const snap = await db.collection(SETTINGS[0]).doc(SETTINGS[1]).get();
    return core.normalizeDigestSettings(snap.exists ? snap.data() : {});
  }

  async function saveSettings({ weeklyUnmarked }, actor = {}) {
    const record = {
      weeklyUnmarked: weeklyUnmarked === true,
      updatedAt: now().toISOString(),
      updatedBy: String(actor.uid || ""),
      updatedByName: String(actor.name || "").slice(0, 120),
    };
    await db.collection(SETTINGS[0]).doc(SETTINGS[1]).set(record);
    await db.collection("activityLog").add({
      type: "settings.teacher_unmarked_digest",
      label: `Õpetajatele iganädalane märkimata tundide kiri: ${record.weeklyUnmarked ? "sees" : "väljas"}`,
      byUid: record.updatedBy, byName: record.updatedByName || "Administraator",
      createdAt: record.updatedAt, date: core.tallinnDate(now()),
    });
    return core.normalizeDigestSettings(record);
  }

  // Auth records of the teachers (verified address, signed claims), 100 at a time
  async function authRecords(uids) {
    const byId = new Map();
    for (let index = 0; index < uids.length; index += 100) {
      const result = await auth.getUsers(uids.slice(index, index + 100).map((uid) => ({ uid })));
      result.users.forEach((record) => byId.set(record.uid, { email: record.email || "", emailVerified: record.emailVerified === true, customClaims: record.customClaims || {} }));
    }
    return byId;
  }

  // everything one run needs: the teachers, the year's unmarked lessons, the students' names and subjects
  async function load(today) {
    const days = core.daysSinceCutoff(today);
    const from = core.addDays(today, -days);
    const dates = Array.from({ length: days }, (_, index) => core.addDays(today, -(index + 1)));
    const [usersSnap, scheduleSnap, lessonsSnap, studentsSnap, lockedSnaps] = await Promise.all([
      db.collection("users").where("role", "in", ["admin", "teacher"]).get(),
      db.collection("schedule").get(),
      db.collection("lessons").where("date", ">=", core.addDays(from, -LESSON_LOOKBACK_EXTRA_DAYS)).get(),
      db.collection("students").get(),
      dates.length ? db.getAll(...dates.map((date) => db.collection("financialLockedDates").doc(date))) : [],
    ]);
    const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const teachers = core.digestTeachers(users, await authRecords(users.map((user) => user.id)));
    const students = new Map(studentsSnap.docs.map((doc) => {
      const data = doc.data();
      return [doc.id, {
        name: data.name || "", subject: data.subject || "", enrollments: Array.isArray(data.enrollments) ? data.enrollments : [],
        active: data.active, deletedAt: data.deletedAt || "", purgedAt: data.purgedAt || "", mergedIntoStudentId: data.mergedIntoStudentId || "",
      }];
    }));
    const lockedDates = new Set(lockedSnaps.filter((snap) => snap.exists).map((snap) => snap.id));
    const all = core.unmarkedOccurrences({
      schedule: scheduleSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lessons: lessonsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      today,
      days,
    });
    const items = core.countableUnmarked(all, { today, students, lockedDates });
    return { teachers, items, students };
  }

  function plan({ teachers, items, students }, today) {
    return teachers.map((teacher) => ({ teacher, digest: core.buildDigest(core.lessonsOfTeacher(items, teacher), { students }) }));
  }

  // the Monday run. Returns counts only (no addresses, no names) — they go to the function log and activityLog.
  async function run({ dryRun = envDryRun(env), force = false } = {}) {
    const at = now();
    const today = core.tallinnDate(at);
    const week = core.isoWeekId(today);
    const settings = await loadSettings();
    if (!settings.weeklyUnmarked && !force) return { off: true, week };
    const loaded = await load(today);
    const plans = plan(loaded, today);
    const result = { week, dryRun, teachers: plans.length, withLessons: 0, zero: 0, sent: 0, failed: 0, noEmail: 0, already: 0, lessons: 0 };
    const preview = [];
    for (const { teacher, digest } of plans) {
      if (!digest.total) { result.zero++; continue; }
      result.withLessons++;
      result.lessons += digest.total;
      if (dryRun) {
        preview.push({ uid: teacher.uid, email: teacher.email, total: digest.total, mail: teacher.email ? core.composeDigestEmail({ teacher, digest }) : null });
        continue;
      }
      const outcome = await sendOne(teacher, digest, week, at);
      result[outcome]++;
      if (outcome === "sent" && pauseMs) await sleep(pauseMs);
    }
    if (!dryRun) {
      await db.collection("activityLog").add({
        type: "system.teacher_unmarked_digest",
        label: `Märkimata tundide nädalakiri ${week}: ${result.sent} õpetajale saadetud`,
        byUid: "system", byName: "Süsteem",
        createdAt: at.toISOString(), date: today,
        meta: { ...result },
      });
      await db.collection("emailLog").add({ kind: "teacherUnmarkedWeekly", jobKind: "weekly", status: "done", recipientCount: result.sent, at: at.toISOString(), meta: { ...result } });
    }
    return dryRun ? { ...result, preview } : result;
  }

  // claim the week's marker, then send; returns „sent” | „failed” | „noEmail” | „already”
  async function sendOne(teacher, digest, week, at) {
    const ref = db.collection(MARKERS).doc(core.markerId(teacher.uid, week));
    const base = { teacherUid: teacher.uid, week, total: digest.total, createdAt: at.toISOString() };
    const claimed = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      const current = snap.exists ? snap.data() : null;
      if (!core.markerAllowsSend(current)) return null;
      const attempts = Number(current?.attempts || 0) + 1;
      const status = teacher.email ? "sending" : "no-email";
      transaction.set(ref, { ...base, status, attempts, updatedAt: at.toISOString() });
      return { status, attempts };
    }).catch((error) => { if (alreadyExists(error)) return null; throw error; });
    if (!claimed) return "already";
    if (claimed.status === "no-email") return "noEmail";
    try {
      const mail = core.composeDigestEmail({ teacher, digest });
      const delivery = await deliver({ ...mail, to: teacher.email }, { kind: "teacher-unmarked-weekly", teacherUid: teacher.uid, week });
      const status = delivery?.status === "skipped" ? "no-email" : "sent";
      await ref.update({ status, sentAt: new Date().toISOString(), provider: delivery?.provider || "" });
      return status === "sent" ? "sent" : "noEmail";
    } catch (error) {
      await ref.update({ status: "failed", error: String(error?.message || error).slice(0, 300), updatedAt: new Date().toISOString() });
      return "failed";
    }
  }

  // Seaded → „Saada mulle proovikiri”: what one teacher would get this week, to the administrator's own address only.
  // teacherUid empty = the teacher with the most unmarked lessons. Writes no marker.
  async function sendTest(adminEmail, { teacherUid = "" } = {}) {
    if (!core.validEmail(adminEmail)) { const error = new Error("Administraatori e-posti aadress puudub."); error.status = 400; throw error; }
    const today = core.tallinnDate(now());
    const plans = plan(await load(today), today);
    const chosen = teacherUid
      ? plans.find((item) => item.teacher.uid === teacherUid)
      : [...plans].sort((a, b) => b.digest.total - a.digest.total)[0];
    if (!chosen) { const error = new Error("Õpetajat ei leitud."); error.status = 404; throw error; }
    if (!chosen.digest.total) return { sent: false, teacherName: chosen.teacher.name, total: 0 };
    const mail = core.composeDigestEmail({ teacher: chosen.teacher, digest: chosen.digest });
    await deliver({ ...mail, subject: `[PROOV · ${chosen.teacher.name}] ${mail.subject}`, to: core.normEmail(adminEmail) }, { kind: "teacher-unmarked-weekly-test" });
    await db.collection("emailLog").add({ kind: "teacherUnmarkedWeekly", jobKind: "test", status: "test", recipientCount: 1, at: now().toISOString() });
    return { sent: true, teacherName: chosen.teacher.name, total: chosen.digest.total };
  }

  return { loadSettings, saveSettings, load, plan, run, sendOne, sendTest };
}

module.exports = { createTeacherDigestService, envDryRun, MARKERS, SETTINGS };
