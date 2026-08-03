import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const lessonsService = {
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'lessons'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  },
};
