// Tarnijad and ostuarved on screen (docs/ACCOUNTING.md „Tarnijad ja ostuarved”). Pure helpers: the rows being typed
// (amounts as text „123,45”) ↔ the payload in cents; totals, status, filters. The server (functions/purchases-core.js)
// checks everything again and books the OA / VM entries.
import { parseEuro } from '../accounting/accountingReports.js';

export const PAYMENT_METHODS = [
  ['bank', 'Pangaülekanne'],
  ['card', 'Kaart'],
  ['cash', 'Sularaha'],
];
export const methodLabel = (value) => PAYMENT_METHODS.find(([id]) => id === value)?.[1] || value || '';
export const STATUS_LABELS = { unpaid: 'Tasumata', paid: 'Tasutud', voided: 'Tühistatud' };

const centsText = (cents) => (cents ? (Number(cents) / 100).toFixed(2).replace('.', ',') : '');

export const blankPurchaseLine = (account = '') => ({ account, description: '', amount: '', vat: '', vatDeductible: false });
export const blankPurchaseDraft = (today) => ({ supplierId: '', supplierName: '', documentNumber: '', date: today, dueDate: '', note: '', paidNow: false, method: 'bank' });

export function draftFromInvoice(invoice) {
  return {
    draft: { supplierId: invoice.supplierId, supplierName: invoice.supplierName, documentNumber: invoice.documentNumber, date: invoice.date, dueDate: invoice.dueDate || '', note: invoice.note || '', paidNow: false, method: 'bank' },
    lines: (invoice.lines || []).map((l) => ({ account: l.account, description: l.description, amount: centsText(l.amountCents), vat: centsText(l.vatCents), vatDeductible: Boolean(l.vatDeductible) })),
  };
}

export function draftTotals(lines) {
  return lines.reduce((t, l) => ({ amount: t.amount + (parseEuro(l.amount) || 0), vat: t.vat + (parseEuro(l.vat) || 0) }), { amount: 0, vat: 0 });
}

// the first problem of a draft, or '' when it can be saved
export function draftProblem(draft, lines, accounts = []) {
  if (!draft.supplierId) return 'Vali tarnija (Tarnijad).';
  if (!String(draft.documentNumber || '').trim()) return 'Lisa arve number.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date || '')) return 'Lisa arve kuupäev.';
  if (draft.dueDate && draft.dueDate < draft.date) return 'Maksetähtaeg on enne arve kuupäeva.';
  // a line with only the (pre-filled) account and nothing else is an empty line
  const filled = lines.filter((l) => String(l.description || '').trim() || l.amount || l.vat);
  if (!filled.length) return 'Lisa vähemalt üks rida.';
  for (const [index, l] of filled.entries()) {
    const account = accounts.find((a) => a.code === l.account && a.active !== false);
    if (!account) return `Rida ${index + 1}: konto puudub või on suletud.`;
    if (l.account === '2110' || l.account === '2311') return `Rida ${index + 1}: vali kulu- või varakonto.`;
    if (!String(l.description || '').trim()) return `Rida ${index + 1}: lisa kirjeldus.`;
    const amount = parseEuro(l.amount);
    const vat = parseEuro(l.vat);
    if (!amount || Number.isNaN(amount)) return `Rida ${index + 1}: summa peab olema kujul 123,45.`;
    if (Number.isNaN(vat) || vat > amount) return `Rida ${index + 1}: kontrolli käibemaksu.`;
  }
  return '';
}

export function draftPayload(draft, lines) {
  return {
    supplierId: draft.supplierId,
    documentNumber: String(draft.documentNumber || '').trim(),
    date: draft.date,
    dueDate: draft.dueDate || draft.date,
    note: draft.note || '',
    lines: lines.filter((l) => String(l.description || '').trim() || l.amount || l.vat).map((l) => ({
      account: l.account,
      description: String(l.description || '').trim(),
      amountCents: parseEuro(l.amount) || 0,
      vatCents: parseEuro(l.vat) || 0,
      vatDeductible: Boolean(l.vatDeductible) && (parseEuro(l.vat) || 0) > 0,
    })),
  };
}

export function filterInvoices(invoices = [], { from = '', to = '', status = '', query = '' } = {}) {
  const needle = String(query || '').trim().toLocaleLowerCase('et');
  return invoices
    .filter((i) => (!from || i.date >= from) && (!to || i.date <= to))
    .filter((i) => (status ? i.status === status : i.status !== 'voided'))
    .filter((i) => !needle || `${i.supplierName} ${i.documentNumber} ${(i.lines || []).map((l) => `${l.account} ${l.description}`).join(' ')}`.toLocaleLowerCase('et').includes(needle))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.documentNumber).localeCompare(String(a.documentNumber)));
}

export function invoiceTotals(invoices = []) {
  const live = invoices.filter((i) => i.status !== 'voided');
  return {
    count: live.length,
    totalCents: live.reduce((n, i) => n + (i.totalCents || 0), 0),
    openCents: live.reduce((n, i) => n + (i.totalCents || 0) - (i.paidCents || 0), 0),
  };
}

export const overdue = (invoice, today) => invoice.status === 'unpaid' && invoice.dueDate && invoice.dueDate < today;

export const blankSupplier = () => ({ name: '', regCode: '', vatNumber: '', address: '', email: '', iban: '', defaultAccount: '', active: true });
export const SUPPLIER_FIELDS = [
  ['name', 'Nimi'],
  ['regCode', 'Registrikood'],
  ['vatNumber', 'KMKR nr'],
  ['address', 'Aadress'],
  ['email', 'E-post'],
  ['iban', 'IBAN'],
  ['defaultAccount', 'Vaikekonto'],
];
export const supplierChanged = (a, b) => SUPPLIER_FIELDS.some(([key]) => String(a[key] || '') !== String(b[key] || '')) || (a.active !== false) !== (b.active !== false);
