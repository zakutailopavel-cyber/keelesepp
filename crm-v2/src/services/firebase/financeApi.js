import { requireFirebaseClient } from './client.js';

const defaultBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/financeApi';
const defaultInvoiceBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/invoiceApi';

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

async function postInvoice(path, body) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_INVOICE_API_URL || defaultInvoiceBaseUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Arve saatmine ebaõnnestus.');
  return data;
}

export const financeApi = {
  createInvoiceFromLessons(values) {
    return post('/invoices/from-lessons', {
      studentId: values.studentId,
      lessonIds: values.lessonIds,
      due: values.due,
      description: values.description || '',
      paymentReference: values.paymentReference || '',
      requestId: values.requestId || financeRequestId('invoice'),
    });
  },
  setLessonBillingDisposition(lessonId, billingStatus, reason) {
    return post('/lessons/billing-disposition', {
      lessonId,
      billingStatus,
      reason,
      requestId: financeRequestId('lesson_billing'),
    });
  },
  creditInvoiceLessonLine(invoiceId, lessonId, reason) {
    return post('/invoices/credit-lesson-line', {
      invoiceId,
      lessonId,
      reason,
      requestId: financeRequestId('credit_note'),
    });
  },
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

export const invoiceDeliveryApi = {
  send(invoiceId) { return postInvoice('/send', { invoiceId }); },
  remind(invoiceId) { return postInvoice('/remind', { invoiceId }); },
};
