// Bookkeeping registers from the entries (docs/ACCOUNTING.md, Raamatupidamise seadus § 9): päevaraamat in date order,
// pearaamat by account, käibeandmik (opening balance, turnover, closing balance), bilanss and kasumiaruanne. Pure:
// entries and accounts in, rows out. Amounts are integer cents; a balance is debit minus credit.

export const ACCOUNT_TYPES = [
  ['asset', 'Vara'],
  ['liability', 'Kohustis'],
  ['equity', 'Omakapital'],
  ['income', 'Tulu'],
  ['expense', 'Kulu'],
];
export const accountTypeLabel = (type) => ACCOUNT_TYPES.find(([value]) => value === type)?.[1] || type;

const byNumber = (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.number).localeCompare(String(b.number));
const inPeriod = (date, { from = '', to = '' } = {}) => (!from || date >= from) && (!to || date <= to);

export function sortedEntries(entries = []) {
  return [...entries].sort(byNumber);
}

// päevaraamat: one block per entry, one row per line (the layout of P2evaraamat.xls)
export function journalRows(entries = [], accounts = [], period = {}) {
  const names = new Map(accounts.map((a) => [String(a.code), a.name]));
  return sortedEntries(entries).filter((e) => inPeriod(e.date, period)).map((entry) => ({
    id: entry.id,
    number: entry.number,
    date: entry.date,
    description: entry.description,
    documentRef: entry.documentRef,
    origin: entry.origin,
    reversedBy: entry.reversedByNumber || '',
    reversalOf: entry.reversalOf || '',
    lines: (entry.lines || []).map((l) => ({ ...l, name: names.get(String(l.account)) || '' })),
    totalCents: entry.totalCents || (entry.lines || []).reduce((n, l) => n + (l.debitCents || 0), 0),
  }));
}

function sums(entries, filter) {
  const out = new Map();
  entries.forEach((entry) => {
    if (!filter(entry.date)) return;
    (entry.lines || []).forEach((l) => {
      const row = out.get(String(l.account)) || { debit: 0, credit: 0 };
      row.debit += l.debitCents || 0;
      row.credit += l.creditCents || 0;
      out.set(String(l.account), row);
    });
  });
  return out;
}

const split = (balance) => (balance >= 0 ? { debit: balance, credit: 0 } : { debit: 0, credit: -balance });

// käibeandmik: for each account with a movement, its balance before the period, the debit and credit turnover in it
// and its balance at the end. Income and expense accounts start each financial year from zero.
export function trialBalance(entries = [], accounts = [], { from = '', to = '' } = {}) {
  const yearStart = from ? `${from.slice(0, 4)}-01-01` : '';
  const before = sums(entries, (date) => from && date < from);
  const beforeYear = sums(entries, (date) => yearStart && date < yearStart);
  const during = sums(entries, (date) => inPeriod(date, { from, to }));
  const byCode = new Map(accounts.map((a) => [String(a.code), a]));
  const codes = [...new Set([...before.keys(), ...during.keys()])].sort((a, b) => a.localeCompare(b, 'et', { numeric: true }));
  const rows = codes.map((code) => {
    const account = byCode.get(code) || { code, name: '(tundmatu konto)', type: '' };
    const result = account.type === 'income' || account.type === 'expense';
    const b = before.get(code) || { debit: 0, credit: 0 };
    const y = result ? (beforeYear.get(code) || { debit: 0, credit: 0 }) : { debit: 0, credit: 0 };
    const opening = (b.debit - b.credit) - (y.debit - y.credit);
    const d = during.get(code) || { debit: 0, credit: 0 };
    const closing = opening + d.debit - d.credit;
    return {
      code, name: account.name, type: account.type, reportLine: account.reportLine || '',
      opening: split(opening), turnover: { debit: d.debit, credit: d.credit }, closing: split(closing),
      closingBalance: closing,
    };
  }).filter((r) => r.opening.debit || r.opening.credit || r.turnover.debit || r.turnover.credit);
  const total = rows.reduce((t, r) => ({
    opening: { debit: t.opening.debit + r.opening.debit, credit: t.opening.credit + r.opening.credit },
    turnover: { debit: t.turnover.debit + r.turnover.debit, credit: t.turnover.credit + r.turnover.credit },
    closing: { debit: t.closing.debit + r.closing.debit, credit: t.closing.credit + r.closing.credit },
  }), { opening: { debit: 0, credit: 0 }, turnover: { debit: 0, credit: 0 }, closing: { debit: 0, credit: 0 } });
  return { rows, total, balanced: total.turnover.debit === total.turnover.credit && total.closing.debit === total.closing.credit };
}

// pearaamat: the lines of one account in date order with a running balance
export function ledger(entries = [], account, { from = '', to = '' } = {}, accounts = []) {
  const code = String(account);
  const type = accounts.find((a) => String(a.code) === code)?.type;
  const yearStart = from ? `${from.slice(0, 4)}-01-01` : '';
  const result = type === 'income' || type === 'expense';
  let balance = 0;
  sortedEntries(entries).forEach((e) => {
    if (!from || e.date >= from) return;
    if (result && e.date < yearStart) return;
    (e.lines || []).filter((l) => String(l.account) === code).forEach((l) => { balance += (l.debitCents || 0) - (l.creditCents || 0); });
  });
  const opening = balance;
  const rows = [];
  sortedEntries(entries).filter((e) => inPeriod(e.date, { from, to })).forEach((e) => {
    (e.lines || []).filter((l) => String(l.account) === code).forEach((l) => {
      balance += (l.debitCents || 0) - (l.creditCents || 0);
      rows.push({ entryId: e.id, number: e.number, date: e.date, description: e.description, documentRef: e.documentRef, debitCents: l.debitCents || 0, creditCents: l.creditCents || 0, balance });
    });
  });
  return { opening, rows, closing: balance };
}

// kasumiaruanne for the period: income and expense by report line
export function incomeStatement(entries = [], accounts = [], period = {}) {
  const { rows } = trialBalance(entries, accounts, period);
  const lines = new Map();
  rows.filter((r) => r.type === 'income' || r.type === 'expense').forEach((r) => {
    const amount = r.type === 'income' ? r.turnover.credit - r.turnover.debit : r.turnover.debit - r.turnover.credit;
    const key = `${r.type}|${r.reportLine || r.name}`;
    const row = lines.get(key) || { type: r.type, line: r.reportLine || r.name, amountCents: 0, accounts: [] };
    row.amountCents += amount;
    row.accounts.push(r.code);
    lines.set(key, row);
  });
  const income = [...lines.values()].filter((l) => l.type === 'income');
  const expense = [...lines.values()].filter((l) => l.type === 'expense');
  const incomeCents = income.reduce((n, l) => n + l.amountCents, 0);
  const expenseCents = expense.reduce((n, l) => n + l.amountCents, 0);
  return { income, expense, incomeCents, expenseCents, profitCents: incomeCents - expenseCents };
}

// bilanss at the end of the period: assets against liabilities and equity; the year's result so far is shown as
// „Aruandeaasta kasum (kahjum)” so the two sides match before the year is closed
export function balanceSheet(entries = [], accounts = [], { to = '' } = {}) {
  const year = (to || new Date().toISOString().slice(0, 10)).slice(0, 4);
  const { rows } = trialBalance(entries, accounts, { from: '', to });
  const group = (type, sign) => {
    const lines = new Map();
    rows.filter((r) => r.type === type).forEach((r) => {
      const key = r.reportLine || r.name;
      lines.set(key, (lines.get(key) || 0) + sign * r.closingBalance);
    });
    return [...lines.entries()].map(([line, amountCents]) => ({ line, amountCents })).filter((l) => l.amountCents);
  };
  const assets = group('asset', 1);
  const liabilities = group('liability', -1);
  const equity = group('equity', -1);
  const yearResult = incomeStatement(entries, accounts, { from: `${year}-01-01`, to });
  const earlier = rows.filter((r) => (r.type === 'income' || r.type === 'expense')).reduce((n, r) => n - r.closingBalance, 0) - yearResult.profitCents;
  if (earlier) equity.push({ line: 'Eelmiste perioodide jaotamata kasum (kahjum), sulgemata', amountCents: earlier });
  if (yearResult.profitCents) equity.push({ line: 'Aruandeaasta kasum (kahjum)', amountCents: yearResult.profitCents });
  const sum = (list) => list.reduce((n, l) => n + l.amountCents, 0);
  const assetsCents = sum(assets);
  const liabilitiesCents = sum(liabilities);
  const equityCents = sum(equity);
  return { assets, liabilities, equity, assetsCents, liabilitiesCents, equityCents, balanced: assetsCents === liabilitiesCents + equityCents };
}

export const euro = (value) => (Number(value || 0) / 100).toLocaleString('et-EE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "1 234,56" / "1234.56" / "1234,5" → cents; empty → 0; invalid → NaN
export function parseEuro(text) {
  const clean = String(text ?? '').replace(/\s/g, '').replace(',', '.');
  if (!clean) return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return Number.NaN;
  return Math.round(Number(clean) * 100);
}
