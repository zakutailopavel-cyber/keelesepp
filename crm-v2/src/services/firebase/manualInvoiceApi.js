import { requireFirebaseClient } from './client.js';
import { financeRequestId } from './financeApi.js';

const defaultBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/manualInvoiceApi';

async function post(path, body = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_MANUAL_INVOICE_API_URL || defaultBaseUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Finantspäring ebaõnnestus.');
  return data;
}

export const manualInvoiceApi = {
  async listStudents() {
    const result = await post('/students');
    return result.students || [];
  },
  create(values) {
    return post('/create', {
      studentId: values.studentId,
      description: values.description,
      amount: Number(values.amount),
      due: values.due,
      note: values.note || '',
      requestId: values.requestId || financeRequestId('manual_invoice'),
    });
  },
};
