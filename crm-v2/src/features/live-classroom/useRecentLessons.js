import { useEffect, useState } from 'react';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { groupRecordings } from '../lesson-recording/lessonTimeline.js';
import { ROLES } from '../../utils/roles.js';

// The student's recorded lessons for the teacher in the room (read once when the room opens): a teacher reads the
// recordings he made, an admin all of them (firestore.rules lessonRecordings: teacherUid == uid or admin).
// Lessons are grouped like on the student card, so the „Pole viga” marks are applied.
export function useRecentLessons({ studentId, user, enabled = true, service = lessonRecordingsService }) {
  const [state, setState] = useState(() => ({ loading: Boolean(enabled && studentId && user?.uid && service?.listForStudent), error: '', lessons: [] }));
  const isAdmin = Boolean(user?.roles?.includes?.(ROLES.ADMIN));
  const uid = user?.uid || '';
  useEffect(() => {
    if (!enabled || !studentId || !uid || !service?.listForStudent) return undefined;
    let alive = true;
    Promise.resolve()
      .then(() => { if (alive) setState((s) => ({ ...s, loading: true, error: '' })); return service.listForStudent({ studentId, user: { uid }, isAdmin }); })
      .then((records) => { if (alive) setState({ loading: false, error: '', lessons: groupRecordings(records || []) }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error?.message || 'Eelmisi tunde ei saanud laadida.', lessons: [] }); });
    return () => { alive = false; };
  }, [enabled, isAdmin, service, studentId, uid]);
  return state;
}
