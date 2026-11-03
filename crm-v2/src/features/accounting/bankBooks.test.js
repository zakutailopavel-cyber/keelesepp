import { describe, expect, it } from 'vitest';
import { entryCode } from './accountingReports.js';
import { bankMovement, defaultBasis, linesByState, monthCheck, ruleBasis } from './bankBooks.js';

const entry = (id, date, sourceKey, bank, extra = {}) => ({
  id, date, sourceKey, origin: 'auto', number: id,
  lines: bank >= 0 ? [{ account: '1010', debitCents: bank, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: bank }] : [{ account: '4320', debitCents: -bank, creditCents: 0 }, { account: '1010', debitCents: 0, creditCents: -bank }],
  ...extra,
});

describe('bankBooks month check', () => {
  const lines = [
    { id: 'l1', date: '2026-10-07', direction: 'C', amountCents: 15000, state: 'matched', entryKeys: ['payment:p1'], counterpartyName: 'A' },
    { id: 'l2', date: '2026-10-11', direction: 'D', amountCents: 549, state: 'categorized', entryKeys: ['bank-line:l2'], counterpartyName: 'Apple' },
    { id: 'l3', date: '2026-10-12', direction: 'C', amountCents: 2500, state: 'unmatched', entryKeys: [], counterpartyName: 'B' },
    { id: 'l4', date: '2026-10-13', direction: 'C', amountCents: 9000, state: 'matched', entryKeys: ['payment:p4'], counterpartyName: 'C' },
    { id: 'l5', date: '2026-10-20', direction: 'C', amountCents: 7000, state: 'matched', entryKeys: ['payment:p5'], counterpartyName: 'D' },
    { id: 'l6', date: '2026-09-30', direction: 'C', amountCents: 100, state: 'matched', entryKeys: ['payment:p6'] },
  ];
  const entries = [
    entry('e0', '2026-01-01', '', 50000, { origin: 'opening' }),
    entry('e1', '2026-10-07', 'payment:p1', 15000),
    entry('e2', '2026-10-11', 'bank-line:l2', -549),
    entry('e4', '2026-10-14', 'payment:p4', 8000),
    entry('e5', '2026-11-02', 'payment:p5', 7000),
    entry('m1', '2026-10-08', '', 15000, { origin: 'manual' }),
    entry('m2', '2026-10-25', '', 1234, { origin: 'manual' }),
    entry('gone', '2026-10-09', '', 999, { origin: 'manual', deleted: true }),
  ];

  it('marks each line of the month: ok, open, amount, other month; lists 1010 entries without a line and duplicates', () => {
    const check = monthCheck({ lines, entries, month: '2026-10', closingCents: 50000 + 15000 - 549 + 8000 + 15000 + 1234 });
    expect(check.rows.map((r) => [r.line.id, r.status])).toEqual([['l1', 'ok'], ['l2', 'ok'], ['l3', 'open'], ['l4', 'amount'], ['l5', 'date']]);
    expect(check.noLine.map((n) => [n.entry.id, n.duplicateOf?.id || null])).toEqual([['m1', 'l1'], ['m2', null]]);
    expect(check.totals).toMatchObject({ statementIn: 15000 + 2500 + 9000 + 7000, statementOut: 549 });
    expect(check.closingBooks).toBe(50000 + 15000 - 549 + 8000 + 15000 + 1234);
    expect(check.difference).toBe(0);
    expect(check.ok).toBe(false);
  });

  it('is ok when every line is booked once and the bank balance matches 1010', () => {
    const check = monthCheck({ lines: lines.slice(0, 2), entries: entries.slice(0, 3), month: '2026-10', closingCents: 50000 + 15000 - 549 });
    expect(check.ok).toBe(true);
    expect(check.totals.turnoverDifference).toBe(0);
    expect(monthCheck({ lines: lines.slice(0, 2), entries: entries.slice(0, 3), month: '2026-10', closingCents: 1 }).ok).toBe(false);
    expect(monthCheck({ lines: [], entries: [], month: '2026-10' }).ok).toBe(false);
  });

  it('a linked payment voided later shows as voided', () => {
    const voided = [entry('e1', '2026-10-07', 'payment:p1', 15000), { ...entry('v1', '2026-10-09', 'payment-void:p1', 15000), lines: [{ account: '1200', debitCents: 15000, creditCents: 0 }, { account: '1010', debitCents: 0, creditCents: 15000 }] }];
    const check = monthCheck({ lines: [{ ...lines[0], entryKeys: ['payment:p1', 'payment-void:p1'] }], entries: voided, month: '2026-10' });
    expect(check.rows[0].status).toBe('voided');
    expect(check.noLine).toEqual([]);
  });
});

describe('bankBooks helpers', () => {
  it('a categorised bank line is LK (money in) or VM (money out) in the päevaraamat', () => {
    expect(entryCode({ origin: 'auto', documentType: 'bankLine', lines: [{ account: '1010', debitCents: 100 }, { account: '3530', creditCents: 100 }] })).toBe('LK');
    expect(entryCode({ origin: 'auto', documentType: 'bankLine', lines: [{ account: '4320', debitCents: 100 }, { account: '1010', creditCents: 100 }] })).toBe('VM');
  });

  it('groups lines by state and builds a rule from a line', () => {
    const groups = linesByState([{ id: 'a', state: 'review', date: '2026-10-02' }, { id: 'b', state: 'unmatched', date: '2026-10-01' }, { id: 'c', state: 'review', date: '2026-09-01' }]);
    expect(groups.review.map((l) => l.id)).toEqual(['c', 'a']);
    expect(groups.unmatched.map((l) => l.id)).toEqual(['b']);
    const line = { counterpartyAccount: 'EE00', counterpartyName: 'EESTI TÖÖTUKASSA', explanation: 'Juhendamistasu' };
    expect(defaultBasis(line)).toBe('account');
    expect(defaultBasis({ counterpartyName: 'APPLE' })).toBe('name');
    expect(ruleBasis(line, 'name')).toEqual({ counterpartyName: 'EESTI TÖÖTUKASSA' });
    expect(ruleBasis({}, 'account')).toBeNull();
    expect(bankMovement({ lines: [{ account: '1010', debitCents: 5, creditCents: 0 }, { account: '1010', debitCents: 0, creditCents: 2 }] })).toBe(3);
  });
});
