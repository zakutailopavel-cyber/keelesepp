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

// ---- Tarnijad: search, sort, duplicates, import from Excel (the accountant 2026-10-24: „Поставщиков сначала”) ----
// The server (functions/purchases-core.js supplierDuplicate / supplierImportPlan) checks the same again.
const LEGAL_FORMS = new Set(['oü', 'ou', 'as', 'mtü', 'mtu', 'fie', 'uü', 'tü', 'sa', 'ltd', 'llc', 'gmbh', 'oy', 'ab', 'sia', 'uab']);
export const supplierNameKey = (name) => String(name || '').toLowerCase().normalize('NFC').replace(/["'„”“«»().,]/g, ' ').split(/\s+/).filter((word) => word && !LEGAL_FORMS.has(word)).join(' ');

// the existing supplier a card would duplicate: the same registry code, or the same name without a different code
export function supplierDuplicate(record, suppliers = [], selfId = '') {
  const code = String(record.regCode || '').trim();
  const key = supplierNameKey(record.name);
  return suppliers.find((s) => s.id !== selfId && code && String(s.regCode || '').trim() === code)
    || suppliers.find((s) => s.id !== selfId && key && supplierNameKey(s.name) === key && (!code || !s.regCode || String(s.regCode).trim() === code))
    || null;
}

export function ibanProblem(value) {
  const iban = String(value || '').replace(/\s+/g, '').toUpperCase();
  if (!iban) return '';
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return 'IBAN on vigane.';
  const digits = `${iban.slice(4)}${iban.slice(0, 4)}`.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let rest = 0;
  for (const digit of digits) rest = (rest * 10 + Number(digit)) % 97;
  return rest === 1 ? '' : 'IBAN-i kontrollsumma ei klapi.';
}

export function filterSuppliers(suppliers = [], { query = '', showInactive = true } = {}) {
  const needle = String(query || '').trim().toLocaleLowerCase('et');
  return suppliers.filter((s) => (showInactive || s.active !== false)
    && (!needle || SUPPLIER_FIELDS.some(([key]) => String(s[key] || '').toLocaleLowerCase('et').includes(needle))));
}
export function sortSuppliers(suppliers = [], { key = 'name', dir = 'asc' } = {}) {
  const value = (s) => (key === 'active' ? (s.active === false ? '1' : '0') : String(s[key] || ''));
  const list = [...suppliers].sort((a, b) => (value(a) === '' && value(b) !== '' ? 1 : value(b) === '' && value(a) !== '' ? -1 : 0)
    || value(a).localeCompare(value(b), 'et', { numeric: true }) || String(a.name).localeCompare(String(b.name), 'et'));
  return dir === 'desc' ? list.reverse() : list;
}

// header names in a pasted Excel table → the supplier field (Tarnijad Excel export has the same order)
const HEADER_FIELDS = [
  [/^(nimi|nimetus|tarnija|name|partner)$/, 'name'],
  [/^(registrikood|reg\.?\s*-?\s*kood|reg\.?\s*nr|regcode|registry code|kood)$/, 'regCode'],
  [/^(kmkr|kmkr nr|km nr|km-nr|kmkr number|vat|vat number|käibemaksukohustuslase number)$/, 'vatNumber'],
  [/^(aadress|address)$/, 'address'],
  [/^(e-post|epost|e-mail|email|meil)$/, 'email'],
  [/^(iban|arveldusarve|pangakonto|konto nr)$/, 'iban'],
  [/^(vaikekonto|kulukonto|konto|default account)$/, 'defaultAccount'],
  [/^(aktiivne|active)$/, 'active'],
];
const DEFAULT_ORDER = [...SUPPLIER_FIELDS.map(([key]) => key), 'active'];
const headerField = (cell) => HEADER_FIELDS.find(([pattern]) => pattern.test(String(cell || '').trim().toLowerCase().replace(/[:*]/g, '')))?.[1] || '';

// rows pasted from Excel (tab separated) → supplier values. A first row of column names maps the columns (any order);
// without it the columns are Nimi | Registrikood | KMKR nr | Aadress | E-post | IBAN | Vaikekonto | Aktiivne.
export function parseSupplierPaste(text, rowsOf) {
  const rows = rowsOf(text);
  if (!rows.length) return [];
  const mapped = rows[0].map(headerField);
  const hasHeader = mapped.filter(Boolean).length >= 2 || (mapped[0] === 'name' && rows.length > 1 && rows[0].length > 1);
  const order = hasHeader ? mapped : DEFAULT_ORDER;
  return (hasHeader ? rows.slice(1) : rows).map((cells) => {
    const values = blankSupplier();
    order.forEach((key, index) => {
      if (!key || cells[index] === undefined) return;
      if (key === 'active') values.active = !/^(ei|no|false|0|mitteaktiivne)$/i.test(String(cells[index]).trim());
      else values[key] = String(cells[index]).trim();
    });
    if (values.defaultAccount) values.defaultAccount = (values.defaultAccount.match(/^\d+/) || [values.defaultAccount])[0];
    return values;
  }).filter((values) => SUPPLIER_FIELDS.some(([key]) => values[key]));
}

// what happens to each pasted row: „uus” (imported), or skipped with the reason (an error or a duplicate of a saved
// supplier or of an earlier row)
export function supplierImportPreview(rows = [], existing = [], accounts = []) {
  const seen = [...existing];
  return rows.map((values, index) => {
    const row = index + 1;
    const email = String(values.email || '').trim();
    const account = String(values.defaultAccount || '').trim();
    const error = !String(values.name || '').trim() ? 'nimi puudub'
      : ibanProblem(values.iban)
      || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'e-post on vigane' : '')
      || (account && !accounts.some((a) => String(a.code) === account && a.active !== false) ? `kontot ${account} pole või see on suletud` : '');
    if (error) return { row, values, status: 'error', message: error };
    const dup = supplierDuplicate(values, seen);
    if (dup) return { row, values, status: 'duplicate', message: dup.importRow ? `sama mis rida ${dup.importRow}` : `juba olemas: ${dup.name}${dup.regCode ? ` (${dup.regCode})` : ''}` };
    seen.push({ ...values, id: `row-${row}`, importRow: row });
    return { row, values, status: 'new', message: 'uus' };
  });
}
