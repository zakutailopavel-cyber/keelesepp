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

// Where the teacher lands after ending the room.
export function calendarPathAfterLesson(invitation) {
  const lessonKey = lessonLinkFor(invitation?.id);
  if (lessonKey) return `/calendar?lesson=${encodeURIComponent(lessonKey)}`;
  return invitation?.studentId ? `/calendar?student=${encodeURIComponent(invitation.studentId)}` : '/calendar';
}
