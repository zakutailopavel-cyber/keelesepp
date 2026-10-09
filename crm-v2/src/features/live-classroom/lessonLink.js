// Which calendar lesson a Live Classroom room was started from ("Alusta tundi" in the lesson panel), so that
// "Lõpeta tund" can open that lesson to mark it held. Kept in the teacher's browser only: the invitation document
// and its rules stay unchanged. Without a link the calendar opens filtered to the room's student.

const KEY = 'keelesepp.liveLessonLinks';
const MAX_LINKS = 20;
const LESSON_KEY = /^[^|]{1,200}\|\d{4}-\d{2}-\d{2}$/;

function readLinks() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export const isLessonKey = (value) => LESSON_KEY.test(String(value || ''));

export function rememberLessonLink(invitationId, lessonKey) {
  if (!invitationId || !isLessonKey(lessonKey)) return;
  const links = { ...readLinks(), [invitationId]: lessonKey };
  const trimmed = Object.fromEntries(Object.entries(links).slice(-MAX_LINKS));
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(trimmed)); } catch { /* private mode: fall back to the student filter */ }
}

export function lessonLinkFor(invitationId) {
  const value = readLinks()[invitationId];
  return isLessonKey(value) ? value : '';
}

// A lesson held without a calendar lesson: its handoff (lessonHandoff.js) is kept under the student and the day.
export const looseLessonKey = (studentId, date) => `student:${String(studentId || '').replace(/\|/g, '')}|${date}`;
const pad = (n) => String(n).padStart(2, '0');
export const localDay = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

// `held=<date>|<HH:MM>|<minutes>`: when the room started and how long it ran (for adding the lesson to the calendar)
export function heldParam(startedMs, now = Date.now()) {
  if (!startedMs || startedMs > now) return '';
  const d = new Date(startedMs);
  const minutes = Math.min(240, Math.max(15, Math.round((now - startedMs) / 60000 / 5) * 5));
  return `${localDay(startedMs)}|${pad(d.getHours())}:${pad(d.getMinutes())}|${minutes}`;
}
export function parseHeld(value) {
  const match = /^(\d{4}-\d{2}-\d{2})\|(\d{2}:\d{2})\|(\d{1,3})$/.exec(String(value || ''));
  return match ? { date: match[1], time: match[2], duration: Number(match[3]) } : null;
}

// Where the teacher lands after ending the room: the calendar lesson it was started from, or the student's calendar
// with the lesson's day, start and length (so a lesson that was not planned can be added and marked in one click).
export function calendarPathAfterLesson(invitation, startedMs = 0, now = Date.now()) {
  const lessonKey = lessonLinkFor(invitation?.id);
  if (lessonKey) return `/calendar?lesson=${encodeURIComponent(lessonKey)}`;
  if (!invitation?.studentId) return '/calendar';
  const held = heldParam(startedMs, now);
  return `/calendar?student=${encodeURIComponent(invitation.studentId)}${held ? `&held=${encodeURIComponent(held)}` : ''}`;
}
