"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  activityEstimateMinutes,
  buildOperationalAlerts,
  heartbeatDeltaSeconds,
  hourlyRateCents,
  payAmountCents,
  programPayAmountCents,
  workDurationMinutes,
} = require("./staff-operations-core");

test("work duration subtracts a declared break", () => {
  assert.equal(workDurationMinutes({
    startedAt: "2026-07-29T06:00:00.000Z",
    endedAt: "2026-07-29T14:30:00.000Z",
    breakMinutes: 30,
  }), 480);
});

test("work duration rejects impossible and excessively long shifts", () => {
  assert.throws(() => workDurationMinutes({
    startedAt: "2026-07-29T10:00:00.000Z",
    endedAt: "2026-07-29T09:00:00.000Z",
  }), /after start/);
  assert.throws(() => workDurationMinutes({
    startedAt: "2026-07-28T06:00:00.000Z",
    endedAt: "2026-07-29T07:00:00.000Z",
  }), /24 hours/);
  assert.throws(() => workDurationMinutes({
    startedAt: "2026-07-29T08:00:00.000Z",
    endedAt: "2026-07-29T08:30:00.000Z",
    breakMinutes: 45,
  }), /Break cannot exceed/);
});

test("hourly rate and pay use cents without floating point drift", () => {
  assert.equal(hourlyRateCents("12,50"), 1250);
  assert.equal(payAmountCents(90, 1250), 1875);
  assert.throws(() => hourlyRateCents("12.345"), /Valid hourly rate/);
});

test("activity estimate caps idle gaps and remains an estimate", () => {
  assert.equal(activityEstimateMinutes([
    { byUid: "admin", date: "2026-07-29", createdAt: "2026-07-29T08:00:00.000Z" },
    { byUid: "admin", date: "2026-07-29", createdAt: "2026-07-29T08:10:00.000Z" },
    { byUid: "admin", date: "2026-07-29", createdAt: "2026-07-29T10:00:00.000Z" },
  ]), 30);
});

test("program heartbeat credits only a recent server-measured interval", () => {
  assert.equal(heartbeatDeltaSeconds(
    "2026-07-29T08:00:00.000Z",
    "2026-07-29T08:00:45.000Z",
  ), 45);
  assert.equal(heartbeatDeltaSeconds(
    "2026-07-29T08:00:00.000Z",
    "2026-07-29T08:01:15.000Z",
  ), 60);
  assert.equal(heartbeatDeltaSeconds(
    "2026-07-29T08:00:00.000Z",
    "2026-07-29T08:01:31.000Z",
  ), 0);
  assert.equal(heartbeatDeltaSeconds(
    "2026-07-29T08:00:45.000Z",
    "2026-07-29T08:00:44.000Z",
  ), 0);
  assert.equal(heartbeatDeltaSeconds(null, "2026-07-29T08:00:00.000Z"), 0);
});

test("multiple browser tabs cannot create more than wall-clock time", () => {
  const heartbeats = [
    "2026-07-29T08:00:00.000Z",
    "2026-07-29T08:00:15.000Z",
    "2026-07-29T08:00:45.000Z",
    "2026-07-29T08:01:00.000Z",
  ];
  const credited = heartbeats.slice(1).reduce(
    (sum, current, index) => sum + heartbeatDeltaSeconds(heartbeats[index], current),
    0,
  );
  assert.equal(credited, 60);
});

test("program pay uses active seconds without rounding every heartbeat", () => {
  assert.equal(programPayAmountCents(90 * 60, 1250), 1875);
  assert.equal(programPayAmountCents(45, 1200), 15);
});

test("assistant detects overdue money, work, tasks and calendar errors", () => {
  const alerts = buildOperationalAlerts({
    nowIso: "2026-07-29T12:00:00.000Z",
    todayIso: "2026-07-29",
    invoices: [{ id: "inv", num: "KS-1", due: "2026-07-01", amount: 100, paidAmount: 20, status: "Ootel" }],
    tasks: [{ id: "task", title: "Helista", due: "2026-07-20", status: "active", assignedTo: "Admin" }],
    workSessions: [{ id: "shift", staffName: "Admin", status: "open", startedAt: "2026-07-28T16:00:00.000Z" }],
    users: [{ id: "teacher", displayName: "Õpetaja", gcal: { lastSyncError: "Token expired" } }],
  });
  assert.deepEqual(alerts.map(alert => alert.category).sort(), [
    "calendar",
    "invoice",
    "task",
    "work_time",
  ]);
  assert.equal(alerts.find(alert => alert.category === "invoice").severity, "critical");
  assert.match(alerts.find(alert => alert.category === "invoice").detail, /80.00/);
});

test("assistant ignores resolved operational items", () => {
  assert.deepEqual(buildOperationalAlerts({
    nowIso: "2026-07-29T12:00:00.000Z",
    todayIso: "2026-07-29",
    invoices: [{ id: "paid", due: "2026-07-01", amount: 100, paidAmount: 100, status: "Makstud" }],
    tasks: [{ id: "done", due: "2026-07-01", status: "done" }],
    workSessions: [{ id: "closed", status: "closed", startedAt: "2026-07-28T08:00:00.000Z" }],
    users: [{ id: "ok", gcal: {} }],
  }), []);
});
