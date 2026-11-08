import { financeRowState, sortFinanceRows } from './financeRows.js';

export function pastDueInvoices(invoices = [], month) {
  return sortFinanceRows(invoices.filter((invoice) => {
    const invoiceMonth = String(invoice.planMonth || invoice.month || invoice.date || '').slice(0, 7);
    return invoiceMonth && invoiceMonth < month && financeRowState(invoice).balanceCents > 0;
  }), 'dueDate');
}

const DAY_MS = 86_400_000;

// „Võlgade vanus” (audit 2026-11-09): days past the due date, in the buckets a phone call is planned by
export function debtAgeBuckets(debts = [], today = new Date().toISOString().slice(0, 10)) {
  const buckets = [
    { id: 'notDue', label: 'Tähtaeg ees', cents: 0, count: 0 },
    { id: 'd30', label: '1–30 päeva', cents: 0, count: 0 },
    { id: 'd60', label: '31–60 päeva', cents: 0, count: 0 },
    { id: 'older', label: 'üle 60 päeva', cents: 0, count: 0 },
  ];
  const now = Date.parse(`${today}T12:00:00Z`);
  for (const invoice of debts) {
    const due = Date.parse(`${String(invoice.due || invoice.dueDate || '').slice(0, 10)}T12:00:00Z`);
    const days = Number.isFinite(due) ? Math.round((now - due) / DAY_MS) : 0;
    const bucket = days <= 0 ? buckets[0] : days <= 30 ? buckets[1] : days <= 60 ? buckets[2] : buckets[3];
    bucket.cents += financeRowState(invoice).balanceCents;
    bucket.count += 1;
  }
  return buckets;
}

// one family = one payer (e-mail, else name, else the student): the total to mention on one call
export function debtsByPayer(debts = []) {
  const map = new Map();
  for (const invoice of debts) {
    const key = String(invoice.payerEmail || invoice.payerName || invoice.studentName || invoice.studentId || '—').trim().toLowerCase();
    const entry = map.get(key) || { key, name: invoice.payerName || invoice.studentName || invoice.payerEmail || '—', students: new Set(), cents: 0, count: 0 };
    if (invoice.studentName) entry.students.add(invoice.studentName);
    entry.cents += financeRowState(invoice).balanceCents;
    entry.count += 1;
    map.set(key, entry);
  }
  return [...map.values()].map((entry) => ({ ...entry, students: [...entry.students] })).sort((a, b) => b.cents - a.cents);
}
