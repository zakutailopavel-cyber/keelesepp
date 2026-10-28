import { describe, expect, it } from 'vitest';
import { parseEuro } from './accountingReports.js';
import {
  COL, cellText, clipboardRows, partnerMatches, partnerProblem, resolvePartner, filterEntries, flatRows, moveCell, parseDate, pasteIntoWorking, pastedEntryLines, pastedPurchaseLines,
  rangeTsv, replacementPreview, sameAsEntry, setCell, sortEntries, toWorking, workingProblem, workingValues,
} from './journalGrid.js';

const accounts = [
  { code: '1010', name: 'Pangakonto' }, { code: '1200', name: 'Ostjatelt laekumata arved' }, { code: '2210', name: 'Palgavõlg' },
  { code: '3000', name: 'Müük' }, { code: '3060', name: 'Maksuvaba müügitulu' }, { code: '4710', name: 'Palgakulu' }, { code: '9000', name: 'Suletud', active: false },
];
const row = (id, over = {}) => ({
  id, label: over.label || id, code: 'MA', seq: 1, number: '2026-0001', date: '2026-02-01', documentRef: 'KS-1', description: 'Müügiarve', origin: 'auto', history: [],
  lines: [{ account: '1200', name: '', description: 'Müügiarve', debitCents: 8000, creditCents: 0 }, { account: '3060', name: '', description: 'Müügiarve', debitCents: 0, creditCents: 8000 }],
  debitCents: 8000, creditCents: 8000, ...over,
  source: { id, origin: over.origin || 'auto', date: over.date || '2026-02-01', description: 'Müügiarve', documentRef: 'KS-1', lines: [{ account: '1200', debitCents: 8000, creditCents: 0 }, { account: '3060', debitCents: 0, creditCents: 8000 }] },
});

describe('amounts pasted from Excel', () => {
  it('reads spaces, no-break spaces, comma or dot decimals, thousands separators and the euro sign', () => {
    expect(parseEuro('1 234,50')).toBe(123450);
    expect(parseEuro('1 234,50')).toBe(123450);
    expect(parseEuro('1 234,5')).toBe(123450);
    expect(parseEuro('1.234,50')).toBe(123450);
    expect(parseEuro('1,234.50')).toBe(123450);
    expect(parseEuro('12,00 €')).toBe(1200);
    expect(parseEuro('abc')).toBeNaN();
    expect(parseEuro('')).toBe(0);
  });
});

describe('the working copy of an entry', () => {
  const entry = row('a');
  it('is the entry until a cell changes; a debit clears the credit of the line', () => {
    const w = toWorking(entry.source);
    expect(sameAsEntry(w, entry.source)).toBe(true);
    const next = setCell(w, 1, 5, '80');
    expect(next.lines[1]).toMatchObject({ debit: '80', credit: '' });
    expect(sameAsEntry(next, entry.source)).toBe(false);
    expect(setCell(w, 1, 0, '3000 Müük').lines[1].account).toBe('3000');
    expect(setCell(w, -1, 1, '15.02.2026').date).toBe('2026-02-15');
  });

  it('D ≠ K blocks saving and gives the difference; an automatic entry needs the reason', () => {
    const w = setCell(toWorking(entry.source), 0, 5, '90');
    const off = workingProblem(w, { origin: 'auto', accounts, reason: 'x' });
    expect(off.difference).toBe(1000);
    expect(off.problem).toMatch(/vahe 10,00/);
    const ok = setCell(w, 1, 6, '90,00');
    expect(workingProblem(ok, { origin: 'auto', accounts, reason: '' }).problem).toMatch(/põhjus/);
    expect(workingProblem(ok, { origin: 'auto', accounts, reason: 'parandus' }).problem).toBe('');
    expect(workingValues(ok).lines).toEqual([{ account: '1200', debitCents: 9000, creditCents: 0, note: '' }, { account: '3060', debitCents: 0, creditCents: 9000, note: '' }]);
    expect(workingProblem(setCell(ok, 1, 0, '9000'), { origin: 'auto', accounts, reason: 'x' }).problem).toMatch(/9000/);
    expect(workingProblem(setCell(ok, 1, 6, '9O'), { origin: 'auto', accounts, reason: 'x' }).problem).toMatch(/Summa/);
    expect(workingProblem({ ...ok, date: '2025-12-31' }, { origin: 'manual', accounts, originalDate: '2026-02-01' }).problem).toMatch(/Aastat/);
    expect(workingProblem(ok, { origin: 'manual', accounts, lockedThrough: '2026-02-28' }).problem).toMatch(/suletud/);
  });
});

describe('cells, moves and copy', () => {
  const entries = [row('a', { label: 'MA 1' }), row('b', { label: 'MA 2', documentRef: 'KS-2' })];
  const rows = flatRows(entries);
  it('rows are the entry header and its lines; moves stop at the edges, Tab wraps', () => {
    expect(rows).toHaveLength(6);
    expect(moveCell({ row: 0, col: 0 }, 'ArrowUp', 6)).toEqual({ row: 0, col: 0 });
    expect(moveCell({ row: 1, col: 6 }, 'Tab', 6)).toEqual({ row: 2, col: 0 });
    expect(moveCell({ row: 2, col: 0 }, 'Tab', 6, { shift: true })).toEqual({ row: 1, col: 6 });
    expect(moveCell({ row: 1, col: 3 }, 'Enter', 6)).toEqual({ row: 2, col: 3 });
    expect(moveCell({ row: 1, col: 3 }, 'Enter', 6, { shift: true })).toEqual({ row: 0, col: 3 });
  });
  it('a selection is copied as tab separated rows', () => {
    const tsv = rangeTsv(rows, { row: 1, col: 0 }, { row: 2, col: 6 }, (r, c) => cellText(entries.find((e) => e.id === r.entryId), null, r.line, c));
    expect(tsv).toBe('1200\t01.02.2026\tKS-1\tMüügiarve\t\t80,00\t0,00\n3060\t01.02.2026\tKS-1\tMüügiarve\t\t0,00\t80,00');
  });
});

describe('filter and sort', () => {
  const entries = [row('a', { label: 'MA 1', documentRef: 'KS-9', description: 'Arve Mari', debitCents: 8000, date: '2026-02-03' }), row('b', { label: 'PR 1', code: 'PR', documentRef: 'PL 1', description: 'Palk', lines: [{ account: '4710', debitCents: 12345, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 12345 }], debitCents: 12345, date: '2026-02-01' })];
  it('by account, text, document and amount', () => {
    expect(filterEntries(entries, { account: '47' }).map((e) => e.id)).toEqual(['b']);
    expect(filterEntries(entries, { text: 'mari' }).map((e) => e.id)).toEqual(['a']);
    expect(filterEntries(entries, { doc: 'pl' }).map((e) => e.id)).toEqual(['b']);
    expect(filterEntries(entries, { sum: '123,45' }).map((e) => e.id)).toEqual(['b']);
  });
  it('by a column, both ways', () => {
    expect(sortEntries(entries, { key: 'date' }).map((e) => e.id)).toEqual(['b', 'a']);
    expect(sortEntries(entries, { key: 'amount', dir: 'desc' }).map((e) => e.id)).toEqual(['b', 'a']);
    expect(sortEntries(entries, { key: 'doc' }).map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('paste from Excel', () => {
  it('reads Konto | Kirjeldus | Deebet | Kreedit, with Kuupäev | Dokument first, or a copy of the päevaraamat', () => {
    expect(clipboardRows('a\t"b\tc"\r\n\nd\t"say ""hi"""\n')).toEqual([['a', 'b\tc'], ['d', 'say "hi"']]);
    const four = pastedEntryLines('Konto\tKirjeldus\tDeebet\tKreedit\n4710\tPalk\t1 234,50\t\n2210\tPalgavõlg\t\t1 234,50\n');
    expect(four.lines).toEqual([{ account: '4710', note: 'Palk', debit: '1234,50', credit: '', partnerText: '' }, { account: '2210', note: 'Palgavõlg', debit: '', credit: '1234,50', partnerText: '' }]);
    const six = pastedEntryLines('31.01.2026\tPL 01\t4710\tPalk\t100\t\n31.01.2026\tPL 01\t2210\t\t\t100,00');
    expect(six).toMatchObject({ date: '2026-01-31', documentRef: 'PL 01' });
    expect(six.lines.map((l) => l.account)).toEqual(['4710', '2210']);
    const copy = pastedEntryLines('4710 Palgakulu\t31.01.2026\tPL 01\tPalk\t100,00\t0,00\n2210 Palgavõlg\t31.01.2026\tPL 01\tPalk\t0,00\t100,00');
    expect(copy.lines).toEqual([{ account: '4710', note: 'Palk', debit: '100,00', credit: '', partnerText: '' }, { account: '2210', note: 'Palk', debit: '', credit: '100,00', partnerText: '' }]);
    expect(parseDate('2026-01-31')).toBe('2026-01-31');
    expect(parseDate('1/2/2026')).toBe('2026-02-01');
  });
  it('purchase lines: Konto | Kirjeldus | Summa | KM', () => {
    expect(pastedPurchaseLines('4210\tRent\t1 220,00\t220,00\n4330\tPaber\t12,5\nKonto\tKirjeldus\tSumma')).toEqual([
      { account: '4210', description: 'Rent', amount: '1220,00', vat: '220,00', vatDeductible: false },
      { account: '4330', description: 'Paber', amount: '12,50', vat: '', vatDeductible: false },
    ]);
  });
  it('into an entry at a cell: over the grid columns, adding lines, keeping cells where the paste is empty', () => {
    const w = toWorking(row('a').source);
    const next = pasteIntoWorking(w, 1, 0, '3000\t\t\tteenus\t\t\t80\n1010\t\t\t\t\t5\t', 'auto');
    expect(next.lines).toHaveLength(3);
    expect(next.lines[1]).toMatchObject({ account: '3000', note: 'teenus', credit: '80,00' });
    expect(next.lines[2]).toMatchObject({ account: '1010', debit: '5,00' });
    expect(next.date).toBe('2026-02-01');
  });
});

describe('„Asenda konto” preview', () => {
  it('counts the entries, lines and sums in view, skips locked ones and refuses an unknown or closed account', () => {
    const entries = [row('a', { label: 'MA 1' }), row('b', { label: 'MA 2', date: '2026-01-10' }), row('c', { label: 'MA 3', reversed: true }), row('d', { label: 'MA 4', lines: [{ account: '1200', debitCents: 1, creditCents: 0 }, { account: '3000', debitCents: 0, creditCents: 1 }] })];
    const preview = replacementPreview(entries, { from: '3060', to: '3000', lockedThrough: '2026-01-31' }, accounts);
    expect(preview.entries.map((e) => e.id)).toEqual(['a']);
    expect(preview).toMatchObject({ lineCount: 1, creditCents: 8000, debitCents: 0, problem: '' });
    expect(preview.skipped.map((s) => s.why)).toEqual(['periood suletud', 'storno või tühistatud']);
    expect(replacementPreview(entries, { from: '3060', to: '9000' }, accounts).problem).toMatch(/suletud/);
    expect(replacementPreview(entries, { from: '3060', to: '7777' }, accounts).problem).toMatch(/pole kontoplaanis/);
    expect(replacementPreview(entries, { from: '3060', to: '3060' }, accounts).problem).toMatch(/samad/);
    expect(replacementPreview(entries, { from: '5555', to: '3000' }, accounts).problem).toMatch(/ei ole/);
  });
});

describe('partners (Tarnijad) on the lines', () => {
  const suppliers = [{ id: 's1', name: 'Kirsi Residents OÜ', regCode: '12345678' }, { id: 's2', name: 'Zone Media OÜ', regCode: '11223344' }, { id: 's3', name: 'Vana OÜ', active: false }];
  const manual = { id: 'm', origin: 'manual', date: '2026-03-01', description: 'Üür', documentRef: 'OA-1', lines: [{ account: '4210', debitCents: 1000, creditCents: 0 }, { account: '2110', debitCents: 0, creditCents: 1000 }] };
  const acc = [...accounts, { code: '4210', name: 'Rent' }, { code: '2110', name: 'Võlad tarnijatele' }];

  it('suggestions: name from its start first, then anywhere or by registry code; inactive ones left out', () => {
    expect(partnerMatches(suppliers, 'ki').map((s) => s.id)).toEqual(['s1']);
    expect(partnerMatches(suppliers, 'oü').map((s) => s.id)).toEqual(['s1', 's2']);
    expect(partnerMatches(suppliers, '1122').map((s) => s.id)).toEqual(['s2']);
    expect(partnerMatches(suppliers, 'vana')).toEqual([]);
    expect(partnerMatches(suppliers, '')).toEqual([]);
  });

  it('a typed partner resolves by exact name or registry code; anything else is unresolved and blocks saving', () => {
    expect(resolvePartner('kirsi residents oü', suppliers)).toEqual({ type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' });
    expect(resolvePartner('11223344', suppliers)).toEqual({ type: 'supplier', id: 's2', name: 'Zone Media OÜ' });
    expect(resolvePartner('', suppliers)).toBeNull();
    const customer = { type: 'customer', id: 'st1', name: 'Mari' };
    expect(resolvePartner('Mari', suppliers, customer)).toBe(customer);
    const w = setCell(toWorking(manual), 1, COL.partner, 'Kirsi');
    expect(w.lines[1].partner).toEqual({ type: '', id: '', name: 'Kirsi' });
    expect(workingProblem(w, { origin: 'auto', accounts: acc, reason: 'x' }).problem).toMatch(/Partner „Kirsi” — vali tarnija/);
    const picked = setCell(w, 1, COL.partner, 'Kirsi Residents OÜ', { picked: suppliers[0] });
    expect(picked.lines[1].partner).toEqual({ type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' });
    expect(workingValues(picked).lines[1].partner.id).toBe('s1');
    expect(workingValues(picked).lines[0].partner).toBeUndefined();
  });

  it('a partner on 2110 / 1350 is optional (owner 2026-10-26: the bookkeeper links them herself)', () => {
    const w = setCell(toWorking(manual), 0, COL.text, 'rent');
    expect(workingProblem(w, { origin: 'manual', accounts: acc }).problem).toBe('');
    expect(workingProblem(w, { origin: 'auto', accounts: acc, reason: 'x' }).problem).toBe('');
    const fixed = setCell(w, 1, COL.partner, '12345678', { suppliers });
    expect(workingProblem(fixed, { origin: 'manual', accounts: acc }).problem).toBe('');
    expect(partnerProblem([{ account: '1350', debit: '5', partner: null }], { required: true })).toMatch(/1350/);
    expect(partnerProblem([{ account: '1350', debit: '', credit: '', partner: null }], { required: true })).toBe('', 'an empty line is not a line');
  });

  it('a partner change is a change (sameAsEntry); filter and sort by partner', () => {
    const withPartner = { ...manual, lines: [manual.lines[0], { ...manual.lines[1], partner: { type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' } }] };
    expect(sameAsEntry(toWorking(withPartner), withPartner)).toBe(true);
    expect(sameAsEntry(setCell(toWorking(withPartner), 1, COL.partner, ''), withPartner)).toBe(false);
    const entries = [row('a', { lines: [{ account: '2110', partner: { name: 'Zone Media OÜ' }, debitCents: 1, creditCents: 0 }] }), row('b', { lines: [{ account: '2110', partner: { name: 'Kirsi Residents OÜ' }, debitCents: 1, creditCents: 0 }] }), row('c')];
    expect(filterEntries(entries, { partner: 'kirsi' }).map((e) => e.id)).toEqual(['b']);
    expect(sortEntries(entries, { key: 'partner' }).map((e) => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('paste: a Partner column after Kreedit, the päevaraamat copy with Partner, and pasting into the partner cell', () => {
    const five = pastedEntryLines('4210\tRent\t100\t\t\n2110\tRent\t\t100\tKirsi Residents OÜ');
    expect(five.lines.map((l) => [l.account, l.partnerText])).toEqual([['4210', ''], ['2110', 'Kirsi Residents OÜ']]);
    const copy = pastedEntryLines('2110 Võlad tarnijatele\t01.03.2026\tOA-1\tRent\tZone Media OÜ\t0,00\t100,00');
    expect(copy.lines[0]).toMatchObject({ account: '2110', partnerText: 'Zone Media OÜ', credit: '100,00', debit: '' });
    expect(copy.date).toBe('2026-03-01');
    const w = pasteIntoWorking(toWorking(manual), 1, COL.partner, '11223344', 'manual', suppliers);
    expect(w.lines[1].partner).toEqual({ type: 'supplier', id: 's2', name: 'Zone Media OÜ' });
    expect(cellText(row('x'), w, 1, COL.partner)).toBe('Zone Media OÜ');
  });
});
