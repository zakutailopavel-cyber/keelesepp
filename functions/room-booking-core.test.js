"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { roomBookingFor } = require("./room-booking-core");

const lesson = { studentId: "s1", studentName: "Mari", teacher: "Pavel", teacherUid: "t1", date: "2026-10-15", day: "Thu", time: "10:00", duration: 60, recurring: true, startDate: "2026-10-15", status: "Planeeritud", roomId: "r1", roomName: "Kabinet 1" };

test("an on-site lesson with a room books it, without the student", () => {
  const booking = roomBookingFor("sch1", lesson);
  assert.equal(booking.roomId, "r1");
  assert.equal(booking.scheduleId, "sch1");
  assert.equal(booking.recurring, true);
  assert.equal("studentName" in booking || "studentId" in booking, false);
});

test("no room, an online lesson, a cancelled or deleted lesson book nothing", () => {
  assert.equal(roomBookingFor("x", { ...lesson, roomId: "" }), null);
  assert.equal(roomBookingFor("x", { ...lesson, online: true }), null);
  assert.equal(roomBookingFor("x", { ...lesson, status: "Tühistatud" }), null);
  assert.equal(roomBookingFor("x", null), null);
});

test("a cancelled lesson of a series frees the room that day", () => {
  const booking = roomBookingFor("x", { ...lesson, excludedDates: ["2026-10-22"], occurrenceStatuses: { "2026-10-29": { status: "Tühistatud" }, "2026-11-05": { status: "Toimunud" } } });
  assert.deepEqual(booking.excludedDates, ["2026-10-22", "2026-10-29"]);
});

test("resync plan: stale bookings of cancelled, online and deleted lessons go; missing and changed ones are written", () => {
  const { roomBookingResyncPlan } = require("./room-booking-core");
  const schedules = [
    { id: "ok", data: lesson },
    { id: "cancelled", data: { ...lesson, status: "Tühistatud" } },
    { id: "online", data: { ...lesson, online: true } },
    { id: "missing", data: lesson },
    { id: "one-date-off", data: { ...lesson, occurrenceStatuses: { "2026-10-22": { status: "Tühistatud" } } } },
  ];
  const bookings = [
    { ...roomBookingFor("ok", lesson), updatedAt: "2026-10-20T10:00:00Z" },
    roomBookingFor("cancelled", lesson),
    roomBookingFor("online", lesson),
    roomBookingFor("one-date-off", lesson),
    { ...roomBookingFor("gone", lesson) },
  ];
  const plan = roomBookingResyncPlan(schedules, bookings);
  assert.deepEqual(plan.write.map((item) => [item.scheduleId, item.reason]), [["missing", "missing"], ["one-date-off", "changed"]]);
  assert.deepEqual(plan.write[1].booking.excludedDates, ["2026-10-22"]);
  assert.deepEqual(plan.remove, [{ scheduleId: "cancelled", reason: "cancelled" }, { scheduleId: "online", reason: "online" }, { scheduleId: "gone", reason: "lesson deleted" }]);
});
