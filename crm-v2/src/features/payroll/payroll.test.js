import { payrollRows, payrollTotals } from './payroll.js';

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
