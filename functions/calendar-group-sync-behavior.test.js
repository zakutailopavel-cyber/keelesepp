const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");

process.env.FIREBASE_CONFIG = '{"projectId": "test-project"}';
process.env.GCLOUD_PROJECT = "test-project";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/dev/null";

const index = rewire("./index.js");
const syncGroupToGoogle = index.__get__("syncGroupToGoogle");
const groupCalendarSignature = index.__get__("groupCalendarSignature");
const calendarReturnUrl = index.__get__("calendarReturnUrl");

// Small in-memory Firestore: enough for doc get/set/delete and single equality queries.
function memoryDb(initial = {}) {
  const store = new Map(Object.entries(initial).map(([name, docs]) => [name, new Map(Object.entries(docs))]));
  const col = name => {
    if (!store.has(name)) store.set(name, new Map());
    return store.get(name);
  };
  const docRef = (name, id) => ({
    id,
    get: async () => ({ id, exists: col(name).has(id), data: () => col(name).get(id) }),
    set: async (data, options = {}) => {
      col(name).set(id, options.merge ? { ...(col(name).get(id) || {}), ...data } : { ...data });
    },
    delete: async () => { col(name).delete(id); },
  });
  return {
    store,
    collection: name => ({
      doc: id => docRef(name, id),
      where: (field, op, value) => ({
        get: async () => {
          const docs = [...col(name).entries()]
            .filter(([, data]) => data[field] === value)
            .map(([id, data]) => ({ id, ref: docRef(name, id), data: () => data }));
          return { empty: !docs.length, docs };
        },
      }),
    }),
  };
}

function fakeCalendar() {
  const calls = [];
  let counter = 0;
  return {
    calls,
    events: {
      list: async () => ({ data: { items: [] } }),
      insert: async ({ requestBody }) => { calls.push(["insert", requestBody.start.dateTime]); return { data: { id: `ev${++counter}` } }; },
      patch: async ({ eventId, requestBody }) => { calls.push(["patch", eventId, requestBody.start.dateTime]); return { data: { id: eventId } }; },
      delete: async ({ eventId }) => { calls.push(["delete", eventId]); return {}; },
    },
  };
}

const writable = { connected: true, refreshToken: "token", writeEnabled: true };
const group = {
  name: "B1",
  teacherUid: "t1",
  lessons: [
    { id: "l1", day: "Tue", time: "18:00", duration: 60, recurring: true, startDate: "2026-10-01" },
    { id: "l2", day: "Thu", time: "18:00", duration: 60, recurring: true, startDate: "2026-10-01" },
  ],
};

test("a group's lessons are created once, then only changed lessons are patched", async () => {
  const db = memoryDb();
  index.__set__("db", db);
  const calendar = fakeCalendar();
  const options = () => ({ connections: new Map([["t1", writable]]), calendars: new Map([["t1", calendar]]) });

  const first = await syncGroupToGoogle("g1", group, options());
  assert.equal(first.synced, 2);
  assert.deepEqual(calendar.calls.map(call => call[0]), ["insert", "insert"]);
  assert.equal(db.store.get("calendarGroupEventLinks").get("g1__l1").eventId, "ev1");

  calendar.calls.length = 0;
  const unchanged = await syncGroupToGoogle("g1", group, options());
  assert.equal(unchanged.synced, 0);
  assert.equal(calendar.calls.length, 0);

  const moved = { ...group, lessons: [{ ...group.lessons[0], time: "19:00" }, group.lessons[1]] };
  await syncGroupToGoogle("g1", moved, options());
  assert.deepEqual(calendar.calls, [["patch", "ev1", "2026-10-06T19:00:00"]]);
});

test("a removed lesson and a switched-off setting delete the Google events", async () => {
  const db = memoryDb();
  index.__set__("db", db);
  const calendar = fakeCalendar();
  const options = (connection = writable) => ({ connections: new Map([["t1", connection]]), calendars: new Map([["t1", calendar]]) });
  await syncGroupToGoogle("g1", group, options());

  calendar.calls.length = 0;
  const oneLesson = { ...group, lessons: [group.lessons[0]] };
  const removed = await syncGroupToGoogle("g1", oneLesson, options());
  assert.equal(removed.removed, 1);
  assert.deepEqual(calendar.calls, [["delete", "ev2"]]);
  assert.equal(db.store.get("calendarGroupEventLinks").has("g1__l2"), false);

  calendar.calls.length = 0;
  await syncGroupToGoogle("g1", oneLesson, options({ ...writable, syncGroups: false }));
  assert.deepEqual(calendar.calls, [["delete", "ev1"]]);
  assert.equal(db.store.get("calendarGroupEventLinks").size, 0);
});

test("a group handed to another teacher leaves the old calendar and appears in the new one", async () => {
  const db = memoryDb();
  index.__set__("db", db);
  const oldCalendar = fakeCalendar();
  const newCalendar = fakeCalendar();
  const options = () => ({
    connections: new Map([["t1", writable], ["t2", writable]]),
    calendars: new Map([["t1", oldCalendar], ["t2", newCalendar]]),
  });
  const single = { ...group, lessons: [group.lessons[0]] };
  await syncGroupToGoogle("g1", single, options());
  await syncGroupToGoogle("g1", { ...single, teacherUid: "t2" }, options());
  assert.deepEqual(oldCalendar.calls.map(call => call[0]), ["insert", "delete"]);
  assert.deepEqual(newCalendar.calls.map(call => call[0]), ["insert"]);
  assert.equal(db.store.get("calendarGroupEventLinks").get("g1__l1").teacherUid, "t2");
});

test("without write access nothing is sent and existing links wait for a reconnect", async () => {
  const db = memoryDb({ calendarGroupEventLinks: { g1__l1: { groupId: "g1", lessonId: "l1", teacherUid: "t1", eventId: "ev9" } } });
  index.__set__("db", db);
  const calendar = fakeCalendar();
  const result = await syncGroupToGoogle("g1", null, {
    connections: new Map([["t1", { connected: true, refreshToken: "token", writeEnabled: false }]]),
    calendars: new Map([["t1", calendar]]),
  });
  assert.equal(result.skipped, 1);
  assert.equal(calendar.calls.length, 0);
  assert.equal(db.store.get("calendarGroupEventLinks").has("g1__l1"), true);
});

test("attendance marks do not change the group's calendar signature", () => {
  const marked = { ...group, lessons: [{ ...group.lessons[0], attendance: { s1_2026_10_06: { status: "coming" } } }, group.lessons[1]] };
  assert.equal(groupCalendarSignature(group), groupCalendarSignature(marked));
  assert.notEqual(groupCalendarSignature(group), groupCalendarSignature({ ...group, name: "B1+" }));
});

test("the OAuth callback returns to CRM v2 when it started there, else to v1", () => {
  assert.equal(calendarReturnUrl("connected", "https://crm.epkoolitus.ee/settings"), "https://crm.epkoolitus.ee/settings?gcal=connected");
  assert.equal(calendarReturnUrl("error", "https://evil.example/"), "https://www.epkoolitus.ee/haldus/?gcal=error");
  assert.equal(calendarReturnUrl("connected"), "https://www.epkoolitus.ee/haldus/?gcal=connected");
});
