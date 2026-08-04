import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const teachersService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'users'), where('role', 'in', ['admin', 'teacher'])));
    return snapshot.docs.map((item) => {
      const data = item.data();
      return { id: item.id, ...data, name: data.displayName || data.name || data.email || 'Nimetu kasutaja' };
    }).sort((a, b) => a.name.localeCompare(b.name, 'et'));
  },
  async getById(id) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'users', id));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return { id: snapshot.id, ...data, name: data.displayName || data.name || data.email || 'Nimetu kasutaja' };
  },
  async update(id, data) {
    const { db } = requireFirebaseClient();
    const allowed = ['displayName', 'email', 'role', 'disabled', 'staffNotes'];
    const value = Object.fromEntries(allowed.filter((key) => key in data).map((key) => [key, typeof data[key] === 'string' ? data[key].trim() : data[key]]));
    value.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, 'users', id), value);
    return this.getById(id);
  },
};
