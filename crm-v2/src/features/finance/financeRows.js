import { invoiceAmountCents, invoicePaidCents } from './finance.js';

function asDate(value) {
  const raw = value?.toDate ? value.toDate() : value;
  if (!raw) return null;
  const date = raw instanceof Date ? raw : new Date(String(raw).length === 10 ? `${raw}T12:00:00` : raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function emailDeliveryFailed(invoice) {
  return invoice.emailStatus === 'failed' || invoice.deliveryStatus === 'failed' || invoice.emailFailed === true ||
    invoice.lastEmailStatus === 'failed' || invoice.emailDelivery?.status === 'failed';
}

function noShow(invoice) {
  return invoice.noShow === true || invoice.lessonStatus === 'Puudus_eta' || invoice.attendanceStatus === 'Puudus_eta' ||
    (Array.isArray(invoice.lessons) && invoice.lessons.some((lesson) => lesson.status === 'Puudus_eta'));
}

export function financeRowState(invoice = {}, today = new Date()) {
  const amountCents = Number.isFinite(Number(invoice.effectiveAmountCents))
    ? Math.max(0, Number(invoice.effectiveAmountCents))
    : invoiceAmountCents(invoice);
  const paymentEntriesCents = Array.isArray(invoice.payments) ? invoice.payments.reduce((sum, payment) => sum + Math.max(0, Math.round(Number(payment.amountCents ?? Number(payment.amount || 0) * 100) || 0)), 0) : 0;
  const paidCents = Math.max(invoicePaidCents(invoice), paymentEntriesCents);
  const credited = invoice.credited === true || invoice.status === 'credited' || invoice.status === 'Krediteeritud' ||
    invoice.paymentStatus === 'credited' || invoice.correctionStatus === 'fully_credited' ||
    invoice.type === 'credit-note' || invoice.kind === 'credit-note' || (amountCents === 0 && invoice.creditNoteId);
  const balanceCents = credited ? 0 : Number.isFinite(Number(invoice.balanceDueCents))
    ? Math.max(0, Number(invoice.balanceDueCents))
    : Math.max(0, amountCents - paidCents);
  const dueDate = asDate(invoice.dueDate || invoice.due);
  const todayDate = asDate(today) || new Date();
  const overdue = balanceCents > 0 && dueDate && dueDate.getTime() < new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime();
  let status = 'unpaid';
  if (credited) status = 'credit';
  else if (balanceCents === 0) status = 'paid';
  else if (overdue) status = 'overdue';
  else if (paidCents > 0) status = 'partial';
  else if (emailDeliveryFailed(invoice)) status = 'email-failed';
  else if (noShow(invoice)) status = 'no-show';
  return { status, amountCents, paidCents, balanceCents, dueDate, overdue: Boolean(overdue), emailFailed: emailDeliveryFailed(invoice), noShow: noShow(invoice) };
}

export function summarizeFinanceRows(rows = [], today = new Date()) {
  return rows.reduce((summary, row) => {
    const state = financeRowState(row, today);
    summary.count += 1;
    summary.amountCents += state.amountCents;
    summary.paidCents += state.paidCents;
    summary.balanceCents += state.balanceCents;
    summary.byStatus[state.status] += 1;
    if (state.status !== 'credit') summary.billableCents += state.amountCents;
    return summary;
  }, {
    count: 0, amountCents: 0, billableCents: 0, paidCents: 0, balanceCents: 0,
    byStatus: { unpaid: 0, partial: 0, overdue: 0, paid: 0, credit: 0, 'email-failed': 0, 'no-show': 0 },
  });
}

export function filterFinanceRows(rows = [], filters = {}, today = new Date()) {
  const query = String(filters.query || '').trim().toLocaleLowerCase('et');
  return rows.filter((row) => {
    const state = financeRowState(row, today);
    if (filters.status && filters.status !== 'all' && state.status !== filters.status) return false;
    if (filters.month && !String(row.planMonth || row.month || row.date || '').startsWith(filters.month)) return false;
    if (filters.studentId && row.studentId !== filters.studentId) return false;
    if (query) {
      const haystack = [row.num, row.invoiceNumber, row.studentName, row.payerName, row.payerEmail, row.description]
        .filter(Boolean).join(' ').toLocaleLowerCase('et');
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function sortFinanceRows(rows = [], sort = 'dueDate', direction = 'asc', today = new Date()) {
  const sign = direction === 'desc' ? -1 : 1;
  const value = (row) => {
    if (sort === 'amount') return financeRowState(row, today).balanceCents;
    if (sort === 'status') return financeRowState(row, today).status;
    if (sort === 'student') return String(row.studentName || row.payerName || '').toLocaleLowerCase('et');
    return asDate(row.dueDate || row.due)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  };
  return [...rows].sort((left, right) => {
    const a = value(left); const b = value(right);
    const compared = typeof a === 'string' ? a.localeCompare(b, 'et') : a - b;
    return sign * compared || String(left.id || '').localeCompare(String(right.id || ''), 'et');
  });
}
