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

// ---- partners (the accountant 2026-10-24, docs/ACCOUNTING.md „Partnerid”): a line may carry { type, id, name } ----
// lines on the supplier accounts need a supplier in a manual entry (functions/accounting-core.js SUPPLIER_ACCOUNTS)
export const SUPPLIER_ACCOUNTS = ['2110', '1350'];
export const CUSTOMER_ACCOUNTS = ['1200', '2500'];
export const PARTNER_TYPE_LABELS = { supplier: 'Tarnija', customer: 'Klient' };
export const partnerLabel = (partner) => String(partner?.name || '');
// one key per partner: a card id when there is one, else the name; lines without a partner → 'none'
export const partnerKey = (partner) => (partner && (partner.id || partner.name) ? `${partner.type || ''}:${partner.id || String(partner.name).trim().toLocaleLowerCase('et')}` : 'none');

const byNumber = (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.number).localeCompare(String(b.number));
const inPeriod = (date, { from = '', to = '' } = {}) => (!from || date >= from) && (!to || date <= to);

export function sortedEntries(entries = []) {
  return [...entries].sort(byNumber);
}

// Company on the registers' footer: the same details as on the invoices (functions/index.js PAYMENT_DETAILS).
export const COMPANY = Object.freeze({ name: 'E&P Koolitus OÜ', regCode: '17270880' });

// Kande koodid (the entry types of the Päevaraamat, like OA Ostuarve kanne in Merit / the owner's template). A sales
// document and the money received for it are always separate entries with separate codes (the accountant 2026-10-23).
export const ENTRY_CODES = [
  ['MA', 'Müügiarve kanne'],
  ['KR', 'Kreeditarve kanne'],
  ['LK', 'Laekumise kanne'],
  ['TG', 'Tagastuse kanne'],
  ['OA', 'Ostuarve kanne'],
  ['VM', 'Väljamakse kanne'],
  ['PR', 'Pearaamatu kanne'],
  ['ST', 'Stornokanne'],
  ['AS', 'Algsaldode kanne'],
];
export const entryCodeName = (code) => ENTRY_CODES.find(([value]) => value === code)?.[1] || '';
const CODE_BY_DOCUMENT = { invoice: 'MA', creditNote: 'KR', payment: 'LK', bankTransaction: 'LK', refund: 'TG', expense: 'OA', purchaseInvoice: 'OA', supplierPayment: 'VM' };

// opening → AS, storno → ST, manual → PR; an automatic entry by its source document (invoice and its cancellation MA,
// credit note KR, payment, payment void, payer credit LK, refund TG, expense and its correction and a purchase invoice
// OA, a payment to a supplier VM)
export function entryCode(entry = {}) {
  if (entry.origin === 'opening') return 'AS';
  if (entry.origin === 'reversal') return 'ST';
  if (entry.origin === 'manual') return 'PR';
  return CODE_BY_DOCUMENT[entry.documentType] || 'PR';
}

// "1 234,56" (a space between thousands, a comma before the cents; the same in every browser)
export function amount(cents) {
  const value = Math.round(Number(cents || 0));
  const abs = Math.abs(value);
  const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${value < 0 ? '-' : ''}${whole},${String(abs % 100).padStart(2, '0')}`;
}
export const dmy = (date) => (/^\d{4}-\d{2}-\d{2}/.test(String(date || '')) ? `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}` : '');

const PURCHASE_TYPES = new Set(['purchaseInvoice', 'supplierPayment']);
const entryYear = (entry) => String(entry.number || '').match(/^(\d{4})-/)?.[1] || String(entry.date || '').slice(0, 4);
const entrySequence = (entry) => Number(entry.sequence || String(entry.number || '').match(/-(\d+)$/)?.[1] || 0);

// Päevaraamat in the layout of the owner's template (Päevaraamat, OÜ ElDesign): filters (period, kande kood,
// järjestus), one block per entry („MA 3 | dokument | kuupäev”, its lines with the account, document, description,
// debit and credit, the entry total), „Kokku N kannet” and „M kirjet”. The running number of a code („MA 3”) counts
// the entries of that code in a year in the order of the CRM entry numbers, so a later entry never renumbers an
// earlier one. sort: 'code' (kande kood, then its number) or 'date'.
export function journalReport(entries = [], accounts = [], { from = '', to = '', code = '', sort = 'code', showDeleted = false } = {}) {
  const names = new Map(accounts.map((a) => [String(a.code), a.name]));
  const counters = new Map();
  const numbered = [...entries]
    .sort((a, b) => entryYear(a).localeCompare(entryYear(b)) || entrySequence(a) - entrySequence(b) || String(a.number).localeCompare(String(b.number)))
    .map((entry) => {
      const kind = entryCode(entry);
      const key = `${entryYear(entry)}|${kind}`;
      const seq = (counters.get(key) || 0) + 1;
      counters.set(key, seq);
      return { entry, kind, seq };
    });
  const rows = numbered
    .filter(({ entry, kind }) => (showDeleted || !entry.deleted) && inPeriod(entry.date, { from, to }) && (!code || kind === code))
    .map(({ entry, kind, seq }) => {
      // a purchase entry reads „<tarnija> <kirjeldus>” (the accountant's template), the others „<sisu> · <märkus>”
      const sep = PURCHASE_TYPES.has(entry.documentType) ? ' ' : ' · ';
      const lines = (entry.lines || []).map((l) => ({
        account: String(l.account),
        name: names.get(String(l.account)) || '',
        documentRef: entry.documentRef || '',
        description: l.note ? `${entry.description || ''}${sep}${l.note}` : entry.description || '',
        partner: l.partner && (l.partner.id || l.partner.name) ? l.partner : null,
        debitCents: l.debitCents || 0,
        creditCents: l.creditCents || 0,
      }));
      return {
        id: entry.id,
        code: kind,
        seq,
        label: `${kind} ${seq}`,
        number: entry.number,
        date: entry.date,
        documentRef: entry.documentRef || '',
        description: entry.description || '',
        origin: entry.origin,
        reversed: Boolean(entry.reversedBy),
        reversedByNumber: entry.reversedByNumber || '',
        deleted: Boolean(entry.deleted),
        excluded: Boolean(entry.excludedInvoiceId),
        corrected: Boolean(entry.override),
        history: Array.isArray(entry.history) ? entry.history : [],
        source: entry,
        lines,
        debitCents: lines.reduce((n, l) => n + l.debitCents, 0),
        creditCents: lines.reduce((n, l) => n + l.creditCents, 0),
      };
    })
    .sort(sort === 'date'
      ? (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.number).localeCompare(String(b.number))
      : (a, b) => a.code.localeCompare(b.code) || entryYear(a).localeCompare(entryYear(b)) || a.seq - b.seq);
  const live = rows.filter((r) => !r.deleted);
  return {
    filters: { from, to, code, codeName: entryCodeName(code), sort, sortLabel: sort === 'date' ? 'Kuupäev' : 'Kande kood' },
    entries: rows,
    entryCount: live.length,
    lineCount: live.reduce((n, r) => n + r.lines.length, 0),
    debitCents: live.reduce((n, r) => n + r.debitCents, 0),
    creditCents: live.reduce((n, r) => n + r.creditCents, 0),
    deletedCount: entries.filter((e) => e.deleted && inPeriod(e.date, { from, to })).length,
  };
}

// the algsaldod entry (origin „opening”, dated on the first day of the books) is the balance at the start of a period
// that begins on or after its date — not a turnover of that period (the accountant 2026-10-24: „algsaldo привяжи к
// algsaldo”; käibeandmik 01.01–… showed the algsaldod under Käive)
const startsPeriod = (entry, from) => Boolean(from) && entry.origin === 'opening' && entry.date <= from;

function sums(entries, filter) {
  const out = new Map();
  entries.forEach((entry) => {
    if (!filter(entry.date, entry)) return;
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
  const before = sums(entries, (date, entry) => (from && date < from) || startsPeriod(entry, from));
  const beforeYear = sums(entries, (date) => yearStart && date < yearStart);
  const during = sums(entries, (date, entry) => inPeriod(date, { from, to }) && !startsPeriod(entry, from));
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

// pearaamat: the lines of one account in date order with a running balance; `partner` (a partnerKey) keeps only
// that partner's lines (the accountant 2026-10-24: pearaamat by partner)
export function ledger(entries = [], account, { from = '', to = '', partner = '' } = {}, accounts = []) {
  const code = String(account);
  const mine = (l) => String(l.account) === code && (!partner || partnerKey(l.partner) === partner);
  const type = accounts.find((a) => String(a.code) === code)?.type;
  const yearStart = from ? `${from.slice(0, 4)}-01-01` : '';
  const result = type === 'income' || type === 'expense';
  let balance = 0;
  sortedEntries(entries).forEach((e) => {
    if (!from || (e.date >= from && !startsPeriod(e, from))) return;
    if (result && e.date < yearStart) return;
    (e.lines || []).filter(mine).forEach((l) => { balance += (l.debitCents || 0) - (l.creditCents || 0); });
  });
  const opening = balance;
  const rows = [];
  sortedEntries(entries).filter((e) => inPeriod(e.date, { from, to }) && !startsPeriod(e, from)).forEach((e) => {
    (e.lines || []).filter(mine).forEach((l) => {
      balance += (l.debitCents || 0) - (l.creditCents || 0);
      rows.push({ entryId: e.id, number: e.number, date: e.date, description: e.description, documentRef: e.documentRef, partner: l.partner || null, debitCents: l.debitCents || 0, creditCents: l.creditCents || 0, balance });
    });
  });
  // the balance on the account's own side (2026-10-26: 2110 Võlad tarnijatele showed −168,00 for a debt of 168,00):
  // liabilities, equity and income count credit minus debit, so a normal balance is positive and a minus means the
  // account is on the wrong side
  const sign = type === 'liability' || type === 'equity' || type === 'income' ? -1 : 1;
  return { opening: sign * opening, rows: rows.map((r) => ({ ...r, balance: sign * r.balance })), closing: sign * balance, side: sign < 0 ? 'credit' : 'debit' };
}

// Partnerid (the accountant 2026-10-24, like Merit's partner report): per partner on one account (default 2110 Võlad
// tarnijatele; '' = every account) its balance before the period, debit and credit turnover and closing balance,
// with the lines for the drill-down. Lines without a partner are one row „Partner puudub”. Income / expense accounts
// start each year from zero, like the käibeandmik. `suppliers` give the registry code; `labels` (entry id → „OA 3”)
// the kande kood of a line.
export function partnerReport(entries = [], accounts = [], { from = '', to = '', account = '2110', type = '' } = {}, { suppliers = [], labels = new Map() } = {}) {
  const types = new Map(accounts.map((a) => [String(a.code), a.type]));
  const codes = new Map(suppliers.map((s) => [String(s.id), s.regCode || '']));
  const yearStart = from ? `${from.slice(0, 4)}-01-01` : '';
  const rows = new Map();
  const rowOf = (partner) => {
    const key = partnerKey(partner);
    if (!rows.has(key)) {
      rows.set(key, {
        key, type: partner?.type || '', id: partner?.id || '', name: partner ? partnerLabel(partner) : 'Partner puudub',
        regCode: partner?.type === 'supplier' ? codes.get(String(partner.id)) || '' : '',
        openingBalance: 0, turnover: { debit: 0, credit: 0 }, lines: [],
      });
    }
    return rows.get(key);
  };
  sortedEntries(entries).forEach((e) => {
    if (e.deleted) return;
    (e.lines || []).forEach((l) => {
      const code = String(l.account);
      if (account && code !== String(account)) return;
      if (type && (l.partner?.type || '') !== type) return;
      const result = types.get(code) === 'income' || types.get(code) === 'expense';
      const net = (l.debitCents || 0) - (l.creditCents || 0);
      const before = (from && e.date < from) || startsPeriod(e, from);
      if (before) {
        if (result && e.date < yearStart) return;
        rowOf(l.partner).openingBalance += net;
        return;
      }
      if (!inPeriod(e.date, { from, to })) return;
      const row = rowOf(l.partner);
      row.turnover.debit += l.debitCents || 0;
      row.turnover.credit += l.creditCents || 0;
      row.lines.push({ entryId: e.id, label: labels.get(e.id) || '', number: e.number, date: e.date, documentRef: e.documentRef || '', description: l.note ? `${e.description || ''} · ${l.note}` : e.description || '', account: code, debitCents: l.debitCents || 0, creditCents: l.creditCents || 0 });
    });
  });
  const list = [...rows.values()].map((r) => {
    let balance = r.openingBalance;
    const lines = r.lines.map((l) => { balance += l.debitCents - l.creditCents; return { ...l, balance }; });
    return { ...r, lines, opening: split(r.openingBalance), closing: split(balance), closingBalance: balance };
  }).filter((r) => r.openingBalance || r.turnover.debit || r.turnover.credit)
    .sort((a, b) => (a.key === 'none') - (b.key === 'none') || a.name.localeCompare(b.name, 'et'));
  const total = list.reduce((t, r) => ({
    opening: { debit: t.opening.debit + r.opening.debit, credit: t.opening.credit + r.opening.credit },
    turnover: { debit: t.turnover.debit + r.turnover.debit, credit: t.turnover.credit + r.turnover.credit },
    closing: { debit: t.closing.debit + r.closing.debit, credit: t.closing.credit + r.closing.credit },
  }), { opening: { debit: 0, credit: 0 }, turnover: { debit: 0, credit: 0 }, closing: { debit: 0, credit: 0 } });
  return { rows: list, total, missing: list.find((r) => r.key === 'none') || null };
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

// "1 234,56" / "1234.56" / "1234,5" / "1.234,56" / "1,234.56" / "12,00 €" → cents; empty → 0; invalid → NaN
// (amounts pasted from Excel carry thin or no-break spaces and a euro sign)
export function parseEuro(text) {
  let clean = String(text ?? '').replace(/[\s€]/g, ''); // \s covers no-break and thin spaces
  if (clean.includes(',') && clean.includes('.')) clean = clean.lastIndexOf(',') > clean.lastIndexOf('.') ? clean.replace(/\./g, '') : clean.replace(/,/g, '');
  clean = clean.replace(',', '.');
  if (!clean) return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return Number.NaN;
  return Math.round(Number(clean) * 100);
}

// the rows of an entry being typed (amounts as text): a blank row and the debit / credit sums in cents
export const blankEntryLine = () => ({ account: '', debit: '', credit: '', note: '', partner: null });
export const entryLineTotals = (lines) => lines.reduce((t, l) => ({ debit: t.debit + (parseEuro(l.debit) || 0), credit: t.credit + (parseEuro(l.credit) || 0) }), { debit: 0, credit: 0 });

// corrections (docs/ACCOUNTING.md „Parandamine”): what can be done with an entry on screen. The server checks again.
export const isLockedDate = (date, lockedThrough) => Boolean(lockedThrough && date && String(date).slice(0, 10) <= lockedThrough);
export function entryActions(entry, lockedThrough) {
  const open = !isLockedDate(entry.date, lockedThrough);
  const live = !entry.deleted && !entry.reversed && entry.origin !== 'reversal';
  return {
    edit: open && live,
    remove: open && live && entry.origin === 'manual',
    storno: live && (entry.origin === 'manual' || entry.origin === 'opening'),
    // a storno made by mistake: undone while its period is open (the original is live again)
    undoStorno: open && !entry.deleted && entry.origin === 'reversal',
    locked: !open,
  };
}
export const HISTORY_ACTIONS = { edit: 'Muudetud', override: 'Read parandatud', document: 'Dokument parandatud', delete: 'Kustutatud', partner: 'Partner lisatud', 'undo-storno': 'Ekslik storno tühistatud', 'storno-undone': 'Storno tühistati, kanne kehtib', excluded: 'Ei kuulu raamatupidamisse', included: 'Taastatud raamatupidamisse' };
export const linesText = (lines = []) => lines.map((l) => `${l.account} ${l.debitCents ? `D ${amount(l.debitCents)}` : `K ${amount(l.creditCents)}`}${l.partner?.name ? ` (${l.partner.name})` : ''}`).join(', ');
// the lines of a stored entry as editable text rows (JournalDraft)
export const editableLines = (lines = []) => lines.map((l) => ({ account: String(l.account), debit: l.debitCents ? amount(l.debitCents).replace(/\s/g, '') : '', credit: l.creditCents ? amount(l.creditCents).replace(/\s/g, '') : '', note: l.note || '', partner: l.partner && (l.partner.id || l.partner.name) ? { type: l.partner.type || '', id: l.partner.id || '', name: l.partner.name || '' } : null }));

// the content of the entry: the header „kande sisu”, or — when it was left empty — the first line's note (the accountant
// typed „müügiarve …” on the line and the entry did not save, 2026-10-24)
export const draftDescription = (draft, lines = []) => String(draft?.description || '').trim() || String(lines.find((l) => String(l.note || '').trim())?.note || '').trim();
