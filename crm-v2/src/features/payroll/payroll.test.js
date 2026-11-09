import { cancelledPayout, markedPayout, payoutCsv, payoutId, payoutTotals, payoutView, payrollRows, payrollTotals, validatePayout } from './payroll.js';

describe('payouts (owner 2026-11-09: one figure per teacher-month with a paid mark)', () => {
  const rows = payrollRows(
    [{ id: 't1', name: 'Anna', workHourlyRateCents: 2000 }, { id: 't2', name: 'Boris', workHourlyRateCents: 2000 }],
    [
      { id: 's1', staffUid: 't1', status: 'closed', approvalStatus: 'approved', durationMinutes: 600, payAmountCents: 20000 },
      { id: 's2', staffUid: 't2', status: 'closed', approvalStatus: 'approved', durationMinutes: 120, payAmountCents: 4000 },
    ],
    [],
  );
  const loadRows = [
    { id: 't1', held: 9, hours: 9, pay: { rateCents: 2000, payCents: 18000 } },
    { id: 't2', held: 2, hours: 2, pay: { rateCents: 2000, payCents: 4200 } },
  ];
  const payouts = [{ id: payoutId('2026-10', 't2'), teacherUid: 't2', month: '2026-10', status: 'paid', amountCents: 4000, paidAt: '2026-11-05', method: 'pank' }, { teacherUid: 't1', status: 'cancelled', amountCents: 1 }];

  it('pays the approved work time and shows the lessons as a check with a warning from 5 €', () => {
    const view = payoutView(rows, loadRows, payouts);
    expect(view.get('t1')).toMatchObject({ payableCents: 20000, workedMinutes: 600, lessons: { held: 9, hours: 9, payCents: 18000 }, diffCents: 2000, warn: true, payout: null });
    expect(view.get('t2')).toMatchObject({ payableCents: 4000, diffCents: -200, warn: false, payout: { amountCents: 4000 }, paidDiffers: false });
    expect(payoutTotals(rows, view, payouts)).toEqual({ paidCents: 4000, paidCount: 1, unpaidCents: 20000, unpaidCount: 1 });
  });

  it('without lesson data or a rate there is no check, never a guess', () => {
    const view = payoutView(rows, null, []);
    expect(view.get('t1')).toMatchObject({ lessons: null, diffCents: null, warn: false });
    const unrated = payoutView(rows, [{ id: 't1', held: 3, hours: 3, pay: { rateCents: null, payCents: null } }], []);
    expect(unrated.get('t1')).toMatchObject({ lessons: { held: 3, payCents: null }, diffCents: null, warn: false });
    expect(unrated.get('t2').lessons).toMatchObject({ held: 0, payCents: null });
  });

  it('validates the mark form', () => {
    expect(validatePayout({ amount: '820,50', paidAt: '2026-11-05', method: 'pank', note: ' ok ' })).toEqual({ valid: true, errors: {}, value: { amountCents: 82050, paidAt: '2026-11-05', method: 'pank', note: 'ok' } });
    expect(validatePayout({ amount: '0', paidAt: '2026-11-05' }).errors.amount).toBeTruthy();
    expect(validatePayout({ amount: '10,555', paidAt: '2026-11-05' }).errors.amount).toBeTruthy();
    expect(validatePayout({ amount: '10', paidAt: '' }).errors.paidAt).toBeTruthy();
    expect(validatePayout({ amount: '10', paidAt: '2026-11-05', method: 'krüpto' }).errors.method).toBeTruthy();
  });

  it('builds the stored mark and undo with an append-only history', () => {
    const user = { uid: 'admin-1', displayName: 'Pavel' };
    const value = { amountCents: 82000, paidAt: '2026-11-05', method: 'pank', note: '' };
    const first = markedPayout(null, { teacher: { id: 't1', name: 'Anna' }, month: '2026-10', value }, user, 'T1');
    expect(first).toMatchObject({ teacherUid: 't1', month: '2026-10', status: 'paid', amountCents: 82000, markedBy: { uid: 'admin-1', name: 'Pavel' }, markedAtIso: 'T1' });
    expect(first.history).toEqual([{ action: 'paid', amountCents: 82000, paidAt: '2026-11-05', method: 'pank', note: '', byUid: 'admin-1', byName: 'Pavel', atIso: 'T1' }]);
    expect(() => markedPayout(first, { teacher: { id: 't1' }, month: '2026-10', value }, user, 'T2')).toThrow('juba makstuks');
    const undone = cancelledPayout(first, ' Vale summa ', user, 'T2');
    expect(undone).toMatchObject({ status: 'cancelled', amountCents: 82000, markedAtIso: 'T1', cancelledBy: { uid: 'admin-1' }, cancelReason: 'Vale summa' });
    expect(undone.history.map((item) => item.action)).toEqual(['paid', 'cancelled']);
    expect(() => cancelledPayout(undone, 'x', user, 'T3')).toThrow();
    const again = markedPayout(undone, { teacher: { id: 't1', name: 'Anna' }, month: '2026-10', value: { ...value, amountCents: 80000 } }, user, 'T3');
    expect(again.history).toHaveLength(3);
    expect(again).not.toHaveProperty('cancelledBy');
  });

  it('exports the month as CSV', () => {
    const csv = payoutCsv('2026-10', rows, payoutView(rows, loadRows, payouts));
    const lines = csv.replace('﻿', '').split('\n');
    expect(lines[0]).toContain('Väljamaksmisele (€)');
    expect(lines[1]).toBe('2026-10;Anna;10,00;9;9;200,00;180,00;;;');
    expect(lines[2]).toBe('2026-10;Boris;2,00;2;2;40,00;42,00;40,00;05.11.2026;Pangaülekanne');
  });
});

describe('payroll projections', () => {
  it('groups evidence by staff UID and keeps pending separate from approved pay', () => {
    const rows = payrollRows(
      [{ id: 'teacher-1', name: 'Õpetaja', workHourlyRateCents: 1500 }],
      [
        { id: 'approved', staffUid: 'teacher-1', status: 'closed', approvalStatus: 'approved', durationMinutes: 120, payAmountCents: 3000 },
        { id: 'pending', staffUid: 'teacher-1', status: 'closed', approvalStatus: 'pending', durationMinutes: 45 },
      ],
      [{ staffUid: 'teacher-1', activeSeconds: 1800 }],
    );
    expect(rows[0]).toMatchObject({ pendingCount: 1, approvedCount: 1, summary: { approvedMinutes: 120, pendingMinutes: 45, approvedPayCents: 3000, programMinutes: 30 } });
    expect(payrollTotals(rows)).toMatchObject({ approvedMinutes: 120, pendingMinutes: 45, approvedPayCents: 3000, pendingCount: 1 });
  });

  it('keeps orphaned historical sessions visible for audit', () => {
    expect(payrollRows([], [{ id: 'old', staffUid: 'deleted-user', staffName: 'Endine õpetaja', status: 'closed', approvalStatus: 'approved', durationMinutes: 60, payAmountCents: 1000 }], [])[0].teacher.name).toBe('Endine õpetaja');
  });

  it('keeps program-only staff evidence visible without treating it as payroll', () => {
    const rows = payrollRows([], [], [{ staffUid: 'staff-1', staffName: 'Kontoritöötaja', activeSeconds: 2700 }]);
    expect(rows[0]).toMatchObject({
      teacher: { id: 'staff-1', name: 'Kontoritöötaja' },
      summary: { programMinutes: 45, approvedPayCents: 0 },
    });
  });
});
