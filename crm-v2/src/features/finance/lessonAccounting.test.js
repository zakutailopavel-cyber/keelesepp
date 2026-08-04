import { billingAttentionLessons, defaultInvoiceDue, lessonAccountingRows, lessonIsBillable, selectBillableLessons } from './lessonAccounting.js';

describe('lesson accounting', () => {
  it('selects only completed, unlinked lessons and respects the legacy counter', () => {
    const lessons = [
      { id: 'old', studentId: 's1', date: '2026-06-01', status: 'Toimunud' },
      { id: 'new', studentId: 's1', date: '2026-07-01', status: 'Toimunud' },
      { id: 'explicit', studentId: 's1', date: '2026-06-15', status: 'Toimunud', billingStatus: 'unbilled' },
      { id: 'billed', studentId: 's1', date: '2026-07-02', status: 'Toimunud', invoiceId: 'inv-1' },
    ];
    expect(selectBillableLessons(lessons, { id: 's1', lessonsSinceInvoice: 2 }).map((lesson) => lesson.id)).toEqual(['explicit', 'new']);
    expect(lessonIsBillable(lessons[3])).toBe(false);
  });

  it('keeps CRM v2 lesson records billable independently of the legacy counter', () => {
    const lessons = [
      { id: 'legacy', studentId: 's1', date: '2026-08-01', status: 'Toimunud' },
      { id: 'crm-v2', studentId: 's1', date: '2026-08-02', status: 'Toimunud', accountingSource: 'crm_v2' },
    ];
    expect(selectBillableLessons(lessons, { id: 's1', lessonsSinceInvoice: 0 }).map((lesson) => lesson.id)).toEqual(['crm-v2']);
  });

  it('uses the student price plan to calculate invoice-ready totals', () => {
    const rows = lessonAccountingRows(
      [{ id: 'l1', studentId: 's1', date: '2026-08-01', status: 'Toimunud' }, { id: 'l2', studentId: 's1', date: '2026-08-02', status: 'Toimunud' }],
      [{ id: 's1', name: 'Mari', lessonPrice: 20 }],
      [{ studentId: 's1', lessonPriceCents: 2750 }],
    );
    expect(rows[0]).toMatchObject({ lessonPriceCents: 2750, amountCents: 5500 });
  });

  it('flags unclassified absences and uses next month tenth as invoice due date', () => {
    expect(billingAttentionLessons([{ id: 'a', status: 'Puudus_eta' }, { id: 'b', status: 'Puudus_p', billingStatus: 'cancelled_on_time' }]).map((lesson) => lesson.id)).toEqual(['a']);
    expect(defaultInvoiceDue(new Date('2026-08-04T12:00:00'))).toBe('2026-09-10');
  });
});
