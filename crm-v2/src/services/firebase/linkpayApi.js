import { requireFirebaseClient } from './client.js';

// LHV LinkPay (docs/LINKPAY_INTEGRATION.md): the server signs the bank link; the browser never sees the API secret.
const defaultBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/linkpayApi';

async function post(path, body = {}, { auth: withAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const { auth } = requireFirebaseClient();
    if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  const baseUrl = String(import.meta.env.VITE_LINKPAY_API_URL || defaultBaseUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Makse alustamine ebaõnnestus.');
  return data;
}

export const linkpayApi = {
  // { enabled, environment } — public
  config() { return post('/config'); },
  // the PDF / e-mail link: invoice id + the code on the invoice, no login
  startWithCode(invoiceId, code) { return post('/start', { invoiceId, k: code }); },
  // the signed-in owner (parent, student) or staff
  startForInvoice(invoiceId) { return post('/start', { invoiceId }, { auth: true }); },
  // back from the bank: the server asks the bank for the real state
  checkReturn(paymentReference, orderReference) { return post('/return', { payment_reference: paymentReference, order_reference: orderReference }); },
  // admin: { enabled, environment, linkpayToken }; pass values with save: true to change them
  settings(values = null) { return post('/settings', values ? { ...values, save: true } : {}, { auth: true }); },
};
