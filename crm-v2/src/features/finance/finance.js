import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';

export function invoiceAmountCents(invoice = {}) {
  if (Number.isFinite(Number(invoice.amountCents))) return Math.max(0, Number(invoice.amountCents));
  return Math.max(0, Math.round(Number(invoice.amount || 0) * 100));
}

export function invoicePaidCents(invoice = {}) {
  if (Number.isFinite(Number(invoice.paidAmountCents))) return Math.max(0, Number(invoice.paidAmountCents));
  return Math.max(0, Math.round(Number(invoice.paidAmount || 0) * 100));
}

export function invoiceStatus(invoice = {}, today = new Date()) {
  if (invoiceBalanceCents(invoice) <= 0) return 'paid';
  if (isInvoiceOverdue(invoice, today)) return 'overdue';
  if (invoicePaidCents(invoice) > 0) return 'partial';
  return 'unpaid';
}

export function validatePayment(payment = {}) {
  const amount = Number(String(payment.amount || '').replace(',', '.'));
  const errors = {};
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Sisesta positiivne summa.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(payment.paidAt || ''))) errors.paidAt = 'Vali makse kuupäev.';
  return { amount, errors, valid: Object.keys(errors).length === 0 };
}

export function displayDate(value) {
  const raw = value?.toDate ? value.toDate() : value;
  if (!raw) return '—';
  const date = raw instanceof Date ? raw : new Date(String(raw).length === 10 ? `${raw}T12:00:00` : raw);
  return Number.isNaN(date.getTime()) ? String(raw) : new Intl.DateTimeFormat('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
