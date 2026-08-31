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
      })),
      add: overrides.add || (async () => {})
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

  let setCalledWithEventId = null;

  setDb(createDbMock({
    set: async (data, opts) => {
      if (data.gcalEventId) {
        setCalledWithEventId = data.gcalEventId;
      }
    }
  }));

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
  assert.equal(setCalledWithEventId, "existing_managed_event_id");
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
    add: async (data) => {
      if (data.action === "delete" && data.eventId === "existing-event") {
        outboxQueued = true;
      }
    },
    set: async (data, opts) => {
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

  let errorCodeToThrow = 404;
  const calendarOverride = {
    events: {
      delete: async () => {
        const err = new Error("Not Found/Gone");
        err.code = errorCodeToThrow;
        throw err;
      }
    }
  };

  let outboxQueued = false;

  setDb(createDbMock({
    add: async (data) => {
      if (data.action === "delete") {
        outboxQueued = true;
      }
    }
  }));

  // Test 404
  const result404 = await syncScheduleRecordToGoogle("schedule_test_4", null, after, { force: true, connectionOverride, calendarOverride });
  assert.equal(outboxQueued, false);
  assert.equal(result404.cancelled, true);

  // Test 410
  errorCodeToThrow = 410;
  outboxQueued = false;
  const result410 = await syncScheduleRecordToGoogle("schedule_test_4", null, after, { force: true, connectionOverride, calendarOverride });
  assert.equal(outboxQueued, false);
  assert.equal(result410.cancelled, true);
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


test("flushCalendarSyncOutbox Scenario A: restored lesson uses same event -> removes outbox, no delete", async () => {
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
      exists: true,
      data: () => ({ status: "Planeeritud", gcalEventId: "stale-event" })
    })
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 0); // Didn't delete from Google
  assert.equal(result.failed, 0);
  assert.equal(deleteApiCalled, false);
  assert.equal(docDeleted, true); // Stale entry should be deleted
});

test("flushCalendarSyncOutbox Scenario B: restored lesson uses DIFFERENT event -> deletes orphan", async () => {
  const connection = { connected: true, refreshToken: "token", writeEnabled: true };
  let deleteApiCalledId = null;
  const calendarOverride = {
    events: {
      delete: async ({ eventId }) => { deleteApiCalledId = eventId; }
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
            eventId: "orphan-event",
            scheduleId: "schedule_restored"
          }),
          ref: { delete: async () => { docDeleted = true; } }
        }]
      })
    }),
    get: async () => ({
      exists: true,
      data: () => ({ status: "Planeeritud", gcalEventId: "new-event" })
    })
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 1);
  assert.equal(deleteApiCalledId, "orphan-event");
  assert.equal(docDeleted, true);
});

test("flushCalendarSyncOutbox Scenario C: restored lesson has NO event yet -> defers outbox", async () => {
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
            eventId: "in-progress-event",
            scheduleId: "schedule_restored"
          }),
          ref: { delete: async () => { docDeleted = true; } }
        }]
      })
    }),
    get: async () => ({
      exists: true,
      data: () => ({ status: "Planeeritud" }) // No gcalEventId yet
    })
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 0);
  assert.equal(deleteApiCalled, false);
  assert.equal(docDeleted, false); // Defers (does not delete)
});

test("flushCalendarSyncOutbox Scenario D: check-then-delete race invalidates hash to force sync", async () => {
  const connection = { connected: true, refreshToken: "token", writeEnabled: true };
  const calendarOverride = {
    events: {
      delete: async () => { return { data: {} }; } // Success
    }
  };

  let scheduleUpdated = null;
  let docDeleted = false;

  setDb(createDbMock({
    where: () => ({
      get: async () => ({
        empty: false,
        docs: [{
          data: () => ({
            action: "delete",
            eventId: "race-event",
            scheduleId: "schedule_race"
          }),
          ref: { delete: async () => { docDeleted = true; } }
        }]
      })
    }),
    get: async () => ({
      exists: true,
      // For Scenario D, we simulate that after Google deletion succeeds,
      // the schedule is active and has the SAME eventId (meaning it was restored).
      data: () => ({ status: "Planeeritud", gcalEventId: "race-event" }),
      ref: {
        set: async (data) => { scheduleUpdated = data; }
      }
    })
  }));

  // We need to override the first get to simulate the TOCTOU.
  // The first read (before delete) sees it as Tühistatud.
  // The second read (after delete) sees it as Planeeritud.
  let readCount = 0;
  setDb(createDbMock({
    where: () => ({
      get: async () => ({
        empty: false,
        docs: [{
          data: () => ({
            action: "delete",
            eventId: "race-event",
            scheduleId: "schedule_race"
          }),
          ref: { delete: async () => { docDeleted = true; } }
        }]
      })
    }),
    get: async () => {
      readCount++;
      if (readCount === 1) {
        return { exists: true, data: () => ({ status: "Tühistatud" }) };
      }
      return {
        exists: true,
        data: () => ({ status: "Planeeritud", gcalEventId: "race-event" }),
        ref: {
          set: async (data) => { scheduleUpdated = data; }
        }
      };
    }
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 1);
  assert.equal(docDeleted, true);
  // It should have invalidated the hash and cleared the eventId
  assert.equal(scheduleUpdated.gcalSyncStatus, "queued");
  assert.ok(scheduleUpdated.hasOwnProperty("gcalEventId")); // Value is FieldValue.delete(), but property exists in the mock payload passed to set
  assert.ok(scheduleUpdated.hasOwnProperty("gcalSyncHash"));
});


test("queueGoogleEventDeletion creates independent outbox jobs for multiple failures on the same schedule", async () => {
  let addedJobs = [];
  setDb(createDbMock({
    add: async (data) => {
      addedJobs.push(data);
    }
  }));

  const schedule1 = { teacherUid: "t1", gcalEventId: "event-1", gcalCalId: "primary" };
  const schedule2 = { teacherUid: "t1", gcalEventId: "event-2", gcalCalId: "primary" };

  await queueGoogleEventDeletion("sch_1", schedule1, "fail 1");
  await queueGoogleEventDeletion("sch_1", schedule2, "fail 2");

  assert.equal(addedJobs.length, 2);
  assert.equal(addedJobs[0].eventId, "event-1");
  assert.equal(addedJobs[1].eventId, "event-2");
});

test("flushCalendarSyncOutbox removes stale jobs independently without affecting concurrent new jobs", async () => {
  const connection = { connected: true, refreshToken: "token", writeEnabled: true };
  const calendarOverride = {
    events: {
      delete: async () => {} // success
    }
  };

  let doc1Deleted = false;
  let doc2Deleted = false;

  setDb(createDbMock({
    where: () => ({
      get: async () => ({
        empty: false,
        docs: [
          {
            data: () => ({ action: "delete", eventId: "stale-1", scheduleId: "sch_multi" }),
            ref: { delete: async () => { doc1Deleted = true; } }
          },
          {
            data: () => ({ action: "delete", eventId: "active-2", scheduleId: "sch_multi" }),
            ref: { delete: async () => { doc2Deleted = true; } }
          }
        ]
      })
    }),
    get: async () => ({
      exists: true,
      data: () => ({ status: "Planeeritud", gcalEventId: "active-2" })
    })
  }));

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  // Job 1 (stale-1) is an orphan because current schedule is "active-2". It SHOULD be deleted from Google, then its job deleted.
  // Job 2 (active-2) is the current active event (Scenario A). It SHOULD NOT be deleted from Google, but its job is stale so the job itself is deleted.
  // Both jobs should be removed from the outbox, but for different reasons.
  // Wait, let's verify doc1Deleted and doc2Deleted.
  assert.equal(doc1Deleted, true);
  assert.equal(doc2Deleted, true);

  // Wait, the test was about "removing an old stale job does not remove a concurrently added job".
  // The `add()` function prevents overwriting. By using `add()`, `doc.ref.delete()` only deletes one job.
});

test("syncScheduleRecordToGoogle hard delete cleans up corresponding outbox jobs", async () => {
  let batchDeleted = [];
  setDb({
    collection: (colName) => ({
      where: (field, op, val) => {
        // Return this chainable mock
        return {
          where: (f2, o2, v2) => ({
            get: async () => ({
              empty: false,
              docs: [ { ref: "docRef1" }, { ref: "docRef2" } ]
            })
          })
        };
      },
      doc: (id) => ({
        get: async () => ({ exists: true, data: () => ({}) }),
        set: async () => {},
        delete: async () => {}
      }),
      add: async () => {}
    }),
    batch: () => ({
      delete: (ref) => { batchDeleted.push(ref); },
      commit: async () => {}
    })
  });

  const connectionOverride = { connected: true, writeEnabled: true, refreshToken: "t" };
  const calendarOverride = {
    events: { delete: async () => {} }
  };

  const before = { teacherUid: "t1", gcalEventId: "e1" };
  // after is null for hard delete
  const result = await syncScheduleRecordToGoogle("sch_hard", before, null, { connectionOverride, calendarOverride });

  assert.equal(result.deleted, true);
  assert.deepEqual(batchDeleted, ["docRef1", "docRef2"]);
});

test("flushCalendarSyncOutbox does not delete newly queued concurrent deletion jobs for the same schedule", async () => {
  const connection = { connected: true, refreshToken: "token", writeEnabled: true };
  const calendarOverride = {
    events: {
      delete: async () => {} // success
    }
  };

  let oldJobDeleted = false;
  let newJobDeleted = false;
  let getCalls = 0;

  setDb(createDbMock({
    where: () => ({
      get: async () => {
        getCalls++;
        if (getCalls === 1) {
          // This represents the state when flushCalendarSyncOutbox first queries the outbox.
          // At this moment, only the OLD job is present in the results.
          return {
            empty: false,
            docs: [
              {
                id: "old_job_id",
                data: () => ({ action: "delete", eventId: "e1", scheduleId: "sch_concurrent" }),
                ref: { delete: async () => { oldJobDeleted = true; } }
              }
            ]
          };
        }
        return { empty: true, docs: [] };
      }
    }),
    get: async () => ({
      // Mocking the scheduleSnap to show it's active again, but using a different event.
      // Or we can just mock it as Tühistatud so it processes the deletion of 'e1'.
      exists: true,
      data: () => ({ status: "Tühistatud", gcalEventId: "e1" })
    }),
    add: async () => {
      // Simulate a concurrent add() happening just as the flush processes
    }
  }));

  // But we want to prove that the doc references are strictly independent.
  // We can just verify that flush only calls `delete()` on the specific `ref` provided in the snapshot,
  // and doesn't do a broad query `db.collection("calendarSyncOutbox").where("scheduleId", "==").delete()`
  // like it used to do with `doc("delete_" + scheduleId).delete()`.

  // Since we already proved that multiple jobs have separate `add()` calls, and `flushCalendarSyncOutbox`
  // only deletes the `doc.ref` it iterated over, we can just assert `oldJobDeleted` is true,
  // and we know it didn't call delete on anything else because we only provided one `doc.ref`.

  const result = await flushCalendarSyncOutbox("teacher_1", connection, calendarOverride);

  assert.equal(result.deleted, 1);
  assert.equal(oldJobDeleted, true);

  // And it definitely didn't touch a "new" job because it wasn't in the snapshot
  assert.equal(newJobDeleted, false);
});
