import { financeRowState } from '../financeRows.js';

// „Arve väljastaja” (owner 2026-11-09, docs/ACCOUNTING.md „FIE arved”): the owner's FIE block — its invoices, money
// and debts apart from the company's. Nothing here enters the company's revenue, analytics or books.

export const FIE_ISSUER_OPTIONS = [
  { value: '', label: 'Õpilase vaikimisi' },
  { value: 'company', label: 'E&P Koolitus OÜ' },
  { value: 'fie', label: 'FIE (minu)' },
];

export const euro = (cents) => `${(Math.round(Number(cents) || 0) / 100).toFixed(2).replace('.', ',')} €`;

// IBAN as typed by people: spaces and lower case allowed; checked with mod 97 (the server checks again)
export function validIban(value) {
  const iban = String(value || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const digits = `${iban.slice(4)}${iban.slice(0, 4)}`.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
  let rest = 0;
  for (const digit of digits) rest = (rest * 10 + Number(digit)) % 97;
  return rest === 1;
}

export function fieSettingsErrors({ name = '', iban = '' } = {}) {
  const errors = {};
  const cleanName = String(name).trim();
  if (cleanName.length < 3 || cleanName.length > 120) errors.name = 'Sisesta ees- ja perekonnanimi.';
  if (!validIban(iban)) errors.iban = 'IBAN ei ole korrektne.';
  return errors;
}

// the month filter is optional ("" = every month)
export function fieSummary(invoices = [], month = '', today = new Date()) {
  const rows = invoices
    .filter((invoice) => invoice.issuer === 'fie' && invoice.status !== 'Tühistatud')
    .filter((invoice) => !month || String(invoice.date || '').startsWith(month))
    .map((invoice) => ({ invoice, state: financeRowState(invoice, today) }));
  return {
    rows,
    count: rows.length,
    amountCents: rows.reduce((sum, row) => sum + row.state.amountCents, 0),
    paidCents: rows.reduce((sum, row) => sum + row.state.paidCents, 0),
    debtCents: rows.reduce((sum, row) => sum + row.state.balanceCents, 0),
    overdueCount: rows.filter((row) => row.state.overdue).length,
  };
}
