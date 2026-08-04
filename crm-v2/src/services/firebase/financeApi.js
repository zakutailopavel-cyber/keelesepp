import { requireFirebaseClient } from './client.js';

const defaultBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/financeApi';

export function financeRequestId(prefix = 'finance') {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`.replace(/[^A-Za-z0-9_-]/g, '_');
}

async function post(path, body) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_FINANCE_API_URL || defaultBaseUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Finantspäring ebaõnnestus.');
  return data;
}

export const financeApi = {
  recordPayment(invoiceId, payment) {
    return post('/payments', {
      invoiceId,
      amount: payment.amount,
      paidAt: payment.paidAt,
      method: payment.method || 'bank',
      reference: payment.reference || '',
      note: payment.note || '',
      requestId: payment.requestId || financeRequestId('payment'),
    });
  },
};
