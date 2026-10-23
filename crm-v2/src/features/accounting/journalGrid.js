// The päevaraamat as a spreadsheet (the accountant 2026-10-23: „функциональность и свобода действий как в Excel”,
// docs/ACCOUNTING.md „Päevaraamat kui tabel”). Pure helpers of JournalGrid.jsx: the cell model, the working copy of
// an entry being edited, D = K checks, filters, sorting, copy as TSV, paste from Excel and the „Asenda konto”
// preview. Nothing here talks to the server; every change still goes through financeApi.
import { amount, dmy, editableLines, entryActions, parseEuro } from './accountingReports.js';

// the six columns of the grid (the owner's template): Konto | Kuupäev | Dokument | Kirjeldus | Deebet | Kreedit
export const COLUMNS = ['account', 'date', 'doc', 'text', 'debit', 'credit'];
export const COLUMN_LABELS = ['Konto', 'Kuupäev', 'Dokument', 'Kirjeldus', 'Deebet', 'Kreedit'];
// header click sorts the entry blocks by that column
export const SORT_KEYS = { account: 'code', date: 'date', doc: 'doc', text: 'text', debit: 'amount', credit: 'amount' };
export const SORT_LABELS = { code: 'Kande kood', date: 'Kuupäev', doc: 'Dokument', text: 'Kirjeldus', amount: 'Summa' };

// ---- the working copy of an entry (amounts as typed text) ----
export const toWorking = (entry) => ({
  date: entry.date || '',
  description: entry.description || '',
  documentRef: entry.documentRef || '',
  lines: editableLines(entry.lines || []),
});

export const blankWorkingLine = () => ({ account: '', debit: '', credit: '', note: '' });

// cents of the working lines; blank lines are left out (the server drops them too)
export function workingValues(working) {
  return {
    date: working.date,
    description: working.description,
    documentRef: working.documentRef,
    lines: working.lines
      .map((l) => ({ account: String(l.account || '').trim(), debitCents: parseEuro(l.debit) || 0, creditCents: parseEuro(l.credit) || 0, note: l.note || '' }))
      .filter((l) => l.account || l.debitCents || l.creditCents),
  };
}

const snapshot = (values) => JSON.stringify({
  date: values.date || '',
  description: String(values.description || '').trim(),
  documentRef: String(values.documentRef || '').trim(),
  lines: (values.lines || []).map((l) => [String(l.account), l.debitCents || 0, l.creditCents || 0, String(l.note || '').trim()]),
});
// true when the working copy is what the entry already holds (nothing to save)
export const sameAsEntry = (working, entry) => snapshot(workingValues(working)) === snapshot(entry);

// what blocks saving the working copy, '' when it can be saved. D ≠ K gives the difference (shown in red).
export function workingProblem(working, { origin = 'manual', accounts = [], reason = '', lockedThrough = '', originalDate = '' } = {}) {
  const totals = working.lines.reduce((t, l) => ({ debit: t.debit + (parseEuro(l.debit) || 0), credit: t.credit + (parseEuro(l.credit) || 0) }), { debit: 0, credit: 0 });
  const result = { ...totals, difference: totals.debit - totals.credit, problem: '' };
  const bad = working.lines.find((l) => Number.isNaN(parseEuro(l.debit)) || Number.isNaN(parseEuro(l.credit)));
  const active = new Map(accounts.filter((a) => a.active !== false).map((a) => [String(a.code), a]));
  const values = workingValues(working);
  const unknown = values.lines.find((l) => !active.has(l.account));
  const both = values.lines.find((l) => l.debitCents && l.creditCents);
  const empty = values.lines.find((l) => l.account && !l.debitCents && !l.creditCents);
  const noAccount = values.lines.find((l) => !l.account);
  if (bad) result.problem = 'Summa peab olema kujul 1 234,56.';
  else if (noAccount) result.problem = 'Real puudub konto.';
  else if (unknown) result.problem = `Kontot ${unknown.account} pole kontoplaanis või see on suletud.`;
  else if (both) result.problem = 'Ühel real on kas deebet või kreedit, mitte mõlemad.';
  else if (empty) result.problem = `Real ${empty.account} puudub summa.`;
  else if (values.lines.length < 2 || !values.lines.some((l) => l.debitCents) || !values.lines.some((l) => l.creditCents)) result.problem = 'Kandes peab olema vähemalt üks deebet- ja üks kreeditrida.';
  else if (totals.debit !== totals.credit) result.problem = `Deebet ja kreedit ei ole võrdsed: vahe ${amount(Math.abs(totals.debit - totals.credit))}.`;
  else if (!String(working.description || '').trim()) result.problem = 'Kande sisu (kirjeldus) on kohustuslik.';
  else if (!String(working.documentRef || '').trim()) result.problem = 'Viide algdokumendile on kohustuslik.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(working.date || ''))) result.problem = 'Kande kuupäev on vigane.';
  else if (origin === 'manual' && originalDate && working.date.slice(0, 4) !== originalDate.slice(0, 4)) result.problem = 'Aastat ei saa muuta (kande number on aasta kaupa).';
  else if (lockedThrough && working.date <= lockedThrough) result.problem = `Periood on suletud kuni ${dmy(lockedThrough)}.`;
  else if (origin !== 'manual' && !String(reason || '').trim()) result.problem = 'Automaatkande parandusel on põhjus kohustuslik: täida „Paranduse põhjus” tabeli kohal.';
  return result;
}

// ---- cells ----
// a cell of a row: header row (line -1) or a line row; which columns can be typed into
export function editableColumn(row, col, origin) {
  if (row.line < 0) {
    if (col === 3) return true; // the entry's content
    return origin === 'manual' && (col === 1 || col === 2);
  }
  if (col === 0 || col === 3 || col === 4 || col === 5) return true;
  return origin === 'manual' && (col === 1 || col === 2);
}

// the text shown in a cell (copy as TSV uses the same)
export function cellText(entry, working, line, col) {
  const w = working || null;
  const date = w ? w.date : entry.date;
  const doc = w ? w.documentRef : entry.documentRef;
  if (line < 0) {
    return [entry.label, dmy(date), doc, w ? w.description : entry.description, '', ''][col];
  }
  if (w) {
    const l = w.lines[line] || {};
    const text = l.note ? `${w.description} · ${l.note}` : w.description;
    const num = (value) => { const cents = parseEuro(value); return Number.isNaN(cents) ? String(value) : amount(cents); };
    return [l.account, dmy(date), doc, text, num(l.debit), num(l.credit)][col];
  }
  const l = entry.lines[line] || {};
  return [`${l.account} ${l.name || ''}`.trim(), dmy(date), doc, l.description, amount(l.debitCents), amount(l.creditCents)][col];
}

// the raw value a cell editor starts with
export function cellValue(working, line, col) {
  if (line < 0) return [null, working.date, working.documentRef, working.description][col] ?? '';
  const l = working.lines[line] || {};
  return [l.account, working.date, working.documentRef, l.note, l.debit, l.credit][col] ?? '';
}

// a typed value written into the working copy; typing a debit clears the credit of the line and the other way round
export function setCell(working, line, col, value) {
  if (col === 1) return { ...working, date: parseDate(value) || value };
  if (col === 2) return { ...working, documentRef: value };
  if (line < 0) return col === 3 ? { ...working, description: value } : working;
  const lines = working.lines.map((l, i) => {
    if (i !== line) return l;
    if (col === 0) return { ...l, account: accountOf(value) };
    if (col === 3) return { ...l, note: value };
    if (col === 4) return { ...l, debit: value, credit: value.trim() ? '' : l.credit };
    if (col === 5) return { ...l, credit: value, debit: value.trim() ? '' : l.debit };
    return l;
  });
  return { ...working, lines };
}

// the navigable rows: the entry header row and its lines (the total row is not a cell row)
export function flatRows(entries, workings = {}) {
  const rows = [];
  entries.forEach((entry) => {
    rows.push({ entryId: entry.id, line: -1 });
    const count = workings[entry.id] ? workings[entry.id].lines.length : entry.lines.length;
    for (let i = 0; i < count; i += 1) rows.push({ entryId: entry.id, line: i });
  });
  return rows;
}

// Excel-like move of the active cell; Tab past the last column goes to the next row
export function moveCell(pos, key, rowCount, { shift = false } = {}) {
  const last = COLUMNS.length - 1;
  let { row, col } = pos;
  if (key === 'ArrowUp' || (key === 'Enter' && shift)) row -= 1;
  else if (key === 'ArrowDown' || key === 'Enter') row += 1;
  else if (key === 'ArrowLeft') col -= 1;
  else if (key === 'ArrowRight') col += 1;
  else if (key === 'Tab' && !shift) { col += 1; if (col > last) { col = 0; row += 1; } }
  else if (key === 'Tab' && shift) { col -= 1; if (col < 0) { col = last; row -= 1; } }
  else if (key === 'Home') col = 0;
  else if (key === 'End') col = last;
  row = Math.max(0, Math.min(rowCount - 1, row));
  col = Math.max(0, Math.min(last, col));
  return { row, col };
}

// cells of the rectangle between the anchor and the active cell as TSV (paste into Excel)
export function rangeTsv(rows, anchor, focus, textOf) {
  const [r0, r1] = [Math.min(anchor.row, focus.row), Math.max(anchor.row, focus.row)];
  const [c0, c1] = [Math.min(anchor.col, focus.col), Math.max(anchor.col, focus.col)];
  const out = [];
  for (let r = r0; r <= r1; r += 1) {
    const cells = [];
    for (let c = c0; c <= c1; c += 1) cells.push(String(textOf(rows[r], c) ?? '').replace(/[\t\r\n]+/g, ' '));
    out.push(cells.join('\t'));
  }
  return out.join('\n');
}
export const inRange = (anchor, focus, row, col) => Boolean(anchor) && row >= Math.min(anchor.row, focus.row) && row <= Math.max(anchor.row, focus.row) && col >= Math.min(anchor.col, focus.col) && col <= Math.max(anchor.col, focus.col);

// ---- filters and sorting (the line above the grid) ----
export function filterEntries(entries, { account = '', text = '', doc = '', sum = '' } = {}) {
  const acc = account.trim();
  const needle = text.trim().toLocaleLowerCase('et');
  const docNeedle = doc.trim().toLocaleLowerCase('et');
  const cents = sum.trim() ? parseEuro(sum) : null;
  return entries.filter((e) => {
    if (acc && !e.lines.some((l) => String(l.account).startsWith(acc))) return false;
    if (needle && !`${e.label} ${e.number} ${e.description} ${e.lines.map((l) => l.description).join(' ')}`.toLocaleLowerCase('et').includes(needle)) return false;
    if (docNeedle && !String(e.documentRef || '').toLocaleLowerCase('et').includes(docNeedle)) return false;
    if (cents !== null && !Number.isNaN(cents) && !(e.debitCents === cents || e.lines.some((l) => l.debitCents === cents || l.creditCents === cents))) return false;
    return true;
  });
}

const sorters = {
  code: (a, b) => a.code.localeCompare(b.code) || String(a.number).slice(0, 4).localeCompare(String(b.number).slice(0, 4)) || a.seq - b.seq,
  date: (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.number).localeCompare(String(b.number)),
  doc: (a, b) => String(a.documentRef).localeCompare(String(b.documentRef), 'et', { numeric: true }) || String(a.date).localeCompare(String(b.date)),
  text: (a, b) => String(a.description).localeCompare(String(b.description), 'et') || String(a.date).localeCompare(String(b.date)),
  amount: (a, b) => a.debitCents - b.debitCents || String(a.date).localeCompare(String(b.date)),
};
export function sortEntries(entries, { key = 'code', dir = 'asc' } = {}) {
  const sorter = sorters[key] || sorters.code;
  const list = [...entries].sort(sorter);
  return dir === 'desc' ? list.reverse() : list;
}

// ---- paste from Excel (tab separated rows; „1 234,50” amounts) ----
export function clipboardRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const value = String(text || '').replace(/\r\n?/g, '\n');
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (quoted) {
      if (ch === '"' && value[i + 1] === '"') { cell += '"'; i += 1; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === '\t') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

// "31.01.2026", "31/01/2026", "2026-01-31" → "2026-01-31"; anything else → ''
export function parseDate(text) {
  const value = String(text || '').trim();
  let m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return value;
  m = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}
// "4710", "4710 Palgakulu" → "4710"
export const accountOf = (text) => String(text || '').trim().match(/^(\d+)/)?.[1] || String(text || '').trim();
const isAmount = (text) => !text || !Number.isNaN(parseEuro(text));
// a typed amount as the grid shows it ("1 234,5" → "1234,50"), invalid text kept so the cell shows the error
const normAmount = (text) => { const cents = parseEuro(text); return !text ? '' : Number.isNaN(cents) ? text : cents ? amount(cents).replace(/\s/g, '') : ''; };

// rows for a journal entry: Konto | Kirjeldus | Deebet | Kreedit, optionally Kuupäev | Dokument first; a copy of
// the päevaraamat itself (Konto | Kuupäev | Dokument | Kirjeldus | Deebet | Kreedit) is read too. Header rows and
// rows without an account are skipped.
export function pastedEntryLines(text) {
  let date = '';
  let documentRef = '';
  const lines = [];
  clipboardRows(text).forEach((cells) => {
    let account; let note; let debit; let credit; let rowDate = ''; let rowDoc = '';
    if (cells.length >= 6 && parseDate(cells[0])) [rowDate, rowDoc, account, note, debit, credit] = cells;
    else if (cells.length >= 6 && parseDate(cells[1])) [account, rowDate, rowDoc, note, debit, credit] = cells;
    else if (cells.length >= 4) [account, note, debit, credit] = cells;
    else if (cells.length === 3) [account, debit, credit] = cells;
    else return;
    const code = accountOf(account);
    if (!/^\d+$/.test(code) || !isAmount(debit) || !isAmount(credit)) return;
    if (!date && rowDate) date = parseDate(rowDate);
    if (!documentRef && rowDoc) documentRef = rowDoc;
    lines.push({ account: code, note: note || '', debit: normAmount(debit || ''), credit: normAmount(credit || '') });
  });
  return { date, documentRef, lines };
}

// rows for purchase invoice lines: Konto | Kirjeldus | Summa (with VAT) | KM (optional)
export function pastedPurchaseLines(text) {
  return clipboardRows(text).map((cells) => {
    const [account, description = '', sum = '', vat = ''] = cells;
    const code = accountOf(account);
    if (!/^\d+$/.test(code) || !sum || !isAmount(sum) || !isAmount(vat)) return null;
    return { account: code, description, amount: normAmount(sum), vat: normAmount(vat), vatDeductible: false };
  }).filter(Boolean);
}

// paste into a working entry at a cell: the pasted rectangle goes over the grid's columns from that cell; missing
// lines are added to the entry
export function pasteIntoWorking(working, line, col, text, origin) {
  const rows = clipboardRows(text);
  let next = { ...working, lines: [...working.lines] };
  const start = Math.max(0, line);
  rows.forEach((cells, r) => {
    const target = start + r;
    while (next.lines.length <= target) next.lines.push(blankWorkingLine());
    cells.forEach((value, c) => {
      const column = col + c;
      // an empty pasted cell keeps what is there (a typed amount on the other side clears it anyway)
      if (column > 5 || value === '' || !editableColumn({ line: target }, column, origin)) return;
      next = setCell(next, target, column, column === 4 || column === 5 ? normAmount(value) : value);
    });
  });
  return next;
}

// ---- „Asenda konto” (find & replace an account in the filtered entries) ----
// which entries would change, how many lines and their sum; locked, deleted, reversed and storno entries are skipped
export function replacementPreview(entries, { from = '', to = '', lockedThrough = '' } = {}, accounts = []) {
  const source = String(from).trim();
  const target = String(to).trim();
  const result = { entries: [], lineCount: 0, debitCents: 0, creditCents: 0, skipped: [], problem: '' };
  if (!source || !target) { result.problem = 'Sisesta mõlemad kontod.'; return result; }
  if (source === target) { result.problem = 'Kontod on samad.'; return result; }
  const account = accounts.find((a) => String(a.code) === target);
  if (!account) { result.problem = `Kontot ${target} pole kontoplaanis.`; return result; }
  if (account.active === false) { result.problem = `Konto ${target} on suletud.`; return result; }
  entries.forEach((entry) => {
    const lines = entry.lines.filter((l) => String(l.account) === source);
    if (!lines.length || entry.deleted) return;
    const can = entryActions(entry, lockedThrough);
    if (!can.edit) { result.skipped.push({ id: entry.id, label: entry.label, why: can.locked ? 'periood suletud' : 'storno või tühistatud' }); return; }
    result.entries.push({ id: entry.id, label: entry.label, origin: entry.origin, lineCount: lines.length });
    result.lineCount += lines.length;
    lines.forEach((l) => { result.debitCents += l.debitCents; result.creditCents += l.creditCents; });
  });
  if (!result.entries.length) result.problem = `Kontot ${source} ei ole ühelgi muudetaval kandel.`;
  return result;
}
