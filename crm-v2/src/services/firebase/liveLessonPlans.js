import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// The teacher's lesson plan and in-room attendance of one Live Classroom room: `liveLessonPlans/{roomKey}` (roomKey =
// the invitation id of a 1:1 lesson, the group room id of a group lesson). Staff-only: the student never reads it.
// Written only when the teacher acts (start, next step, edit, a mark) — the timer is derived from the timestamps.
const clean = (value, max) => String(value ?? '').slice(0, max);

export function planDocument(roomKey, plan, user) {
  return {
    teacherUid: user.uid,
    roomKey,
    kind: plan.kind === 'group' ? 'group' : 'lesson',
    steps: (plan.steps || []).slice(0, 12).map((step) => ({
      id: clean(step.id, 40), label: clean(step.label, 60), minutes: Math.round(Number(step.minutes) || 1), spentMs: Math.max(0, Math.round(Number(step.spentMs) || 0)),
    })),
    current: Math.max(0, Math.min(12, Math.round(Number(plan.current) || 0))),
    startedAt: clean(plan.startedAt, 40),
    stepStartedAt: clean(plan.stepStartedAt, 40),
    plannedStart: clean(plan.plannedStart, 40),
    attendance: Object.fromEntries(Object.entries(plan.attendance || {}).slice(0, 8).map(([studentId, mark]) => [clean(studentId, 160), {
      name: clean(mark?.name, 160), status: ['present', 'late', 'absent'].includes(mark?.status) ? mark.status : 'present',
      lateMinutes: Math.max(0, Math.min(240, Math.round(Number(mark?.lateMinutes) || 0))), joinedAt: clean(mark?.joinedAt, 40),
    }])),
    updatedAt: new Date().toISOString(),
  };
}

export const liveLessonPlansService = {
  subscribe(roomKey, onChange, onError) {
    if (!roomKey) { onChange(null); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, 'liveLessonPlans', roomKey), (snapshot) => onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null), onError);
  },

  // the whole plan each time (the doc is small); attendance marks are kept as a whole map
  async save(roomKey, plan, user) {
    if (!roomKey || !user?.uid) throw new Error('Tunniplaani ei saa salvestada.');
    const { db } = requireFirebaseClient();
    const value = planDocument(roomKey, plan, user);
    await setDoc(doc(db, 'liveLessonPlans', roomKey), value);
    return value;
  },
};
