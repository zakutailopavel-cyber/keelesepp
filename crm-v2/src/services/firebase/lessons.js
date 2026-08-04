import { collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { canonicalTeacherName } from '../../utils/teachers.js';

export function normalizeLesson(id, data = {}) {
  return {
    id,
    ...data,
    studentId: String(data.studentId || '').trim(),
    studentName: String(data.studentName || '').trim(),
    teacher: canonicalTeacherName(data.teacher),
    date: String(data.date || '').trim(),
    status: data.status || '',
    billingStatus: data.billingStatus || '',
  };
}

function newestFirst(left, right) {
  return `${right.date || ''}:${right.id || ''}`.localeCompare(`${left.date || ''}:${left.id || ''}`);
}

function accountingLessonId(source, occurrenceDate, studentId) {
  return `${source}_${occurrenceDate}_${studentId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 240);
}

export const lessonsService = {
  async listForBilling() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'lessons'));
    return snapshot.docs.map((item) => normalizeLesson(item.id, item.data())).sort(newestFirst);
  },
  async listForCalendar(filters = {}) {
    const { db } = requireFirebaseClient();
    const reference = collection(db, 'lessons');
    const snapshot = await getDocs(filters.teacherUid ? query(reference, where('teacherUid', '==', filters.teacherUid)) : reference);
    return snapshot.docs.map((item) => normalizeLesson(item.id, item.data())).sort(newestFirst);
  },
  async completeFromSchedule(event, user) {
    const occurrenceDate = String(event?.occurrenceDate || event?.date || '').trim();
    if (!event?.id || !event?.studentId || !/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)) throw new Error('Tunni seos on vigane.');
    const { db } = requireFirebaseClient();
    const id = accountingLessonId(`schedule_${event.id}`, occurrenceDate, event.studentId);
    const lessonRef = doc(db, 'lessons', id);
    const existing = await getDoc(lessonRef);
    if (existing.exists()) return normalizeLesson(existing.id, existing.data());
    const createdAt = new Date().toISOString();
    const value = {
      scheduleId: event.id,
      occurrenceDate,
      studentId: event.studentId,
      studentName: event.studentName || '',
      teacher: canonicalTeacherName(event.teacher || user?.displayName),
      teacherUid: event.teacherUid || user?.uid || '',
      subject: event.subject || 'Eesti keel',
      topic: event.topic || '',
      date: occurrenceDate,
      time: event.time || '',
      duration: Math.max(5, Number(event.duration) || 60),
      status: 'Toimunud',
      accountingSource: 'crm_v2',
      createdAt,
      createdByUid: user?.uid || '',
      createdByName: user?.displayName || user?.email || '',
    };
    const batch = writeBatch(db);
    batch.set(lessonRef, value);
    if (!event.recurring) batch.set(doc(db, 'schedule', event.id), { status: 'Toimunud', updatedAtIso: createdAt }, { merge: true });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'lesson.completed',
      label: `${event.studentName || 'Õpilane'} tund märgitud toimunuks`,
      studentId: event.studentId,
      studentName: event.studentName || '',
      byUid: user?.uid || '',
      byName: user?.displayName || user?.email || '',
      byRole: user?.roles?.[0] || '',
      createdAt,
      date: occurrenceDate,
      meta: { lessonId: id, scheduleId: event.id },
    });
    await batch.commit();
    return normalizeLesson(id, value);
  },
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'lessons'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => normalizeLesson(item.id, item.data())).sort(newestFirst);
  },
};
