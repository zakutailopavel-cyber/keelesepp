import { collection, getDocs, query, where } from 'firebase/firestore';
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
};
