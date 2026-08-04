import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function chunksOfTen(values = []) {
  return Array.from({ length: Math.ceil(values.length / 10) }, (_, index) => values.slice(index * 10, index * 10 + 10));
}

function timestampValue(value) {
  if (value?.toDate) return value.toDate().toISOString();
  return value || '';
}

export function normalizeSubmission(id, data = {}, submissionKind) {
  const rawScore = data.score;
  const score = rawScore && typeof rawScore === 'object'
    ? rawScore
    : null;
  const percentage = data.pct !== '' && data.pct != null && Number.isFinite(Number(data.pct))
    ? Number(data.pct)
    : score?.total
      ? Math.round((Number(score.correct) / Number(score.total)) * 100)
      : rawScore !== '' && rawScore != null && Number.isFinite(Number(rawScore))
        ? Number(rawScore)
        : null;
  return {
    id,
    submissionKind,
    studentId: data.studentId || '',
    studentName: data.studentName || '',
    title: data.lessonTitle || data.exerciseTitle || data.title || 'Õpilase töö',
    status: data.status || 'done',
    completedAt: timestampValue(data.completedAt || data.createdAt),
    answers: data.answers || data.result || {},
    errorLog: data.errorLog || [],
    selfAssessment: data.selfAssessment || null,
    score,
    percentage,
    teacherGrade: data.teacherGrade ?? '',
    teacherFeedback: data.teacherFeedback || '',
    reviewStatus: data.reviewStatus || (data.reviewedAt || data.teacherFeedback || data.teacherGrade ? 'reviewed' : 'pending'),
    reviewedAt: timestampValue(data.reviewedAt),
    reviewedByName: data.reviewedByName || '',
    source: data,
  };
}

async function listCollectionByStudentIds(db, collectionName, studentIds, submissionKind) {
  const snapshots = await Promise.all(chunksOfTen(studentIds).map((ids) => getDocs(query(
    collection(db, collectionName),
    where('studentId', 'in', ids),
  ))));
  return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => normalizeSubmission(item.id, item.data(), submissionKind)));
}

export const homeworkService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'homework'));
    return snapshot.docs.map((item) => ({ id: item.id, status: 'Ootel', ...item.data() }))
      .sort((a, b) => String(a.due || '9999').localeCompare(String(b.due || '9999')));
  },
  async listByStudentIds(studentIds = []) {
    if (!studentIds.length) return [];
    const { db } = requireFirebaseClient();
    const snapshots = await Promise.all(chunksOfTen(studentIds).map((ids) => getDocs(query(collection(db, 'homework'), where('studentId', 'in', ids)))));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => ({ id: item.id, status: 'Ootel', ...item.data() }))).sort((a, b) => String(a.due || '9999').localeCompare(String(b.due || '9999')));
  },
  async listSubmissionsByStudentIds(studentIds = []) {
    if (!studentIds.length) return [];
    const { db } = requireFirebaseClient();
    const [worksheets, exercises] = await Promise.all([
      listCollectionByStudentIds(db, 'worksheetAssignments', studentIds, 'worksheet'),
      listCollectionByStudentIds(db, 'exerciseResults', studentIds, 'exercise'),
    ]);
    return [...worksheets.filter((item) => item.status === 'done' || item.reviewStatus === 'reviewed'), ...exercises]
      .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  },
  async create(data) {
    const { db } = requireFirebaseClient();
    const value = { ...data, task: String(data.task || '').trim(), status: 'Ootel', date: new Date().toISOString().slice(0, 10), fileUrl: '', fileName: '', attachments: [] };
    const reference = await addDoc(collection(db, 'homework'), value);
    return { id: reference.id, ...value };
  },
  async setStatus(id, status) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'homework', id), { status, updatedAt: new Date().toISOString() });
  },
  async remove(id) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'homework', id));
  },
  async reviewSubmission({ submission, teacherGrade, teacherFeedback, user }) {
    const collectionName = submission?.submissionKind === 'worksheet' ? 'worksheetAssignments' : 'exerciseResults';
    const grade = teacherGrade === '' || teacherGrade == null ? null : Number(teacherGrade);
    const feedback = String(teacherFeedback || '').trim();
    if (!submission?.id || !['worksheet', 'exercise'].includes(submission.submissionKind)) throw new Error('Kontrollitavat tööd ei leitud.');
    if (grade !== null && (!Number.isInteger(grade) || grade < 1 || grade > 5)) throw new Error('Hinne peab olema vahemikus 1–5.');
    if (grade === null && !feedback) throw new Error('Lisa hinne või tagasiside.');

    const { db } = requireFirebaseClient();
    const reviewedAt = new Date().toISOString();
    const payload = {
      reviewStatus: 'reviewed',
      teacherGrade: grade,
      teacherFeedback: feedback,
      reviewedAt,
      reviewedBy: user.uid,
      reviewedByName: user.displayName || user.email || 'Õpetaja',
      seenByTeacher: true,
      updatedAt: reviewedAt,
    };
    const batch = writeBatch(db);
    batch.set(doc(db, collectionName, submission.id), payload, { merge: true });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'homework.reviewed',
      label: `${submission.title || 'Õpilase töö'} kontrollitud`,
      byUid: user.uid,
      byName: user.displayName || user.email || 'Õpetaja',
      createdAt: reviewedAt,
      date: reviewedAt.slice(0, 10),
      meta: {
        submissionId: submission.id,
        submissionKind: submission.submissionKind,
        studentId: submission.studentId || '',
        teacherGrade: grade,
      },
    });
    await batch.commit();
    return { ...submission, ...payload };
  },
};
