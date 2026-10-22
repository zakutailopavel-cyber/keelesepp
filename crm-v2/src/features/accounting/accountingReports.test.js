import { describe, expect, it } from 'vitest';
import { balanceSheet, incomeStatement, journalRows, ledger, parseEuro, trialBalance } from './accountingReports.js';

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
  it('päevaraamat lists entries in date order with the account names', () => {
    const rows = journalRows(entries, accounts, { from: '2026-02-01', to: '2026-02-28' });
    expect(rows.map((r) => r.number)).toEqual(['2026-0003', '2026-0002', '2026-0004']);
    expect(rows[0].lines[1]).toMatchObject({ account: '3060', name: 'Maksuvaba müügitulu', creditCents: 8000 });
    expect(rows[0].totalCents).toBe(8000);
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
