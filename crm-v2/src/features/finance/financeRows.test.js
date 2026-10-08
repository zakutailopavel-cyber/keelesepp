import { describe, expect, it } from 'vitest';
import { filterFinanceRows, financeRowState, sortFinanceRows, summarizeFinanceRows } from './financeRows.js';

const today = new Date('2026-10-07T12:00:00');
const row = (overrides = {}) => ({ id: 'i1', amountCents: 10000, paidAmountCents: 0, dueDate: '2026-10-10', studentName: 'Mari', ...overrides });

describe('financeRowState', () => {
  it('marks an open invoice unpaid before its due date', () => expect(financeRowState(row(), today)).toMatchObject({ status: 'unpaid', balanceCents: 10000, overdue: false }));
  it('marks a partially paid invoice partial before due date', () => expect(financeRowState(row({ paidAmountCents: 2500 }), today)).toMatchObject({ status: 'partial', balanceCents: 7500 }));
  it('marks a partial balance overdue once due date passes', () => expect(financeRowState(row({ paidAmountCents: 2500, dueDate: '2026-10-06' }), today)).toMatchObject({ status: 'overdue', balanceCents: 7500 }));
  it('treats the due date as current through that calendar day', () => expect(financeRowState(row({ dueDate: '2026-10-07' }), today).status).toBe('unpaid'));
  it('marks a fully paid invoice paid', () => expect(financeRowState(row({ paidAmountCents: 10000, dueDate: '2026-10-01' }), today)).toMatchObject({ status: 'paid', balanceCents: 0 }));
  it('marks a credited invoice as credit with no open balance', () => expect(financeRowState(row({ status: 'Krediteeritud' }), today)).toMatchObject({ status: 'credit', balanceCents: 0 }));
  it('marks a zero-amount credit note as credit', () => expect(financeRowState(row({ amountCents: 0, creditNoteId: 'c1' }), today).status).toBe('credit'));
  it('keeps a cancelled invoice out of active financial totals', () => expect(financeRowState(row({ status: 'Tühistatud', effectiveAmountCents: 0, balanceDueCents: 0 }), today)).toMatchObject({ status: 'cancelled', amountCents: 0, paidCents: 0, balanceCents: 0 }));
  it('uses effective amount and stored balance after a partial credit', () => expect(financeRowState(row({ amountCents: 10000, effectiveAmountCents: 7500, paidAmountCents: 2000, balanceDueCents: 5500 }), today)).toMatchObject({ status: 'partial', amountCents: 7500, paidCents: 2000, balanceCents: 5500 }));
  it('marks failed email delivery on otherwise open invoices', () => expect(financeRowState(row({ emailStatus: 'failed' }), today)).toMatchObject({ status: 'email-failed', emailFailed: true }));
  it('marks unbilled no-show rows for attention', () => expect(financeRowState(row({ noShow: true }), today)).toMatchObject({ status: 'no-show', noShow: true }));
  it('does not hide overdue state behind email failure or no-show', () => expect(financeRowState(row({ emailStatus: 'failed', noShow: true, dueDate: '2026-10-06' }), today).status).toBe('overdue'));
  it('normalizes legacy euro amounts and clamps balance at zero', () => expect(financeRowState(row({ amountCents: undefined, amount: 12.34, payments: [{ amount: 20 }] }), today)).toMatchObject({ status: 'paid', amountCents: 1234, paidCents: 2000, balanceCents: 0 }));
  it('handles invalid and missing due dates without throwing', () => expect(financeRowState(row({ dueDate: 'bad' }), today)).toMatchObject({ status: 'unpaid', overdue: false }));
});

describe('finance row summaries, filters, and sorting', () => {
  it('summarizes every status and financial total', () => {
    const rows = [row(), row({ id: 'i2', paidAmountCents: 2000 }), row({ id: 'i3', dueDate: '2026-10-01' }), row({ id: 'i4', paidAmountCents: 10000 }), row({ id: 'i5', status: 'credited' }), row({ id: 'i6', emailStatus: 'failed' }), row({ id: 'i7', noShow: true })];
    expect(summarizeFinanceRows(rows, today)).toEqual({ count: 7, amountCents: 70000, billableCents: 60000, paidCents: 12000, balanceCents: 48000, byStatus: { unpaid: 1, partial: 1, overdue: 1, paid: 1, credit: 1, cancelled: 0, 'email-failed': 1, 'no-show': 1 } });
  });
  it('filters by status, month, student and case-insensitive text', () => {
    const rows = [row({ id: 'a', studentId: 's1', planMonth: '2026-10', payerEmail: 'mari@example.ee' }), row({ id: 'b', studentId: 's2', planMonth: '2026-09', dueDate: '2026-10-01', studentName: 'Kati' })];
    expect(filterFinanceRows(rows, { status: 'unpaid', month: '2026-10', studentId: 's1', query: 'MARI@' }, today).map((item) => item.id)).toEqual(['a']);
    expect(filterFinanceRows(rows, { status: 'overdue' }, today).map((item) => item.id)).toEqual(['b']);
  });
  it('sorts by due date, amount, status, and student, without mutating input', () => {
    const rows = [row({ id: 'b', studentName: 'Õie', dueDate: '2026-10-09', amountCents: 300 }), row({ id: 'a', studentName: 'Aino', dueDate: '2026-10-08', amountCents: 1000 }), row({ id: 'c', studentName: 'Mari', dueDate: '2026-10-11', amountCents: 500 })];
    expect(sortFinanceRows(rows).map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(sortFinanceRows(rows, 'amount', 'desc').map((item) => item.id)).toEqual(['a', 'c', 'b']);
    expect(sortFinanceRows(rows, 'student').map((item) => item.id)).toEqual(['a', 'c', 'b']);
    expect(sortFinanceRows(rows, 'dueDate', 'desc').map((item) => item.id)).toEqual(['c', 'b', 'a']);
    expect(rows.map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });
});
