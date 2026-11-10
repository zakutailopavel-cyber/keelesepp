import { describe, expect, it } from 'vitest';
import { isCashPaid, isChargeable, monthlyBillingRows, studentLessonBalances } from './monthlyBilling.js';

// „Makstud sularahas” (owner 2026-11-10): a lesson the teacher took cash for leaves the monthly invoice, the same way
// as unworked lessons; undoing the cash mark (the flag goes away) makes it billable again. Test data only.
const cash = { receiptId: 'lessoncash_x', amountCents: 2000 };
const student = { id: 'b', name: 'Mari', active: true, parentEmail: 'mari@example.com' };
const held = (date, extra = {}) => ({ id: `L-${date}`, studentId: 'b', date, status: 'Toimunud', duration: 60, ...extra });

describe('cash-paid lessons and the monthly invoice', () => {
  it('a cash-paid lesson is never chargeable — held or a no-show', () => {
    expect(isCashPaid({ cashPaid: cash })).toBe(true);
    expect(isCashPaid({ cashPaid: {} })).toBe(false);
    expect(isChargeable({ status: 'Toimunud', cashPaid: cash }, {})).toBe(false);
    expect(isChargeable({ status: 'Puudus_eta', cashPaid: cash }, { chargeNoShow: true })).toBe(false);
    expect(isChargeable({ status: 'Toimunud' }, {})).toBe(true);
  });

  it('billed ahead: the cash-paid lesson comes off the next invoice (correction), with its reason', () => {
    const plan = { studentId: 'b', lessonPriceCents: 2000, lessonMinutes: 60, billingMode: 'current', chargeNoShow: true };
    const october = { studentId: 'b', planMonth: '2031-10', plannedUnits: 4, status: 'Makstud' };
    const lessons = ['2031-10-01', '2031-10-08', '2031-10-15'].map((date) => held(date)).concat(held('2031-10-22', { cashPaid: cash }));
    const row = (values) => monthlyBillingRows({ month: '2031-11', students: [student], plans: [plan], schedule: [], groups: [], lessons, invoices: [october], ...values })[0];
    expect(row().correction.units).toBe(-1);
    expect(row().correction.note).toBe('1 makstud sularahas');
    expect(studentLessonBalances({ student, plan, invoices: [october], lessons, month: '2031-10' })).toEqual([expect.objectContaining({ paid: 4, used: 3, left: 1 })]);
    // the cash mark taken back: billable again, nothing comes off
    const undone = lessons.map(({ cashPaid, ...lesson }) => lesson); // eslint-disable-line no-unused-vars
    expect(row({ lessons: undone }).correction.units).toBe(0);
  });

  it('billed after the lessons: the cash-paid lesson is not on the invoice', () => {
    const plan = { studentId: 'b', lessonPriceCents: 2000, lessonMinutes: 60, billingMode: 'actual', chargeNoShow: true };
    const lessons = [held('2031-10-02'), held('2031-10-09', { cashPaid: cash }), held('2031-10-16')];
    const [row] = monthlyBillingRows({ month: '2031-10', students: [student], plans: [plan], schedule: [], groups: [], lessons, invoices: [] });
    expect(row.lessonCount).toBe(2);
    expect(row.totalCents).toBe(4000);
  });
});
