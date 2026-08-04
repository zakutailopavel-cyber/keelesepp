import { workTimeSummary } from './workTime.js';

describe('workTimeSummary', () => {
  it('separates approved, pending and program time', () => {
    expect(workTimeSummary([
      { status: 'closed', approvalStatus: 'approved', durationMinutes: 120, payAmountCents: 3000 },
      { status: 'closed', approvalStatus: 'pending', durationMinutes: 45 },
      { status: 'open', durationMinutes: 0 },
    ], [{ activeSeconds: 1800 }])).toMatchObject({ approvedMinutes: 120, pendingMinutes: 45, programMinutes: 30, approvedPayCents: 3000 });
  });
});
