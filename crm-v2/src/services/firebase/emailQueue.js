import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

const iso = (value) => (value?.toDate ? value.toDate().toISOString() : String(value || ''));

// The last e-mails the server tried to send (invoices, reminders, notifications) with their status and error text.
export const emailQueueService = {
  async recent(count = 30) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'emailQueue'), orderBy('createdAt', 'desc'), limit(count)));
    return snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        to: data.to || '',
        subject: data.subject || '',
        type: data.type || '',
        invoiceNum: data.invoiceNum || '',
        status: data.status || '',
        provider: data.provider || '',
        error: data.error || '',
        createdAt: iso(data.createdAt),
        sentAt: iso(data.sentAt),
        failedAt: iso(data.failedAt),
      };
    });
  },
};
