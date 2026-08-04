import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function timestampValue(value) {
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  return '';
}

export const paymentsService = {
  async listByInvoice(invoiceId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'payments'), where('invoiceId', '==', invoiceId)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => timestampValue(b.paidAt || b.createdAt).localeCompare(timestampValue(a.paidAt || a.createdAt)));
  },
};
