import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function timestampValue(value) {
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  return '';
}

const row = (item) => ({ id: item.id, ...item.data(), paidAt: timestampValue(item.data().paidAt), createdAt: timestampValue(item.data().createdAt) });
// FIE invoices' payments (fiePayments) are the owner's only: anyone else's read is refused, which here means „none”
const ownerOnly = (promise) => promise.catch(() => ({ docs: [] }));

export const paymentsService = {
  // admin (rules): every payment record, for „Kontroll” (invoices against payments) — the company's
  async listAll() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'payments'));
    return snapshot.docs.map(row);
  },
  // the owner's FIE payments (the „FIE” block)
  async listFie() {
    const { db } = requireFirebaseClient();
    const snapshot = await ownerOnly(getDocs(collection(db, 'fiePayments')));
    return snapshot.docs.map(row);
  },
  async listByInvoice(invoiceId) {
    const { db } = requireFirebaseClient();
    const [company, fie] = await Promise.all([
      getDocs(query(collection(db, 'payments'), where('invoiceId', '==', invoiceId))),
      ownerOnly(getDocs(query(collection(db, 'fiePayments'), where('invoiceId', '==', invoiceId)))),
    ]);
    return [...company.docs, ...fie.docs]
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => timestampValue(b.paidAt || b.createdAt).localeCompare(timestampValue(a.paidAt || a.createdAt)));
  },
};
