import { requireFirebaseClient } from './client.js';
import { financeRequestId } from './financeApi.js';

const defaultBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/manualInvoiceApi';
const REQUEST_TIMEOUT_MS = 12000;

async function post(path, body = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_MANUAL_INVOICE_API_URL || defaultBaseUrl).replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await globalThis.fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Finantspäring ebaõnnestus.');
    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Finantsteenus ei vastanud õigel ajal. Proovi uuesti.');
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export const manualInvoiceApi = {
  async listStudents() {
    const result = await post('/students');
    return result.students || [];
  },
  async automationPreview() {
    const result = await post('/automation-preview');
    return result.preview || null;
  },
  async refreshAutomationPreview() {
    const result = await post('/automation-preview/refresh');
    return result.preview || null;
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
