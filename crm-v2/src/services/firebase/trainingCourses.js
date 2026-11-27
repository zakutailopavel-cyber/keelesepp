import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { normalizeCourse, recordOf, validateCourse } from '../../features/training/trainingModel.js';

// „Täienduskoolitus (EHIS)” (admin only, firestore.rules trainingCourseValid): course runs, participants and the
// register of numbered certificates; archived, never deleted
const adminOnly = (user, message) => { if (!user?.roles?.includes('admin')) throw new Error(message); };
const chunks = (values, size) => Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));

export const trainingCoursesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'trainingCourses'));
    return snapshot.docs.map((item) => normalizeCourse(item.id, item.data()));
  },
  async create(values, user) {
    adminOnly(user, 'Kursusi lisab administraator.');
    const error = validateCourse(values);
    if (error) throw new Error(error);
    const { db } = requireFirebaseClient();
    const reference = doc(collection(db, 'trainingCourses'));
    const now = new Date().toISOString();
    const value = { ...recordOf(values), createdAt: now, createdByUid: user.uid, createdByName: String(user.displayName || user.email || '').slice(0, 120), updatedAt: now };
    await setDoc(reference, value);
    return normalizeCourse(reference.id, value);
  },
  async update(course, values, user) {
    adminOnly(user, 'Kursusi muudab administraator.');
    const error = validateCourse(values);
    if (error) throw new Error(error);
    const { db } = requireFirebaseClient();
    const value = { ...recordOf(values), updatedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'trainingCourses', course.id), value);
    return normalizeCourse(course.id, { ...course, ...value });
  },
  // the lesson marks of the participants (read only): attendance is counted from them
  async lessonsOf(studentIds = []) {
    const ids = [...new Set(studentIds.filter(Boolean))];
    if (!ids.length) return [];
    const { db } = requireFirebaseClient();
    const snapshots = await Promise.all(chunks(ids, 10).map((part) => getDocs(query(collection(db, 'lessons'), where('studentId', 'in', part)))));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => {
      const data = item.data();
      return { studentId: String(data.studentId || ''), date: String(data.date || ''), status: String(data.status || ''), duration: Number(data.duration) || 60 };
    }));
  },
};
