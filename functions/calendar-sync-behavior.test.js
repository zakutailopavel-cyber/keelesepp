const test = require("node:test");
const assert = require("node:assert/strict");
const proxyquire = require("proxyquire");

const dbMock = {
  collection: (colName) => ({
    doc: (docId) => ({
      get: async () => ({ exists: true, data: () => ({}) }),
      set: async () => {},
      delete: async () => {}
    }),
    where: () => ({
      get: async () => ({ empty: true, docs: [] })
    })
  })
};

const adminMock = {
  initializeApp: () => {},
  firestore: () => dbMock
};

const index = proxyquire("./index.js", {
  "firebase-admin": adminMock
});

const { syncScheduleRecordToGoogle } = index;
const { scheduleSyncFingerprint } = require("./calendar-sync-core");

test("syncScheduleRecordToGoogle bypasses retry if hash matches and status is error, unless retryErrors is true", async () => {
  const after = {
    teacherUid: "teacher_1",
    studentId: "student_1",
    date: "2026-08-01",
    time: "10:00",
    duration: 60,
    status: "Planeeritud",
    source: "keelesepp",
    gcalEventId: "some-event-id",
    gcalCalId: "primary",
    gcalSyncStatus: "error",
  };

  const syncHash = scheduleSyncFingerprint("schedule_1", after, "Europe/Tallinn");
  after.gcalSyncAttemptHash = syncHash;
  after.gcalSyncHash = "old_hash";

  const resultSkip = await syncScheduleRecordToGoogle("schedule_1", null, after);
  assert.equal(resultSkip.skipped, "already_synchronized");

  const connectionOverride = {
    connected: true,
    refreshToken: "token",
    writeEnabled: true
  };

  const calendarOverride = {
    events: {
      patch: async () => ({ data: { id: "mocked" } }),
      insert: async () => ({ data: { id: "mocked" } }),
    }
  };

  const resultRetry = await syncScheduleRecordToGoogle("schedule_1", null, after, { retryErrors: true, connectionOverride, calendarOverride });
  assert.notEqual(resultRetry.skipped, "already_synchronized");
  assert.equal(resultRetry.synced, true);
});

test("syncScheduleRecordToGoogle falls back to listGoogleCalendarEvents using privateExtendedProperty instead of q", async () => {
  const after = {
    teacherUid: "teacher_1",
    studentId: "student_1",
    date: "2026-08-01",
    time: "10:00",
    duration: 60,
    status: "Planeeritud",
    source: "keelesepp",
    // intentionally omit gcalEventId so it falls back to list
  };

  const connectionOverride = {
    connected: true,
    refreshToken: "token",
    writeEnabled: true
  };

  let listParams = null;
  const calendarOverride = {
    events: {
      list: async (params) => {
        listParams = params;
        return { data: { items: [] } };
      },
      insert: async () => ({ data: { id: "mocked" } }),
    }
  };

  await syncScheduleRecordToGoogle("schedule_test_2", null, after, { force: true, connectionOverride, calendarOverride });

  assert.ok(listParams);
  assert.equal(listParams.privateExtendedProperty, "keeleseppScheduleId=schedule_test_2");
  assert.equal(listParams.q, undefined);
});

test("syncScheduleRecordToGoogle soft deletion failure queues to outbox instead of throwing", async () => {
  const after = {
    teacherUid: "teacher_1",
    studentId: "student_1",
    date: "2026-08-01",
    time: "10:00",
    duration: 60,
    status: "Tühistatud", // Soft deletion
    source: "keelesepp",
    gcalEventId: "existing-event",
    gcalCalId: "primary"
  };

  const connectionOverride = {
    connected: true,
    refreshToken: "token",
    writeEnabled: true
  };

  const calendarOverride = {
    events: {
      delete: async () => {
        const err = new Error("Rate limit exceeded");
        err.code = 429;
        throw err;
      }
    }
  };

  let outboxQueued = false;
  let statusUpdate = null;

  const customDbMock = {
    collection: (colName) => ({
      doc: (docId) => ({
        get: async () => ({ exists: true, data: () => ({}) }),
        set: async (data) => {
          if (colName === "calendarSyncOutbox") outboxQueued = true;
          if (colName === "schedule" && docId === "schedule_test_3") {
            statusUpdate = data;
          }
        },
        delete: async () => {}
      }),
      where: () => ({
        get: async () => ({ empty: true, docs: [] })
      })
    })
  };

  adminMock.firestore = () => customDbMock;
  const indexCustom = proxyquire("./index.js", { "firebase-admin": adminMock });
  const syncFunc = indexCustom.syncScheduleRecordToGoogle;

  const result = await syncFunc("schedule_test_3", null, after, { force: true, connectionOverride, calendarOverride });

  assert.equal(outboxQueued, true);
  assert.equal(result.cancelled, true);
  assert.equal(statusUpdate.gcalSyncStatus, "cancelled");
  // Should NOT throw an error

  // reset mock
  adminMock.firestore = () => dbMock;
});
