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

// Group room: the same for every member (one read per student when the room opens or a member is added).
// → { loading, byStudent: { [studentId]: lessons } }; a member whose read fails just has no lessons.
export function useMembersRecentLessons({ studentIds = [], user, enabled = true, service = lessonRecordingsService }) {
  const isAdmin = Boolean(user?.roles?.includes?.(ROLES.ADMIN));
  const uid = user?.uid || '';
  const key = [...new Set(studentIds.filter(Boolean))].sort().join(',');
  const [state, setState] = useState({ key: '', byStudent: {} });
  useEffect(() => {
    if (!enabled || !key || !uid || !service?.listForStudent) return undefined;
    let alive = true;
    Promise.all(key.split(',').map((studentId) => Promise.resolve()
      .then(() => service.listForStudent({ studentId, user: { uid }, isAdmin }))
      .then((records) => [studentId, groupRecordings(records || [])])
      .catch(() => [studentId, []])))
      .then((pairs) => { if (alive) setState({ key, byStudent: Object.fromEntries(pairs) }); });
    return () => { alive = false; };
  }, [enabled, isAdmin, key, service, uid]);
  const active = Boolean(enabled && key && uid && service?.listForStudent);
  return { loading: active && state.key !== key, byStudent: state.key === key ? state.byStudent : {} };
}
