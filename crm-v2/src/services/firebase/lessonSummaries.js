import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// `lessonSummaries/{invitationId}`: what the student and parents see after a Live Classroom lesson. The teacher's
// browser writes it when the lesson ends (note to the student + the board pages used); the words and the homework of
// the lesson are read live from `studentWords` / `homework` by `invitationId`.
const text = (value, max) => String(value ?? '').trim().slice(0, max);

export function normalizeSummary(id, data = {}) {
  return {
    id,
    invitationId: data.invitationId || id,
    studentId: data.studentId || '',
    teacherName: data.teacherName || '',
    title: data.title || '',
    subject: data.subject || '',
    startedAt: data.startedAt || '',
    endedAt: data.endedAt || '',
    note: data.note || '',
    pages: Array.isArray(data.pages) ? data.pages.filter((page) => page?.id) : [],
  };
}

export const lessonSummariesService = {
  async save({ invitation, user, subject = '', startedAt = '', note = '', pages = [] }) {
    if (!invitation?.id || !invitation.studentId) throw new Error('Tund puudub.');
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const record = {
      invitationId: invitation.id,
      studentId: invitation.studentId,
      teacherUid: user.uid,
      teacherName: text(user.displayName || invitation.teacherName, 160),
      title: text(invitation.title, 200),
      subject: text(subject, 200),
      startedAt: text(startedAt, 40),
      endedAt: now,
      note: text(note, 2000),
      pages: pages.filter((page) => page?.id).slice(0, 40).map((page) => ({ id: text(page.id, 200), title: text(page.title || 'Leht', 200) })),
      updatedAt: now,
    };
    await setDoc(doc(db, 'lessonSummaries', invitation.id), record);
    return normalizeSummary(invitation.id, record);
  },

  subscribeForStudent(studentId, onData, onError) {
    if (!studentId) { onData([]); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(query(collection(db, 'lessonSummaries'), where('studentId', '==', studentId)),
      (snapshot) => onData(snapshot.docs.map((d) => normalizeSummary(d.id, d.data()))), (error) => onError?.(error));
  },
};
