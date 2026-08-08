'use strict';

const crypto = require('crypto');
const { createFrappeClientFromEnv } = require('./frappe-client');

const DEFAULT_ITEM_CODE = 'KEELESEPP-LESSON';
const DEFAULT_CUSTOMER_GROUP = 'KeeleSepp Customers';
const DEFAULT_TERRITORY = 'Estonia';
const DEFAULT_CURRENCY = 'EUR';

function required(name, value) {
  const clean = String(value || '').trim();
  if (!clean) throw new Error(`${name} is required`);
  return clean;
}

function cleanText(value, max = 240) {
  return String(value || '').trim().slice(0, max);
}

function money(value, name = 'amount') {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${name} must be positive`);
  return Math.round(number * 100) / 100;
}

function isoDate(value, name = 'date') {
  const clean = required(name, value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) throw new Error(`${name} must be YYYY-MM-DD`);
  return clean;
}

function stableBillingKey({ month, studentId, payerId, lessonIds = [], manualRequestId = '' }) {
  const normalizedLessons = [...new Set((lessonIds || []).map(String).map(v => v.trim()).filter(Boolean))].sort();
  const payload = {
    month: required('month', month),
    studentId: required('studentId', studentId),
    payerId: required('payerId', payerId),
    lessonIds: normalizedLessons,
    manualRequestId: cleanText(manualRequestId, 120),
  };
  return `ks_${crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 40)}`;
}

function payerCustomerName(payer) {
  return required('payer name', payer?.name || payer?.companyName || payer?.parentName);
}

function transactionCurrency(env = process.env) {
  return cleanText(env.ERPNEXT_CURRENCY || DEFAULT_CURRENCY, 12) || DEFAULT_CURRENCY;
}

function customerPayload(payer, env = process.env) {
  return {
    customer_name: payerCustomerName(payer),
    customer_type: payer?.isCompany ? 'Company' : 'Individual',
    customer_group: cleanText(env.ERPNEXT_CUSTOMER_GROUP || DEFAULT_CUSTOMER_GROUP, 140),
    territory: cleanText(env.ERPNEXT_TERRITORY || DEFAULT_TERRITORY, 140),
    default_currency: transactionCurrency(env),
    ...(payer?.email ? { custom_keelesepp_payer_email: cleanText(payer.email, 180) } : {}),
    ...(payer?.regCode ? { tax_id: cleanText(payer.regCode, 80) } : {}),
    ...(payer?.id ? { custom_keelesepp_payer_id: cleanText(payer.id, 140) } : {}),
  };
}

function invoiceItems(lines, env = process.env) {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error('invoice lines are required');
  const itemCode = cleanText(env.ERPNEXT_LESSON_ITEM_CODE || DEFAULT_ITEM_CODE, 140);
  return lines.map((line, index) => ({
    item_code: cleanText(line.itemCode || itemCode, 140),
    item_name: cleanText(line.description || line.itemName || `KeeleSepp lesson ${index + 1}`, 220),
    description: cleanText(line.description || line.itemName || `KeeleSepp lesson ${index + 1}`, 1000),
    qty: Number(line.qty || 1),
    rate: money(line.amount ?? line.rate, `line ${index + 1} amount`),
    ...(line.lessonId ? { custom_keelesepp_lesson_id: cleanText(line.lessonId, 140) } : {}),
  }));
}

function salesInvoicePayload({ customerName, dueDate, postingDate, lines, billingKey, studentId, note }, env = process.env) {
  const company = required('ERPNEXT_COMPANY', env.ERPNEXT_COMPANY);
  return {
    customer: required('customerName', customerName),
    company,
    currency: transactionCurrency(env),
    conversion_rate: 1,
    due_date: isoDate(dueDate, 'dueDate'),
    posting_date: isoDate(postingDate || new Date().toISOString().slice(0, 10), 'postingDate'),
    items: invoiceItems(lines, env),
    remarks: cleanText(note, 1000),
    custom_keelesepp_billing_key: required('billingKey', billingKey),
    custom_keelesepp_student_id: cleanText(studentId, 140),
  };
}

function normalizeInvoice(invoice) {
  if (!invoice) return null;
  return {
    id: invoice.name || '',
    status: invoice.status || (Number(invoice.docstatus) === 1 ? 'Submitted' : 'Draft'),
    docstatus: Number(invoice.docstatus || 0),
    customer: invoice.customer || '',
    grandTotal: Number(invoice.grand_total || invoice.rounded_total || 0),
    outstandingAmount: Number(invoice.outstanding_amount || 0),
    dueDate: invoice.due_date || '',
    billingKey: invoice.custom_keelesepp_billing_key || '',
  };
}

function normalizePayment(payment) {
  if (!payment) return null;
  return {
    id: payment.name || '',
    status: payment.status || (Number(payment.docstatus) === 1 ? 'Submitted' : 'Draft'),
    docstatus: Number(payment.docstatus || 0),
    paidAmount: Number(payment.paid_amount || payment.received_amount || 0),
    referenceNo: payment.reference_no || '',
  };
}

function createErpNextFinanceProvider({ client, env = process.env } = {}) {
  const frappe = client || createFrappeClientFromEnv(env);

  async function findCustomerByPayerId(payerId) {
    const id = required('payerId', payerId);
    const rows = await frappe.list('Customer', {
      fields: ['name', 'customer_name', 'custom_keelesepp_payer_id', 'tax_id'],
      filters: [['Customer', 'custom_keelesepp_payer_id', '=', id]],
      limit: 2,
    });
    if (rows.length > 1) throw new Error(`ERPNext has duplicate Customer mapping for payer ${id}`);
    return rows[0] || null;
  }

  async function ensureCustomer(payer) {
    const payerId = required('payer.id', payer?.id);
    const existing = await findCustomerByPayerId(payerId);
    if (existing) return { customer: existing, created: false };
    const created = await frappe.create('Customer', customerPayload(payer, env));
    return { customer: created, created: true };
  }

  async function findInvoiceByBillingKey(billingKey) {
    const key = required('billingKey', billingKey);
    const rows = await frappe.list('Sales Invoice', {
      fields: [
        'name', 'status', 'docstatus', 'customer', 'grand_total', 'rounded_total',
        'outstanding_amount', 'due_date', 'custom_keelesepp_billing_key',
      ],
      filters: [['Sales Invoice', 'custom_keelesepp_billing_key', '=', key]],
      limit: 2,
    });
    if (rows.length > 1) throw new Error(`ERPNext has duplicate invoices for billing key ${key}`);
    return rows[0] || null;
  }

  async function createInvoiceDraft({ payer, studentId, month, lessonIds = [], manualRequestId = '', dueDate, postingDate, lines, note = '' }) {
    const payerId = required('payer.id', payer?.id);
    const billingKey = stableBillingKey({ month, studentId, payerId, lessonIds, manualRequestId });
    const existing = await findInvoiceByBillingKey(billingKey);
    if (existing) {
      return { invoice: normalizeInvoice(existing), billingKey, idempotent: true, customerCreated: false };
    }

    const { customer, created: customerCreated } = await ensureCustomer(payer);
    const invoice = await frappe.create('Sales Invoice', salesInvoicePayload({
      customerName: customer.name,
      dueDate,
      postingDate,
      lines,
      billingKey,
      studentId,
      note,
    }, env));

    return { invoice: normalizeInvoice(invoice), billingKey, idempotent: false, customerCreated };
  }

  async function submitInvoice(invoiceName) {
    const name = required('invoiceName', invoiceName);
    const invoice = await frappe.get('Sales Invoice', name);
    if (!invoice) throw new Error(`Sales Invoice ${name} not found`);
    if (Number(invoice.docstatus) === 1) return { invoice: normalizeInvoice(invoice), idempotent: true };
    if (Number(invoice.docstatus) === 2) throw new Error(`Sales Invoice ${name} is cancelled`);

    const result = await frappe.call('frappe.client.submit', { doc: invoice });
    const submitted = result.message || result.data || await frappe.get('Sales Invoice', name);
    return { invoice: normalizeInvoice(submitted), idempotent: false };
  }

  async function createPaymentForInvoice({ invoiceName, amount, postingDate, referenceNo, referenceDate, modeOfPayment }) {
    const name = required('invoiceName', invoiceName);
    const invoice = await frappe.get('Sales Invoice', name);
    if (!invoice) throw new Error(`Sales Invoice ${name} not found`);
    if (Number(invoice.docstatus) !== 1) throw new Error(`Sales Invoice ${name} must be submitted before payment`);

    const outstanding = Number(invoice.outstanding_amount || 0);
    if (outstanding <= 0) return { payment: null, invoice: normalizeInvoice(invoice), idempotent: true };
    const paidAmount = Math.min(money(amount || outstanding, 'payment amount'), outstanding);

    const generated = await frappe.call('erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry', {
      dt: 'Sales Invoice',
      dn: name,
      party_amount: paidAmount,
      bank_amount: paidAmount,
    });
    const paymentDraft = generated.message || generated.data;
    if (!paymentDraft) throw new Error('ERPNext did not return a Payment Entry draft');

    paymentDraft.posting_date = isoDate(postingDate || new Date().toISOString().slice(0, 10), 'postingDate');
    paymentDraft.reference_no = cleanText(referenceNo || `KS-${name}`, 140);
    paymentDraft.reference_date = isoDate(referenceDate || paymentDraft.posting_date, 'referenceDate');
    if (modeOfPayment) paymentDraft.mode_of_payment = cleanText(modeOfPayment, 140);
    paymentDraft.paid_amount = paidAmount;
    paymentDraft.received_amount = paidAmount;

    const created = await frappe.create('Payment Entry', paymentDraft);
    const submitResult = await frappe.call('frappe.client.submit', { doc: created });
    const payment = submitResult.message || submitResult.data || await frappe.get('Payment Entry', created.name);
    const refreshedInvoice = await frappe.get('Sales Invoice', name);

    return {
      payment: normalizePayment(payment),
      invoice: normalizeInvoice(refreshedInvoice),
      idempotent: false,
    };
  }

  async function status() {
    const user = await frappe.whoAmI();
    return {
      provider: 'erpnext',
      connected: Boolean(user),
      user,
      company: cleanText(env.ERPNEXT_COMPANY, 180),
      currency: transactionCurrency(env),
      mode: cleanText(env.FINANCE_PROVIDER || 'firebase', 40),
    };
  }

  return {
    status,
    ensureCustomer,
    findCustomerByPayerId,
    findInvoiceByBillingKey,
    createInvoiceDraft,
    submitInvoice,
    createPaymentForInvoice,
  };
}

module.exports = {
  createErpNextFinanceProvider,
  customerPayload,
  invoiceItems,
  money,
  normalizeInvoice,
  normalizePayment,
  salesInvoicePayload,
  stableBillingKey,
  transactionCurrency,
};
