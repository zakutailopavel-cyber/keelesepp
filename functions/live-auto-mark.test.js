"use strict";
// Live Classroom → server-side „Tund toimus” (live-auto-mark-core.js / live-auto-mark.js): the same record as the
// calendar's manual mark, idempotent, only a linked 1:1 occurrence, never in a closed period, never for a group.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const core = require("./live-auto-mark-core");
const { autoMarkClosedRoom } = require("./live-auto-mark");

// a tiny in-memory Firestore: doc refs, two-field equality queries, transactions (reads before writes)
function fakeDb(seed = {}) {
  const store = new Map(Object.entries(seed));
  let auto = 0;
  const docRef = (path) => ({ path, id: path.split("/").pop() });
  const snap = (path) => ({ exists: store.has(path), id: path.split("/").pop(), data: () => (store.has(path) ? { ...store.get(path) } : undefined) });
  const query = (name, filters = []) => ({
    where: (field, op, value) => query(name, [...filters, [field, value]]),
    get: async () => ({ docs: [...store.entries()].filter(([path, data]) => path.startsWith(`${name}/`) && path.split("/").length === 2 && filters.every(([field, value]) => data[field] === value)).map(([path]) => snap(path)) }),
    isQuery: true,
  });
  const db = {
    store,
    collection: (name) => ({ doc: (id) => docRef(`${name}/${id || `auto${++auto}`}`), where: (field, op, value) => query(name, [[field, value]]) }),
    runTransaction: async (fn) => {
      const writes = [];
      const transaction = {
        get: async (target) => (target.isQuery ? target.get() : snap(target.path)),
        set: (ref, data, options) => { writes.push([ref.path, data, options]); },
      };
      const result = await fn(transaction);
      writes.forEach(([path, data, options]) => store.set(path, options?.merge ? { ...(store.get(path) || {}), ...data } : data));
      return result;
    },
  };
  return db;
}

const DAY = "2026-11-03"; // a Tuesday
const entry = { studentId: "s1", studentName: "Mia", teacher: "Anna", teacherUid: "t1", date: DAY, time: "10:00", duration: 45, recurring: false, status: "Planeeritud", subject: "Eesti keel" };
const closing = (extra = {}) => ({
  before: { status: "accepted", studentId: "s1", teacherUid: "t1", roomKey: "inv1" },
  after: { status: "closed", endMark: "held", studentId: "s1", studentName: "Mia", teacherUid: "t1", teacherName: "Anna", roomKey: "inv1", scheduleId: "e1", occurrenceDate: DAY, respondedAt: "2026-11-03T08:02:00.000Z", ...extra },
});
const seed = (extra = {}) => ({ "schedule/e1": { ...entry }, "students/s1": { name: "Mia", active: true }, ...extra });
const NOW = new Date("2026-11-03T09:00:00.000Z");

test("marks the linked lesson with the calendar's own id and accounting fields", async () => {
  const db = fakeDb(seed({ "lessonSummaries/inv1": { note: "Tubli töö" } }));
  const result = await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing(), now: NOW });
  const lessonId = "schedule_e1_2026-11-03_s1";
  assert.deepEqual(result, { status: "marked", reason: "", lessonId });
  assert.equal(core.lessonDocumentId("e1", DAY, "s1"), lessonId);
  const record = db.store.get(`lessons/${lessonId}`);
  assert.deepEqual(record, {
    scheduleId: "e1", occurrenceDate: DAY, studentId: "s1", studentName: "Mia", teacher: "Anna", teacherUid: "t1", subject: "Eesti keel",
    topic: "", topicLevel: "", topicModule: "", topicLessonId: "", notes: "Tubli töö", date: DAY, time: "10:00", duration: 45,
    status: "Toimunud", accountingSource: "crm_v2", createdAt: NOW.toISOString(), createdByUid: "t1", createdByName: "Anna",
    liveAutoMarked: true, liveInvitationId: "inv1",
  });
  // a one-off lesson's calendar status follows, like completeFromSchedule
  assert.equal(db.store.get("schedule/e1").status, "Toimunud");
  const log = [...db.store.entries()].find(([path]) => path.startsWith("activityLog/"))[1];
  assert.equal(log.type, "lesson.completed");
  assert.equal(log.meta.lessonId, lessonId);
});

test("idempotent: a second run (or a manual mark first) writes nothing", async () => {
  const db = fakeDb(seed());
  await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing(), now: NOW });
  const size = db.store.size;
  const again = await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing(), now: NOW });
  assert.equal(again.status, "skipped");
  // the one-off lesson's calendar status is „Toimunud” now, so it is not planned any more; a series stops on the id
  assert.ok(["already-marked", "not-planned"].includes(again.reason));
  assert.equal(db.store.size, size);
  const series = fakeDb(seed({ "schedule/e1": { ...entry, recurring: true, day: "Tue", startDate: DAY } }));
  await autoMarkClosedRoom({ db: series, invitationId: "inv1", ...closing(), now: NOW });
  assert.equal((await autoMarkClosedRoom({ db: series, invitationId: "inv1", ...closing(), now: NOW })).reason, "already-marked");
  // an older record of that student that day for this lesson (another id) also counts
  const other = fakeDb(seed({ "lessons/old": { scheduleId: "e1", studentId: "s1", date: DAY, status: "Puudus_p" } }));
  assert.equal((await autoMarkClosedRoom({ db: other, invitationId: "inv1", ...closing(), now: NOW })).reason, "already-marked");
});

test("a closed financial period, an archived card: nothing is written", async () => {
  const locked = fakeDb(seed({ [`financialLockedDates/${DAY}`]: { date: DAY } }));
  assert.deepEqual(await autoMarkClosedRoom({ db: locked, invitationId: "inv1", ...closing(), now: NOW }), { status: "skipped", reason: "period-closed" });
  assert.ok(![...locked.store.keys()].some((path) => path.startsWith("lessons/")));
  const archived = fakeDb(seed({ "students/s1": { name: "Mia", active: false } }));
  assert.equal((await autoMarkClosedRoom({ db: archived, invitationId: "inv1", ...closing(), now: NOW })).reason, "student-archived");
});

test("never for a group room, never when the teacher unticked „märgi”, never outside the close", async () => {
  const db = fakeDb(seed());
  assert.equal((await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing({ roomKey: "group-room-7" }), now: NOW })).reason, "group");
  assert.equal((await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing({ endMark: "skip" }), now: NOW })).reason, "teacher-skipped");
  // an older client without endMark: the calendar's own handoff marks (with the room's attendance), not the server
  assert.equal((await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing({ endMark: undefined }), now: NOW })).reason, "no-end-mark");
  const { before, after } = closing();
  assert.equal((await autoMarkClosedRoom({ db, invitationId: "inv1", before: after, after, now: NOW })).reason, "not-closing");
  assert.equal((await autoMarkClosedRoom({ db, invitationId: "inv1", before, after: { ...after, status: "cancelled" }, now: NOW })).reason, "not-closing");
  // a group calendar entry is never marked even when linked
  const groupDb = fakeDb(seed({ "schedule/e1": { ...entry, isGroup: true } }));
  assert.equal((await autoMarkClosedRoom({ db: groupDb, invitationId: "inv1", ...closing(), now: NOW })).reason, "no-link");
  assert.ok(![...db.store.keys(), ...groupDb.store.keys()].some((path) => path.startsWith("lessons/")));
});

test("not linked: the student's one planned lesson with this teacher within ±3 h is found; two or none → nothing", async () => {
  const unlinked = { scheduleId: undefined, occurrenceDate: undefined };
  const db = fakeDb(seed());
  const result = await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing(unlinked), now: NOW });
  assert.equal(result.status, "marked"); // 08:02Z = 10:02 in Tallinn, lesson at 10:00
  const two = fakeDb(seed({ "schedule/e2": { ...entry, time: "11:00" } }));
  assert.equal((await autoMarkClosedRoom({ db: two, invitationId: "inv1", ...closing(unlinked), now: NOW })).reason, "ambiguous");
  const far = fakeDb(seed({ "schedule/e1": { ...entry, time: "18:00" } }));
  assert.equal((await autoMarkClosedRoom({ db: far, invitationId: "inv1", ...closing(unlinked), now: NOW })).reason, "no-link");
  const otherTeacher = fakeDb(seed({ "schedule/e1": { ...entry, teacherUid: "t2" } }));
  assert.equal((await autoMarkClosedRoom({ db: otherTeacher, invitationId: "inv1", ...closing(unlinked), now: NOW })).reason, "no-link");
});

test("a weekly series: the occurrence of that day, excluded dates and cancelled occurrences are not marked", async () => {
  const series = { ...entry, recurring: true, day: "Tue", startDate: "2026-10-06", date: "2026-10-06" };
  const db = fakeDb(seed({ "schedule/e1": series }));
  assert.equal((await autoMarkClosedRoom({ db, invitationId: "inv1", ...closing(), now: NOW })).status, "marked");
  // the series' own status is not overwritten (only a one-off lesson's)
  assert.equal(db.store.get("schedule/e1").status, "Planeeritud");
  const excluded = fakeDb(seed({ "schedule/e1": { ...series, excludedDates: [DAY] } }));
  assert.equal((await autoMarkClosedRoom({ db: excluded, invitationId: "inv1", ...closing(), now: NOW })).reason, "not-planned");
  const cancelled = fakeDb(seed({ "schedule/e1": { ...series, occurrenceStatuses: { [DAY]: { status: "Tühistatud" } } } }));
  assert.equal((await autoMarkClosedRoom({ db: cancelled, invitationId: "inv1", ...closing(), now: NOW })).reason, "not-planned");
});

test("occurrence rules match the calendar's", () => {
  assert.equal(core.occursOn({ recurring: true, startDate: "2026-11-02", day: "Mon" }, "2026-11-09"), true);
  assert.equal(core.occursOn({ recurring: true, startDate: "2026-11-02", day: "Mon", endDate: "2026-11-08" }, "2026-11-09"), false);
  assert.equal(core.statusOn({ recurring: true, status: "Toimunud", lessonOccurrenceDate: "2026-11-02" }, "2026-11-09"), "Planeeritud");
  assert.deepEqual(core.tallinnLocal("2026-11-03T08:02:00.000Z"), { date: "2026-11-03", time: "10:02" });
});
