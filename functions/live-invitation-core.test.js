"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./live-invitation-core");

const card = { name: "Mari Mets", teacherUid: "t1", teacherUids: ["t1", "t2"], studentUid: "s-uid" };
const body = { studentId: "card-1", studentUid: "s-uid", studentName: "Mari Mets", teacherName: "Kati Kask", title: "Eesti keel" };

test("create: a teacher of the card invites the card's own account", () => {
  const result = core.createDecision({ uid: "t1", teacher: true, body, student: card });
  assert.equal(result.ok, true);
  assert.deepEqual(result.fields, {
    teacherUid: "t1", teacherName: "Kati Kask", studentId: "card-1", studentUid: "s-uid", studentName: "Mari Mets", title: "Eesti keel",
    status: "pending", respondedAt: null, cancelledAt: null, closedAt: null,
  });
  assert.equal(core.createDecision({ uid: "t2", teacher: true, body, student: card }).ok, true);
});

test("create: refused for a foreign teacher, a non-staff account, a foreign uid, a missing card or title", () => {
  assert.equal(core.createDecision({ uid: "t9", teacher: true, body, student: card }).status, 403);
  assert.equal(core.createDecision({ uid: "p1", body, student: card }).status, 403);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: { ...body, studentUid: "parent-uid" }, student: card }).status, 409);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body, student: null }).status, 404);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: { ...body, title: "  " }, student: card }).status, 400);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: { ...body, studentId: "a/b" }, student: card }).status, 400);
});

test("create: an administrator invites any card; names are cut to 160 characters", () => {
  const result = core.createDecision({ uid: "a1", admin: true, body: { ...body, title: "x".repeat(300) }, student: card });
  assert.equal(result.ok, true);
  assert.equal(result.fields.title.length, 160);
});

test("create: a group room key needs the teacher's own open room with the student in it", () => {
  const room = { teacherUid: "t1", status: "open", memberUids: ["s-uid", "other"] };
  const withRoom = { ...body, roomKey: "room-1" };
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: withRoom, student: card, groupRoom: room }).roomKey, "room-1");
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: withRoom, student: card, groupRoom: null }).status, 403);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: withRoom, student: card, groupRoom: { ...room, status: "closed" } }).status, 403);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: withRoom, student: card, groupRoom: { ...room, teacherUid: "t2" } }).status, 403);
  assert.equal(core.createDecision({ uid: "t1", teacher: true, body: withRoom, student: card, groupRoom: { ...room, memberUids: ["other"] } }).status, 403);
});

test("create: the calendar lesson link is kept only with a valid date", () => {
  const linked = core.createDecision({ uid: "t1", teacher: true, body: { ...body, scheduleId: "sch-1", occurrenceDate: "2026-11-30" }, student: card });
  assert.equal(linked.fields.scheduleId, "sch-1");
  assert.equal(linked.fields.occurrenceDate, "2026-11-30");
  const bad = core.createDecision({ uid: "t1", teacher: true, body: { ...body, scheduleId: "sch-1", occurrenceDate: "30.11" }, student: card });
  assert.equal("scheduleId" in bad.fields, false);
});

const pending = { teacherUid: "t1", studentUid: "s-uid", studentId: "card-1", status: "pending", expiresAt: 2000 };

test("the student accepts or declines a pending invitation before it expires", () => {
  assert.deepEqual(core.transitionDecision({ invitation: pending, action: "accept", uid: "s-uid", nowMs: 1000 }), { ok: true, status: "accepted", stamp: "respondedAt" });
  assert.equal(core.transitionDecision({ invitation: pending, action: "decline", uid: "s-uid", nowMs: 1000 }).status, "declined");
  assert.equal(core.transitionDecision({ invitation: pending, action: "accept", uid: "s-uid", nowMs: 2000 }).status, 409);
  assert.equal(core.transitionDecision({ invitation: pending, action: "accept", uid: "t1", nowMs: 1000 }).status, 403);
  assert.equal(core.transitionDecision({ invitation: { ...pending, status: "accepted" }, action: "accept", uid: "s-uid", nowMs: 1000 }).status, 409);
  assert.equal(core.transitionDecision({ invitation: null, action: "accept", uid: "s-uid" }).status, 404);
});

test("the teacher accepts only for a test student", () => {
  assert.equal(core.transitionDecision({ invitation: pending, action: "accept-test", uid: "t1", nowMs: 1000, student: { testStudent: true } }).status, "accepted");
  assert.equal(core.transitionDecision({ invitation: pending, action: "accept-test", uid: "t1", nowMs: 1000, student: { testStudent: false } }).status, 403);
  assert.equal(core.transitionDecision({ invitation: pending, action: "accept-test", uid: "s-uid", nowMs: 1000, student: { testStudent: true } }).status, 403);
  assert.equal(core.transitionDecision({ invitation: pending, action: "accept-test", uid: "t1", nowMs: 5000, student: { testStudent: true } }).status, 409);
});

test("cancel and close belong to the inviting teacher or an administrator", () => {
  assert.deepEqual(core.transitionDecision({ invitation: pending, action: "cancel", uid: "t1" }), { ok: true, status: "cancelled", stamp: "cancelledAt" });
  assert.equal(core.transitionDecision({ invitation: pending, action: "cancel", uid: "x", admin: true }).status, "cancelled");
  assert.equal(core.transitionDecision({ invitation: pending, action: "cancel", uid: "t2" }).status, 403);
  assert.equal(core.transitionDecision({ invitation: pending, action: "close", uid: "t1" }).status, 409);
  const accepted = { ...pending, status: "accepted" };
  assert.deepEqual(core.transitionDecision({ invitation: accepted, action: "close", uid: "t1", endMark: "held" }), { ok: true, status: "closed", stamp: "closedAt", endMark: "held" });
  assert.equal("endMark" in core.transitionDecision({ invitation: accepted, action: "close", uid: "t1", endMark: "anything" }), false);
  assert.equal(core.transitionDecision({ invitation: accepted, action: "close", uid: "s-uid" }).status, 403);
  assert.equal(core.transitionDecision({ invitation: accepted, action: "cancel", uid: "t1" }).status, 409);
  assert.equal(core.transitionDecision({ invitation: accepted, action: "", uid: "t1" }).status, 400);
});
