import { eventOccursOn, shiftDate } from './calendarView.js';
import { toMinutes } from './calendarGrid.js';

// Rooms („Kabinet”, Oleksiy 2026-10-15): which rooms an on-site lesson can take. A recurring lesson needs its room on
// the next weeks too; bookings are the server's roomBookings (every teacher's lessons).
export const ROOM_WEEKS = 12;

const overlaps = (a, b) => a.start < b.end && b.start < a.end;

// the dates a candidate lesson takes place on (one date, or the weekly series for ROOM_WEEKS weeks)
export function candidateDates(candidate) {
  const first = candidate.recurring ? (candidate.startDate || candidate.date) : candidate.date;
  if (!first) return [];
  if (!candidate.recurring) return [first];
  return Array.from({ length: ROOM_WEEKS }, (_, index) => shiftDate(first, index * 7))
    .filter((date) => !candidate.endDate || date <= candidate.endDate)
    .filter((date) => !(candidate.excludedDates || []).includes(date));
}

// the first date the room is taken by another lesson at the candidate's time, or ''
export function roomConflict(bookings = [], candidate, roomId, ignoreScheduleId = '') {
  const span = { start: toMinutes(candidate.time), end: toMinutes(candidate.time) + (Number(candidate.duration) || 60) };
  for (const date of candidateDates(candidate)) {
    const taken = bookings.some((booking) => booking.roomId === roomId && booking.scheduleId !== ignoreScheduleId
      && eventOccursOn(booking, date)
      && overlaps(span, { start: toMinutes(booking.time), end: toMinutes(booking.time) + (Number(booking.duration) || 60) }));
    if (taken) return date;
  }
  return '';
}

// every active room with the date it is taken on ('' = free)
export function roomChoices(rooms = [], bookings = [], candidate, ignoreScheduleId = '') {
  return rooms.filter((room) => room.active !== false).map((room) => ({ ...room, takenOn: roomConflict(bookings, candidate, room.id, ignoreScheduleId) }));
}

// the room an on-site lesson gets: the chosen one when it is free, else (none chosen) the first free one; an error
// message when it cannot have one. Online lessons and a school without rooms need none.
export function assignRoom(rooms = [], bookings = [], candidate, ignoreScheduleId = '') {
  if (candidate.online || !rooms.some((room) => room.active !== false)) return { roomId: '', roomName: '' };
  const choices = roomChoices(rooms, bookings, candidate, ignoreScheduleId);
  const chosen = choices.find((room) => room.id === candidate.roomId);
  if (chosen) {
    if (chosen.takenOn) return { error: `${chosen.name} on ${chosen.takenOn} kell ${candidate.time} juba hõivatud. Vali teine kabinet või märgi tund veebitunniks.` };
    return { roomId: chosen.id, roomName: chosen.name };
  }
  const free = choices.find((room) => !room.takenOn);
  if (!free) return { error: `Kõik kabinetid on ${candidate.time} ajal hõivatud. Märgi tund veebitunniks või vali teine aeg.` };
  return { roomId: free.id, roomName: free.name };
}

// The booking a lesson makes (the same rule as the server's functions/room-booking-core.js): none when it has no room,
// is online or cancelled; a cancelled date of a series frees the room that day.
export function bookingFromEvent(event) {
  if (!event?.roomId || event.online === true || event.status === 'Tühistatud') return null;
  const cancelledDates = Object.entries(event.occurrenceStatuses || {}).filter(([, value]) => value?.status === 'Tühistatud').map(([date]) => date);
  return {
    scheduleId: event.id,
    roomId: event.roomId,
    roomName: event.roomName || '',
    recurring: event.recurring === true,
    date: event.date || '',
    day: event.day || '',
    startDate: event.startDate || '',
    endDate: event.endDate || '',
    excludedDates: [...new Set([...(event.excludedDates || []), ...cancelledDates])],
    time: event.time || '',
    duration: Number(event.duration) || 60,
    status: event.status || '',
  };
}

// The bookings the calendar decides with (Oleksiy 2026-10-22: „при отмене занятия через Tühista не освобождается
// кабинет”): the lessons this calendar has just loaded count as they are now — cancelled, moved or deleted lessons
// free their room at once; the server's roomBookings (written by a trigger, loaded once) only add the lessons this
// user cannot see. `overrides` are this session's own saves (scheduleId → booking, or null when deleted).
export function mergedBookings(serverBookings = [], scheduleEvents = [], overrides = {}) {
  const visible = new Set(scheduleEvents.map((event) => event.id));
  const fromServer = serverBookings.filter((booking) => !visible.has(booking.scheduleId) && !(booking.scheduleId in overrides));
  const fromOverrides = Object.entries(overrides).filter(([id, booking]) => booking && !visible.has(id)).map(([, booking]) => booking);
  const fromEvents = scheduleEvents.map(bookingFromEvent).filter(Boolean);
  return [...fromServer, ...fromOverrides, ...fromEvents];
}
