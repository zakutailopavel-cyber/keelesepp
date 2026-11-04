// The Live Classroom downloads in pieces (LiveClassroomPage.jsx): the page, then the 1:1 room. A student whose lesson
// starts soon, or who has an invitation on the screen, gets both in the background, so „Liitu tunniga” opens the room
// without waiting for code. Nothing is read or written: only the app's own files are downloaded.
export const loadLiveRoom = () => import('./LiveRoom.jsx');

export const PREFETCH_BEFORE_MS = 30 * 60 * 1000;
// a timer longer than this is not set: the page is reloaded long before (and a far lesson needs no prefetch)
const LONGEST_WAIT_MS = 6 * 60 * 60 * 1000;

const loadAll = () => Promise.all([import('./LiveClassroomPage.jsx'), loadLiveRoom()]);
let started = false;
export function prefetchLiveClassroom(load = loadAll) {
  // unit tests render the home page with a lesson soon: they do not download the whole room in the background
  if (load === loadAll && import.meta.env?.MODE === 'test') return;
  if (started) return;
  started = true;
  // nothing to do when a download fails here: the page loads (and reports) it again when it is opened
  Promise.resolve().then(load).catch(() => { started = false; });
}

// ms until the room's code should be fetched for a lesson { occurrenceDate: 'YYYY-MM-DD', time: 'HH:MM' }:
// 0 = now (it starts within 30 minutes), null = not now and no timer (no lesson, a bad time, or many hours away)
export function prefetchDelay(lesson, now = Date.now()) {
  if (!lesson?.occurrenceDate || !/^\d{1,2}:\d{2}$/.test(String(lesson.time || ''))) return null;
  const [hours, minutes] = String(lesson.time).split(':').map(Number);
  const start = new Date(`${lesson.occurrenceDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  start.setHours(hours, minutes, 0, 0);
  const wait = start.getTime() - PREFETCH_BEFORE_MS - now;
  if (wait <= 0) return 0;
  return wait <= LONGEST_WAIT_MS ? wait : null;
}
