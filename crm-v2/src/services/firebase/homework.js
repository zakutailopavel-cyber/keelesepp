import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

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
    const chunks = Array.from({ length: Math.ceil(studentIds.length / 10) }, (_, index) => studentIds.slice(index * 10, index * 10 + 10));
    const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, 'homework'), where('studentId', 'in', ids)))));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => ({ id: item.id, status: 'Ootel', ...item.data() }))).sort((a, b) => String(a.due || '9999').localeCompare(String(b.due || '9999')));
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
};
