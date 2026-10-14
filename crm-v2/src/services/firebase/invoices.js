import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const invoicesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'invoices'));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
  },
  // the card's own invoices and the combined invoices it is a line of (several cards of one payer on one invoice)
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const [own, combined] = await Promise.all([
      getDocs(query(collection(db, 'invoices'), where('studentId', '==', studentId))),
      // staff only: the rules cannot prove such a query for a parent or a student (they get a combined invoice through
      // its first card and their own parent link), so a refusal here is not an error
      getDocs(query(collection(db, 'invoices'), where('studentIds', 'array-contains', studentId))).catch(() => ({ docs: [] })),
    ]);
    const byId = new Map([...own.docs, ...combined.docs].map((item) => [item.id, { id: item.id, ...item.data() }]));
    return [...byId.values()].sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
  },
};
