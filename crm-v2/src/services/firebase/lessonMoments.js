import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { cleanMomentLabel } from '../../features/lesson-recording/lessonMoments.js';

// „Hetk” marks of live lessons: `lessonMoments/{auto id}` { invitationId, recordingId, teacherUid, studentId, atMs,
// at, label, byUid, byName, createdAt } (see features/lesson-recording/lessonMoments.js). The lesson's teacher and
// admins read and write them; students have no access (firestore.rules).
export function normalizeMoment(id, data = {}) {
  return {
    id,
    invitationId: data.invitationId || '',
    recordingId: data.recordingId || '',
    teacherUid: data.teacherUid || '',
    studentId: data.studentId || '',
    atMs: Number.isFinite(data.atMs) ? data.atMs : null,
    at: data.at || data.createdAt || '',
    label: data.label || '',
    byUid: data.byUid || '',
    byName: data.byName || '',
    createdAt: data.createdAt || '',
  };
}

export const lessonMomentsService = {
  // `record` from momentRecord(); returns it with its id
  async add(record) {
    const { db } = requireFirebaseClient();
    const ref = await addDoc(collection(db, 'lessonMoments'), record);
    return normalizeMoment(ref.id, record);
  },

  async setLabel(id, label) {
    if (!id) throw new Error('Hetk puudub.');
    const { db } = requireFirebaseClient();
    const clean = cleanMomentLabel(label);
    await updateDoc(doc(db, 'lessonMoments', id), { label: clean });
    return clean;
  },

  async remove(id) {
    if (!id) throw new Error('Hetk puudub.');
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'lessonMoments', id));
  },

  // staff: one student's moments (a teacher only the ones of his lessons, like the recordings)
  async listForStudent({ studentId, user, isAdmin = false }) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const filters = [where('studentId', '==', studentId)];
    if (!isAdmin) filters.push(where('teacherUid', '==', user?.uid || ''));
    const snapshot = await getDocs(query(collection(db, 'lessonMoments'), ...filters));
    return snapshot.docs.map((d) => normalizeMoment(d.id, d.data()))
      .sort((a, b) => String(a.at).localeCompare(String(b.at)));
  },
};
