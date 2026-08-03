import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const messagesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'messages'));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => String(a.createdAt || a.date || '').localeCompare(String(b.createdAt || b.date || '')));
  },
  async listByStudentIds(studentIds = []) {
    if (!studentIds.length) return [];
    const { db } = requireFirebaseClient();
    const chunks = Array.from({ length: Math.ceil(studentIds.length / 10) }, (_, index) => studentIds.slice(index * 10, index * 10 + 10));
    const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, 'messages'), where('studentId', 'in', ids)))));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))).sort((a, b) => String(a.createdAt || a.date || '').localeCompare(String(b.createdAt || b.date || '')));
  },
  async send(data, user) {
    const { db } = requireFirebaseClient();
    const now = new Date();
    const value = { ...data, text: String(data.text || '').trim(), fromUid: user.uid, fromName: user.displayName || user.email, fromRole: user.roles?.[0] || '', createdAt: now.toISOString(), date: now.toISOString().slice(0, 10), read: false };
    const reference = await addDoc(collection(db, 'messages'), value);
    return { id: reference.id, ...value };
  },
  async markRead(id) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'messages', id), { read: true });
  },
};
