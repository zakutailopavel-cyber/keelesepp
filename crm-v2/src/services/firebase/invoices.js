import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const invoicesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'invoices'));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
  },
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'invoices'), where('studentId', '==', studentId)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
  },
};
