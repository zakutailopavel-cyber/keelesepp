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
  createExpense(values) {
    return post('/expenses', {
      ...values,
      requestId: values.requestId || financeRequestId('expense'),
    });
  },
  correctExpense(expenseId, values, reason) {
    return post('/expenses/correct', {
      ...values,
      expenseId,
      reason,
      requestId: values.requestId || financeRequestId('expense_correction'),
    });
  },
  voidExpense(expenseId, reason) {
    return post('/expenses/void', {
      expenseId,
      reason,
      requestId: financeRequestId('expense_void'),
    });
  },
  attachExpenseDocument(expenseId, document) {
    return post('/expenses/documents', {
      expenseId,
      storagePath: document.storagePath,
      fileName: document.fileName,
      contentType: document.contentType,
      size: document.size,
      requestId: document.requestId,
    });
  },
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
  allocateBankTransaction(transaction) {
    const amount = Number(transaction.amountCents) / 100;
    const allocationAmount = Number(transaction.allocationCents) / 100;
    return post('/bank-transactions/allocate', {
      externalId: transaction.externalId || '',
      paidAt: transaction.paidAt,
      payerName: transaction.payerName || '',
      creditStudentId: transaction.studentId || '',
      reference: transaction.reference || '',
      amount,
      allocations: transaction.invoiceId && allocationAmount > 0
        ? [{ invoiceId: transaction.invoiceId, amount: allocationAmount }]
        : [],
      lessonAllocations: [],
      note: transaction.note || 'Pangaväljavõttest imporditud makse',
      requestId: transaction.requestId || financeRequestId('bank'),
    });
  },
  previewFinancialPeriod(month) {
    return post('/financial-periods/preview', { month });
  },
  reviewFinancialPeriod(month) {
    return post('/financial-periods/review', {
      month,
      requestId: financeRequestId(`period_${month}`),
    });
  },
  applyPayerCredit(creditId, invoiceId, amount, note) {
    return post('/payer-credits/apply', {
      creditId,
      allocations: [{ invoiceId, amount }],
      lessonAllocations: [],
      note: note || '',
      requestId: financeRequestId('credit_apply'),
    });
  },
  refundPayerCredit(creditId, refund) {
    return post('/payer-credits/refund', {
      creditId,
      amount: refund.amount,
      refundedAt: refund.refundedAt,
      method: refund.method || 'bank',
      reference: refund.reference || '',
      reason: refund.reason,
      requestId: financeRequestId('credit_refund'),
    });
  },
  voidPayment(paymentId, reason) {
    return post('/payments/void', {
      paymentId,
      reason,
      requestId: financeRequestId('payment_void'),
    });
  },
  resolveInvoiceOverpayment(invoiceId, reason) {
    return post('/invoices/resolve-overpayment', {
      invoiceId,
      reason,
      requestId: financeRequestId('overpayment'),
    });
  },
  attachPaymentDocument(paymentId, document) {
    return post('/payments/documents', {
      paymentId,
      storagePath: document.storagePath,
      fileName: document.fileName,
      contentType: document.contentType,
      size: document.size,
      requestId: document.requestId,
    });
  },
  previewInvoiceNumbering() {
    return post('/invoices/numbering/preview', {});
  },
  repairInvoiceNumbering(plan, reason) {
    return post('/invoices/numbering/repair', {
      expectedFingerprint: plan.fingerprint,
      reason,
      requestId: financeRequestId('invoice_numbering'),
    });
  },
};

export const invoiceDeliveryApi = {
  send(invoiceId) { return postInvoice('/send', { invoiceId }); },
  remind(invoiceId) { return postInvoice('/remind', { invoiceId }); },
  pdf(invoiceId) { return postInvoice('/pdf', { invoiceId }); },
  creditNotePdf(creditNoteId) { return postInvoice('/credit-note/pdf', { creditNoteId }); },
  sendCreditNote(creditNoteId) { return postInvoice('/credit-note/send', { creditNoteId }); },
};
