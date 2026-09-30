import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function timestampValue(value) {
  if (value?.toDate) return value.toDate().toISOString();
  return String(value || '');
}

export function normalizeWebsiteLead(id, data = {}) {
  return {
    id,
    ...data,
    status: data.status || 'new',
    source: data.source || 'website-registration',
    createdAt: timestampValue(data.createdAt),
  };
}

export const websiteLeadsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'websiteLeads'));
    return snapshot.docs.map(item => normalizeWebsiteLead(item.id, item.data()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async updateStatus(id, status, user) {
    if (!['new', 'contacted', 'converted', 'closed'].includes(status)) throw new Error('Tundmatu päringu olek.');
    const { db } = requireFirebaseClient();
    const contactLastAt = new Date().toISOString();
    await updateDoc(doc(db, 'websiteLeads', id), {
      status,
      contactOwner: user?.displayName || user?.email || '',
      contactLastAt,
    });
    return { status, contactLastAt };
  },
};
