// Pangapõhine raamatupidamine (owner 2026-11-03, docs/ACCOUNTING.md): the lists of the „Pank” tab and the month check —
// the company account's statement lines (bankStatementLines) against account 1010 in the books. Pure functions.

export const BANK_ACCOUNT = '1010';

// the category presets (the same as functions/bank-statement-core.js CATEGORY_PRESETS); any open account may be typed
export const CATEGORY_PRESETS = {
  C: [
    { account: '3000', label: 'Müügitulu (tasu ilma arveta)' },
    { account: '2500', label: 'Ettemaks ostjalt' },
    { account: '3530', label: 'Toetus (Töötukassa jm)' },
    { account: '3560', label: 'Muu äritulu' },
    { account: '2030', label: 'Laen omanikult' },
    { account: '1230', label: 'Aruandva isiku tagastus' },
  ],
  D: [
    { account: '4320', label: 'IT teenused, tarkvara' },
    { account: '4210', label: 'Ruumide rent' },
    { account: '2210', label: 'Palga väljamakse' },
    { account: '1210', label: 'Maksude ettemaksukonto (EMTA)' },
    { account: '4340', label: 'Pangateenus' },
    { account: '4050', label: 'Õppematerjalid' },
    { account: '4330', label: 'Kontoritarbed' },
    { account: '1230', label: 'Aruandev isik (omanik)' },
    { account: '2030', label: 'Laenu tagasimakse omanikule' },
    { account: '4970', label: 'Ettevõtlusega mitteseotud kulu' },
    { account: '4398', label: 'Muu tegevuskulu' },
  ],
};

export const STATE_LABELS = {
  new: 'Uus',
  matched: 'Seotud',
  review: 'Kinnita vaste',
  unmatched: 'Ilma dokumendita',
  categorized: 'Kirjendatud',
};

const monthEnd = (month) => {
  const [y, m] = month.split('-').map(Number);
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
};
const inMonth = (date, month) => String(date || '').slice(0, 7) === month;
const signed = (line) => (line.direction === 'D' ? -1 : 1) * Number(line.amountCents || 0);
const daysApart = (a, b) => Math.abs(Date.parse(`${a}T12:00:00Z`) - Date.parse(`${b}T12:00:00Z`)) / 86400000;

// the 1010 movement of an entry (debit − credit)
export function bankMovement(entry) {
  return (entry.lines || []).filter((l) => String(l.account) === BANK_ACCOUNT).reduce((n, l) => n + Number(l.debitCents || 0) - Number(l.creditCents || 0), 0);
}

const byDate = (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id));

export function linesByState(lines = [], month = '') {
  const list = month ? lines.filter((l) => inMonth(l.date, month)) : lines;
  const of = (state) => list.filter((l) => l.state === state).sort(byDate);
  return { review: of('review'), unmatched: of('unmatched'), categorized: of('categorized'), matched: of('matched'), fresh: of('new'), all: [...list].sort(byDate) };
}

// a rule from a line: the counterparty's account when the line has one, else its name, else a piece of the explanation
export function ruleBasis(line, basis) {
  if (basis === 'account' && line.counterpartyAccount) return { counterpartyAccount: line.counterpartyAccount };
  if (basis === 'name' && line.counterpartyName) return { counterpartyName: line.counterpartyName };
  if (basis === 'explanation' && line.explanation) return { explanation: String(line.explanation).slice(0, 40) };
  return null;
}
export const defaultBasis = (line) => (line.counterpartyAccount ? 'account' : line.counterpartyName ? 'name' : 'explanation');

// Month close check: the statement (lines of the month, the bank's closing balance) against 1010 in the books.
// → { rows: [{ line, status, bookedCents, entries }], noLine: [{ entry, movement, duplicateOf }], totals, closingBooks,
//   closingBank, difference, ok }
// status: ok | open (no decision yet) | missing (linked, no live entry — „Uuenda kanded”) | amount (1010 ≠ line) |
//   date (booked in another month) | voided (the linked payment was voided)
export function monthCheck({ lines = [], entries = [], month, closingCents = null }) {
  const end = monthEnd(month);
  const live = entries.filter((e) => !e.deleted);
  const byKey = new Map(live.filter((e) => e.sourceKey).map((e) => [e.sourceKey, e]));
  const covered = new Set();
  const rows = lines.filter((l) => inMonth(l.date, month)).sort(byDate).map((line) => {
    const booked = (line.entryKeys || []).map((key) => byKey.get(key)).filter(Boolean);
    booked.forEach((e) => covered.add(e.id));
    const bookedCents = booked.reduce((n, e) => n + bankMovement(e), 0);
    let status = 'ok';
    if (line.state !== 'matched' && line.state !== 'categorized') status = 'open';
    else if (!booked.length) status = 'missing';
    else if (bookedCents === 0 && booked.some((e) => /^payment-void:/.test(e.sourceKey || ''))) status = 'voided';
    else if (bookedCents !== signed(line)) status = 'amount';
    else if (booked.some((e) => !inMonth(e.date, month))) status = 'date';
    return { line, status, bookedCents, entries: booked };
  });
  // a void of a linked payment books 1010 back: count it with its line
  rows.forEach((row) => (row.line.entryKeys || []).forEach((key) => { const void_ = byKey.get(key.replace(/^payment:/, 'payment-void:')); if (key.startsWith('payment:') && void_) covered.add(void_.id); }));
  const okRows = rows.filter((r) => r.status === 'ok');
  const noLine = live
    .filter((e) => inMonth(e.date, month) && e.origin !== 'opening' && !covered.has(e.id) && bankMovement(e) !== 0)
    .sort(byDate)
    .map((entry) => {
      const movement = bankMovement(entry);
      // a hand-made entry with the amount of a line that is already booked: the same money twice
      const twin = entry.origin === 'manual' ? okRows.find((r) => signed(r.line) === movement && daysApart(r.line.date, entry.date) <= 5) : null;
      return { entry, movement, duplicateOf: twin ? twin.line : null };
    });
  const statementIn = rows.filter((r) => r.line.direction !== 'D').reduce((n, r) => n + Number(r.line.amountCents || 0), 0);
  const statementOut = rows.filter((r) => r.line.direction === 'D').reduce((n, r) => n + Number(r.line.amountCents || 0), 0);
  const monthEntries = live.filter((e) => inMonth(e.date, month));
  const booksIn = monthEntries.reduce((n, e) => n + (e.lines || []).filter((l) => String(l.account) === BANK_ACCOUNT).reduce((s, l) => s + Number(l.debitCents || 0), 0), 0);
  const booksOut = monthEntries.reduce((n, e) => n + (e.lines || []).filter((l) => String(l.account) === BANK_ACCOUNT).reduce((s, l) => s + Number(l.creditCents || 0), 0), 0);
  const closingBooks = live.filter((e) => String(e.date) <= end).reduce((n, e) => n + bankMovement(e), 0);
  const closingBank = closingCents === null || closingCents === undefined || closingCents === '' ? null : Number(closingCents);
  const difference = closingBank === null ? null : closingBank - closingBooks;
  const problems = rows.filter((r) => r.status !== 'ok').length + noLine.length;
  return {
    rows,
    noLine,
    totals: { statementIn, statementOut, booksIn, booksOut, turnoverDifference: (statementIn - statementOut) - (booksIn - booksOut) },
    closingBooks,
    closingBank,
    difference,
    problems,
    ok: rows.length > 0 && problems === 0 && (difference === null || difference === 0),
  };
}

export const CHECK_LABELS = {
  ok: 'Korras',
  open: 'Otsus puudub',
  missing: 'Kanne puudub',
  amount: 'Summa erineb',
  date: 'Teine kuu',
  voided: 'Makse tühistatud',
};
