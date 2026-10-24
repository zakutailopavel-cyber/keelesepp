"use strict";

// Rooms („Kabinet”, Oleksiy 2026-10-15): a lesson on site takes a room; when every room is taken at that time, the
// lesson can only be an online one. Teachers read only their own schedule entries, so the room occupancy of all
// lessons lives in roomBookings/{scheduleId} — written only by the server (trigger syncRoomBooking), readable by staff,
// with no student data: just what decides whether a room is free.

const clean = (value, max = 120) => String(value ?? "").trim().slice(0, max);

// the booking a schedule entry makes, or null (no room, online, cancelled, deleted)
function roomBookingFor(scheduleId, data) {
  if (!data) return null;
  const roomId = clean(data.roomId, 80);
  if (!roomId || data.online === true || data.status === "Tühistatud") return null;
  const statuses = data.occurrenceStatuses && typeof data.occurrenceStatuses === "object" ? data.occurrenceStatuses : {};
  // one cancelled lesson of a series frees its room that day
  const cancelledDates = Object.entries(statuses).filter(([, value]) => value?.status === "Tühistatud").map(([date]) => date);
  return {
    scheduleId: clean(scheduleId, 200),
    roomId,
    roomName: clean(data.roomName, 80),
    recurring: data.recurring === true,
    date: clean(data.date, 10),
    day: clean(data.day, 3),
    startDate: clean(data.startDate, 10),
    endDate: clean(data.endDate, 10),
    excludedDates: [...new Set([...(Array.isArray(data.excludedDates) ? data.excludedDates : []), ...cancelledDates].map((d) => clean(d, 10)).filter(Boolean))].slice(0, 400),
    time: clean(data.time, 5),
    duration: Math.max(5, Number(data.duration) || 60),
    status: clean(data.status, 40),
    teacher: clean(data.teacher, 120),
    teacherUid: clean(data.teacherUid, 160),
  };
}

// the fields that decide whether a room is free (updatedAt and the like are not compared)
const DECIDING = ["roomId", "recurring", "date", "day", "startDate", "endDate", "time", "duration", "status"];
const sameBooking = (a, b) => DECIDING.every((key) => String(a?.[key] ?? "") === String(b?.[key] ?? ""))
  && JSON.stringify([...(a?.excludedDates || [])].sort()) === JSON.stringify([...(b?.excludedDates || [])].sort());

// Stale roomBookings (tools/room-bookings-resync.js, dry run first): what the trigger would write for every schedule
// entry now, compared with what is stored. → { write: [{ scheduleId, booking, reason }], remove: [{ scheduleId, reason }] }
function roomBookingResyncPlan(schedules = [], bookings = []) {
  const stored = new Map(bookings.map((booking) => [String(booking.scheduleId || booking.id), booking]));
  const seen = new Set();
  const write = [];
  const remove = [];
  for (const { id, data } of schedules) {
    seen.add(String(id));
    const want = roomBookingFor(id, data);
    const have = stored.get(String(id));
    if (want && !have) write.push({ scheduleId: String(id), booking: want, reason: "missing" });
    else if (want && !sameBooking(want, have)) write.push({ scheduleId: String(id), booking: want, reason: "changed" });
    else if (!want && have) remove.push({ scheduleId: String(id), reason: data?.status === "Tühistatud" ? "cancelled" : data?.online === true ? "online" : "no room" });
  }
  for (const [scheduleId] of stored) if (!seen.has(scheduleId)) remove.push({ scheduleId, reason: "lesson deleted" });
  return { write, remove };
}

module.exports = { roomBookingFor, roomBookingResyncPlan };
