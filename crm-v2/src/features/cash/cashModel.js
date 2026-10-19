// Cash box view helpers (owner 2026-10-18): the server keeps cashLedger; these only format and choose.

export const euro = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);

export const todayIso = () => {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
};

export const entryDate = (entry) => entry.receivedAt || entry.handedAt || String(entry.createdAt || '').slice(0, 10);

export const STATUS_LABEL = { open: 'Arveta', allocated: 'Arvega seotud', void: 'Tühistatud', active: '' };

// a receipt still waiting for its invoice: the admin's to-do in the cash box
export const openReceipts = (entries = []) => entries.filter((entry) => entry.type === 'receipt' && entry.status === 'open');

// invoices the receipt can pay: not cancelled, something still due; the payer's own first
export function invoiceChoices(invoices = [], receipt = {}) {
  const due = (invoice) => Number(invoice.balanceDueCents ?? Math.round(Number(invoice.balanceDue ?? invoice.amount ?? 0) * 100)) || 0;
  return invoices
    .filter((invoice) => invoice.status !== 'Tühistatud' && invoice.status !== 'Makstud' && due(invoice) > 0)
    .map((invoice) => ({ ...invoice, dueCents: due(invoice), exact: due(invoice) === Number(receipt.amountCents) }))
    .sort((left, right) => Number(right.exact) - Number(left.exact) || String(left.date || '').localeCompare(String(right.date || '')));
}

// one line describing an entry: who gave or got what
export function entryLine(entry) {
  if (entry.type === 'handover') return `${entry.fromName || '—'} → ${entry.toName || '—'}`;
  return [entry.studentName, entry.payerName && entry.payerName !== entry.studentName ? `maksja ${entry.payerName}` : ''].filter(Boolean).join(' · ');
}
