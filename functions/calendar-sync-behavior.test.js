const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");

// Provide a mock admin to prevent firebase-admin from throwing on initialization
const mockAdmin = {
  initializeApp: () => {},
  firestore: () => {}
};

const mockFirebaseFunctions = {
  firestore: { document: () => ({ onWrite: () => {} }) },
  pubsub: { schedule: () => ({ timeZone: () => ({ onRun: () => {} }) }) },
  runWith: () => mockFirebaseFunctions,
  https: { onRequest: () => {}, onCall: () => {} }
};

// We intercept require('firebase-admin') globally using proxyquire, or we can just rewire variables.
// Rewire evaluates the file. To avoid initialization errors, we can use proxyquire first, then rewire.
// Wait, proxyquire returns the exported module.
// Let's just mock process.env variables so firebase-admin initializes a dummy app.
process.env.FIREBASE_CONFIG = '{"projectId": "test-project"}';
process.env.GCLOUD_PROJECT = "test-project";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/dev/null";

const index = rewire("./index.js");

index.__set__("admin", mockAdmin);
// We'll replace the internal db reference
const setDb = (dbMock) => {
  index.__set__("db", dbMock);
};

const syncScheduleRecordToGoogle = index.__get__("syncScheduleRecordToGoogle");
const flushCalendarSyncOutbox = index.__get__("flushCalendarSyncOutbox");
const queueGoogleEventDeletion = index.__get__("queueGoogleEventDeletion");
const { scheduleSyncFingerprint } = require("./calendar-sync-core");

const createDbMock = (overrides = {}) => {
  return {
    collection: (colName) => ({
      doc: (docId) => ({
        get: overrides.get || (async () => ({ exists: true, data: () => ({}) })),
        set: overrides.set || (async () => {}),
        delete: overrides.delete || (async () => {})
      }),
      where: overrides.where || (() => ({
        get: async () => ({ empty: true, docs: [] })
      }))
    }),
    batch: () => ({
      set: () => {},
      delete: () => {},
      commit: async () => {}
    })
  };
};

test("syncScheduleRecordToGoogle bypasses retry if hash matches and status is error, unless retryErrors is true", async () => {
  setDb(createDbMock());

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

test("syncScheduleRecordToGoogle calls events.patch and not events.insert if list returns an existing event", async () => {
  let patchCalled = false;
  let insertCalled = false;

  setDb(createDbMock());

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
        return { data: { items: [
          {
            id: "existing_managed_event_id",
            extendedProperties: {
              private: {
                keeleseppScheduleId: "schedule_test_2",
                keeleseppOrigin: "keelesepp"
              }
            }
          }
        ] } };
      },
      insert: async () => {
        insertCalled = true;
        return { data: { id: "inserted_id" } };
      },
      patch: async (params) => {
        patchCalled = true;
        assert.equal(params.eventId, "existing_managed_event_id");
        return { data: { id: "existing_managed_event_id" } };
      }
    }
  };

  const result = await syncScheduleRecordToGoogle("schedule_test_2", null, after, { force: true, connectionOverride, calendarOverride });

  assert.ok(listParams);
  assert.equal(listParams.privateExtendedProperty, "keeleseppScheduleId=schedule_test_2");
  assert.equal(listParams.q, undefined);

  assert.equal(patchCalled, true);
  assert.equal(insertCalled, false);
  assert.equal(result.eventId, "existing_managed_event_id");
});

test("syncScheduleRecordToGoogle soft deletion failure queues to outbox instead of throwing", async () => {
  const after = {
    teacherUid: "teacher_1",
    studentId: "student_1",
    date: "2026-08-01",
    time: "10:00",
    duration: 60,
    status: "Tühistatud",
    source: "keelesepp",
    gcalEventId: "existing-event",
    gcalCalId: "primary"
  };

  const connectionOverride = { connected: true, refreshToken: "token", writeEnabled: true };

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

  setDb(createDbMock({
    set: async (data, opts) => {
      // The function calls queueGoogleEventDeletion which writes to outbox
      // and it also writes to schedule. We can track those by checking fields.
      if (data.action === "delete" && data.eventId === "existing-event") {
        outboxQueued = true;
      }
      if (data.gcalSyncStatus === "cancelled") {
        statusUpdate = data;
      }
    }
  }));

  const result = await syncScheduleRecordToGoogle("schedule_test_3", null, after, { force: true, connectionOverride, calendarOverride });

  assert.equal(outboxQueued, true);
  assert.equal(result.cancelled, true);
  assert.equal(statusUpdate.gcalSyncStatus, "cancelled");
});

test("syncScheduleRecordToGoogle 404/410 deletion is treated as already deleted and not queued", async () => {
  const after = {
    teacherUid: "teacher_1",
    studentId: "student_1",
    date: "2026-08-01",
    time: "10:00",
    duration: 60,
    status: "Tühistatud",
    source: "keelesepp",
    gcalEventId: "gone-event",
    gcalCalId: "primary"
  };

  const connectionOverride = { connected: true, refreshToken: "token", writeEnabled: true };

  const calendarOverride = {
    events: {
      delete: async () => {
        const err = new Error("Not Found");
        err.code = 404;
        throw err;
      }
    }
  };

  let outboxQueued = false;

  setDb(createDbMock({
    set: async (data, opts) => {
      if (data.action === "delete") {
        outboxQueued = true;
      }
    }
  }));

  const result = await syncScheduleRecordToGoogle("schedule_test_4", null, after, { force: true, connectionOverride, calendarOverride });

  assert.equal(outboxQueued, false);
  assert.equal(result.cancelled, true);
});

test("flushCalendarSyncOutbox successfully removes outbox entry on retry", async () => {
  const connection = { connected: true, refreshToken: "token", writeEnabled: true };
  const calendarOverride = {
    events: {
      delete: async () => { return { data: {} }; }
    }
  };

  let docDeleted = false;

  setDb(createDbMock({
    where: () => ({
      get: async () => ({
        empty: false,
        docs: [{
          data: () => ({
            action: "delete",
            eventId: "queued-event",
            scheduleId: "schedule_test_5"
          }),
          ref: { delete: async () => { docDeleted = true; } }
        }]
      })
    }),
    get: async () => ({
      // Mocking the scheduleSnap
      exists: true,
      data: () => ({ status: "Tühistatud" })
    })
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 1);
  assert.equal(result.failed, 0);
  assert.equal(docDeleted, true);
});

test("flushCalendarSyncOutbox discards stale queued deletion if lesson is restored", async () => {
  const connection = { connected: true, refreshToken: "token", writeEnabled: true };
  let deleteApiCalled = false;
  const calendarOverride = {
    events: {
      delete: async () => { deleteApiCalled = true; }
    }
  };

  let docDeleted = false;

  setDb(createDbMock({
    where: () => ({
      get: async () => ({
        empty: false,
        docs: [{
          data: () => ({
            action: "delete",
            eventId: "stale-event",
            scheduleId: "schedule_restored"
          }),
          ref: { delete: async () => { docDeleted = true; } }
        }]
      })
    }),
    get: async () => ({
      // Mocking the scheduleSnap to show it's active again
      exists: true,
      data: () => ({ status: "Planeeritud" }) // NOT Tühistatud
    })
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 0);
  assert.equal(result.failed, 0);
  assert.equal(deleteApiCalled, false);
  assert.equal(docDeleted, true); // Stale entry should be deleted
});
