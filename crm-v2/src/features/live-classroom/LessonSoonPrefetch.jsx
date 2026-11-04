import { useEffect } from 'react';
import { prefetchDelay, prefetchLiveClassroom } from './liveRoomPrefetch.js';

// Renders nothing: 30 minutes before the student's next lesson the Live Classroom's code downloads in the background
// (liveRoomPrefetch.js), so the room opens at once when the teacher's invitation comes.
export default function LessonSoonPrefetch({ lesson, prefetch = prefetchLiveClassroom }) {
  const date = lesson?.occurrenceDate || '';
  const time = lesson?.time || '';
  useEffect(() => {
    const wait = prefetchDelay({ occurrenceDate: date, time });
    if (wait === null) return undefined;
    if (wait === 0) { prefetch(); return undefined; }
    const timer = globalThis.setTimeout(prefetch, wait);
    return () => globalThis.clearTimeout(timer);
  }, [date, time, prefetch]);
  return null;
}
