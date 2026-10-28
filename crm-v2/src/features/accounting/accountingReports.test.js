import { describe, expect, it } from 'vitest';
import { amount, balanceSheet, dmy, entryCode, incomeStatement, journalReport, ledger, parseEuro, trialBalance } from './accountingReports.js';

const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset', reportLine: 'Raha' },
  { code: '1200', name: 'Ostjatelt laekumata arved', type: 'asset', reportLine: 'Nõuded ostjate vastu' },
  { code: '2210', name: 'Palgavõlg', type: 'liability', reportLine: 'Võlad töövõtjatele' },
  { code: '2970', name: 'Eelmiste perioodide jaotamata kasum', type: 'equity', reportLine: 'Eelmiste perioodide jaotamata kasum (kahjum)' },
  { code: '3060', name: 'Maksuvaba müügitulu', type: 'income', reportLine: 'Müügitulu' },
  { code: '4710', name: 'Palgakulu', type: 'expense', reportLine: 'Palgakulu' },
];
const e = (number, date, lines, extra = {}) => ({ id: number, number, date, description: `kanne ${number}`, documentRef: 'doc', lines: lines.map(([account, d, c]) => ({ account, debitCents: d, creditCents: c })), ...extra });
const entries = [
  e('2026-0001', '2026-01-01', [['1010', 50000, 0], ['2970', 0, 50000]], { origin: 'opening' }),
  e('2026-0003', '2026-02-03', [['1200', 8000, 0], ['3060', 0, 8000]]),
  e('2026-0002', '2026-02-10', [['1010', 8000, 0], ['1200', 0, 8000]]),
  e('2026-0004', '2026-02-28', [['4710', 3000, 0], ['2210', 0, 3000]]),
  e('2026-0005', '2026-03-05', [['1200', 6000, 0], ['3060', 0, 6000]]),
];

describe('bookkeeping registers', () => {
  it('päevaraamat in date order: one block per entry with the account names and the entry totals', () => {
    const report = journalReport(entries, accounts, { from: '2026-02-01', to: '2026-02-28', sort: 'date' });
    expect(report.entries.map((r) => r.number)).toEqual(['2026-0003', '2026-0002', '2026-0004']);
    expect(report.entries[0].lines[1]).toMatchObject({ account: '3060', name: 'Maksuvaba müügitulu', creditCents: 8000, debitCents: 0, documentRef: 'doc', description: 'kanne 2026-0003' });
    expect(report.entries[0]).toMatchObject({ debitCents: 8000, creditCents: 8000 });
    expect(report).toMatchObject({ entryCount: 3, lineCount: 6, debitCents: 19000, creditCents: 19000 });
    expect(report.filters).toMatchObject({ sortLabel: 'Kuupäev', code: '' });
  });

  it('kande kood: a sales invoice and the money received for it are separate entries with separate codes', () => {
    const docs = [
      e('2026-0010', '2026-03-01', [['1200', 8000, 0], ['3060', 0, 8000]], { origin: 'auto', documentType: 'invoice', documentRef: 'KS-7' }),
      e('2026-0011', '2026-03-04', [['1010', 8000, 0], ['1200', 0, 8000]], { origin: 'auto', documentType: 'payment', documentRef: 'KS-7' }),
      e('2026-0012', '2026-03-02', [['1200', 6000, 0], ['3060', 0, 6000]], { origin: 'auto', documentType: 'invoice', documentRef: 'KS-8' }),
      e('2026-0013', '2026-03-05', [['3060', 6000, 0], ['1200', 0, 6000]], { origin: 'auto', documentType: 'creditNote', documentRef: 'KR-1' }),
      e('2026-0014', '2026-03-06', [['4710', 100, 0], ['1010', 0, 100]], { origin: 'auto', documentType: 'expense' }),
      e('2026-0015', '2026-03-07', [['1010', 100, 0], ['4710', 0, 100]], { origin: 'reversal' }),
    ];
    expect(docs.map(entryCode)).toEqual(['MA', 'LK', 'MA', 'KR', 'OA', 'ST']);
    expect(entryCode(entries[0])).toBe('AS');
    expect(entryCode({ origin: 'manual' })).toBe('PR');
    const byCode = journalReport(docs, accounts, {});
    // sorted by code and the code's own running number (in the order of the CRM numbers, not the dates)
    expect(byCode.entries.map((r) => r.label)).toEqual(['KR 1', 'LK 1', 'MA 1', 'MA 2', 'OA 1', 'ST 1']);
    expect(byCode.entries.find((r) => r.label === 'LK 1').lines.map((l) => l.account)).toEqual(['1010', '1200']);
    expect(byCode.entries.find((r) => r.label === 'MA 1').lines.map((l) => l.account)).toEqual(['1200', '3060']);
    // the code filter keeps the running numbers; a period filter does not renumber either
    const sales = journalReport(docs, accounts, { code: 'MA', from: '2026-03-02' });
    expect(sales.entries.map((r) => `${r.label} ${r.documentRef}`)).toEqual(['MA 2 KS-8']);
    expect(sales.filters).toMatchObject({ code: 'MA', codeName: 'Müügiarve kanne', sortLabel: 'Kande kood' });
    expect(sales).toMatchObject({ entryCount: 1, lineCount: 2, debitCents: 6000, creditCents: 6000 });
  });

  it('formats amounts as 1 234,56 and dates as 04.01.2026', () => {
    expect(amount(123456)).toBe('1 234,56');
    expect(amount(123456789)).toBe('1 234 567,89');
    expect(amount(0)).toBe('0,00');
    expect(amount(5)).toBe('0,05');
    expect(amount(-98878)).toBe('-988,78');
    expect(dmy('2026-01-04')).toBe('04.01.2026');
    expect(dmy('')).toBe('');
  });

  it('käibeandmik: opening balance, turnover and closing balance per account, balanced', () => {
    const { rows, total, balanced } = trialBalance(entries, accounts, { from: '2026-02-01', to: '2026-02-28' });
    const bank = rows.find((r) => r.code === '1010');
    expect(bank.opening).toEqual({ debit: 50000, credit: 0 });
    expect(bank.turnover).toEqual({ debit: 8000, credit: 0 });
    expect(bank.closing).toEqual({ debit: 58000, credit: 0 });
    expect(rows.find((r) => r.code === '1200')).toMatchObject({ turnover: { debit: 8000, credit: 8000 }, closing: { debit: 0, credit: 0 } });
    expect(rows.find((r) => r.code === '3060').closing).toEqual({ debit: 0, credit: 8000 });
    expect(balanced).toBe(true);
    expect(total.turnover.debit).toBe(8000 + 8000 + 3000);
  });

  it('income and expense accounts start the year from zero', () => {
    const lastYear = [e('2025-0001', '2025-12-15', [['1200', 1000, 0], ['3060', 0, 1000]]), ...entries];
    const { rows } = trialBalance(lastYear, accounts, { from: '2026-01-01', to: '2026-12-31' });
    expect(rows.find((r) => r.code === '3060').opening).toEqual({ debit: 0, credit: 0 });
    expect(rows.find((r) => r.code === '1200').opening).toEqual({ debit: 1000, credit: 0 });
  });

  it('the algsaldod entry on the first day is the Algsaldo of a period starting that day, not its Käive', () => {
    const opening = e('2026-0001', '2026-01-01', [['1010', 50000, 0], ['2970', 0, 50000]], { origin: 'opening' });
    const sale = e('2026-0002', '2026-01-01', [['1010', 2000, 0], ['3060', 0, 2000]], { origin: 'auto' });
    const { rows } = trialBalance([opening, sale], accounts, { from: '2026-01-01', to: '2026-12-31' });
    const bank = rows.find((r) => r.code === '1010');
    expect(bank.opening).toEqual({ debit: 50000, credit: 0 });
    expect(bank.turnover).toEqual({ debit: 2000, credit: 0 });
    expect(bank.closing).toEqual({ debit: 52000, credit: 0 });
    expect(rows.find((r) => r.code === '2970').opening).toEqual({ debit: 0, credit: 50000 });
    const book = ledger([opening, sale], '1010', { from: '2026-01-01', to: '2026-12-31' }, accounts);
    expect(book.opening).toBe(50000);
    expect(book.rows).toHaveLength(1);
    // a period that starts before the books keeps it as a movement
    expect(trialBalance([opening], accounts, { from: '2025-12-01', to: '2026-12-31' }).rows.find((r) => r.code === '1010').turnover.debit).toBe(50000);
  });

  it('pearaamat: a liability shows its normal (credit) balance as a positive number', () => {
    const debt = e('2026-0001', '2026-01-01', [['1010', 16800, 0], ['2210', 0, 16800]], { origin: 'manual' });
    const pay = e('2026-0002', '2026-01-05', [['2210', 8000, 0], ['1010', 0, 8000]], { origin: 'manual' });
    const book = ledger([debt, pay], '2210', { from: '2026-01-01', to: '2026-12-31' }, accounts);
    expect(book.rows.map((r) => r.balance)).toEqual([16800, 8800]);
    expect(book.closing).toBe(8800);
    expect(book.side).toBe('credit');
  });

  it('pearaamat: one account with a running balance', () => {
    const { opening, rows, closing } = ledger(entries, '1200', { from: '2026-02-01', to: '2026-03-31' }, accounts);
    expect(opening).toBe(0);
    expect(rows.map((r) => r.balance)).toEqual([8000, 0, 6000]);
    expect(closing).toBe(6000);
  });

  it('kasumiaruanne and bilanss: the year result closes the gap between assets and liabilities + equity', () => {
    const result = incomeStatement(entries, accounts, { from: '2026-01-01', to: '2026-03-31' });
    expect(result).toMatchObject({ incomeCents: 14000, expenseCents: 3000, profitCents: 11000 });
    const sheet = balanceSheet(entries, accounts, { to: '2026-03-31' });
    expect(sheet.assetsCents).toBe(58000 + 6000);
    expect(sheet.liabilitiesCents).toBe(3000);
    expect(sheet.equity).toEqual([{ line: 'Eelmiste perioodide jaotamata kasum (kahjum)', amountCents: 50000 }, { line: 'Aruandeaasta kasum (kahjum)', amountCents: 11000 }]);
    expect(sheet.balanced).toBe(true);
  });

  it('reads euro amounts as cents', () => {
    expect(parseEuro('1 234,56')).toBe(123456);
    expect(parseEuro('80')).toBe(8000);
    expect(parseEuro('')).toBe(0);
    expect(Number.isNaN(parseEuro('12,345'))).toBe(true);
  });
});
