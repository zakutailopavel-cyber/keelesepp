import { canMove, gridRange, layoutColumn, planDelete, planMove, snapMinutes, toClock, toMinutes } from './calendarGrid.js';
import { eventOccursOn } from './calendarView.js';

describe('calendar time grid', () => {
  it('converts and snaps times', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toClock(570)).toBe('09:30');
    expect(snapMinutes(577)).toBe(570);
    expect(snapMinutes(583)).toBe(585);
  });

  it('places lessons by time and puts overlaps side by side', () => {
    const laid = layoutColumn([
      { id: 'a', time: '09:00', duration: 60 },
      { id: 'b', time: '09:30', duration: 60 },
      { id: 'c', time: '11:00', duration: 45 },
    ]);
    const byId = Object.fromEntries(laid.map((entry) => [entry.item.id, entry]));
    expect(byId.a).toMatchObject({ top: 60, height: 60, lane: 0, lanes: 2 });
    expect(byId.b).toMatchObject({ top: 90, lane: 1, lanes: 2 });
    expect(byId.c).toMatchObject({ top: 180, height: 45, lane: 0, lanes: 1 });
  });

  it('never moves done, absent or cancelled lessons', () => {
    expect(canMove({ status: 'Planeeritud' })).toBe(true);
    expect(canMove({ status: 'Planeeritud', lessonRecordId: 'x' })).toBe(false);
    expect(canMove({ status: 'Toimunud' })).toBe(false);
    expect(canMove({ status: 'Tühistatud' })).toBe(false);
  });
});

describe('moving lessons', () => {
  const weekly = { id: 's1', recurring: true, startDate: '2026-09-07', date: '2026-09-07', day: 'Mon', time: '16:00', duration: 60, studentId: 'st1', studentName: 'Mari', teacher: 'Pavel', teacherUid: 't1', status: 'Planeeritud', excludedDates: ['2026-09-14'] };

  it('moves a one-off lesson in place and can undo it', () => {
    const plan = planMove({ id: 'o1', recurring: false, date: '2026-09-29', day: 'Tue', time: '10:00', duration: 60 }, { toDate: '2026-09-30', toTime: '11:15' });
    expect(plan.apply).toEqual([{ op: 'patch', id: 'o1', fields: { date: '2026-09-30', day: 'Wed', time: '11:15', duration: 60 } }]);
    expect(plan.undo[0].fields).toEqual({ date: '2026-09-29', day: 'Tue', time: '10:00', duration: 60 });
  });

  it('"only this lesson" skips the date in the series and creates a single lesson', () => {
    const plan = planMove({ ...weekly, occurrenceDate: '2026-09-28' }, { toDate: '2026-09-29', toTime: '17:00', scope: 'single' });
    expect(plan.apply[0]).toEqual({ op: 'patch', id: 's1', fields: { excludedDates: ['2026-09-14', '2026-09-28'] } });
    expect(plan.apply[1].data).toMatchObject({ studentId: 'st1', date: '2026-09-29', day: 'Tue', time: '17:00', recurring: false, movedFromSeriesId: 's1' });
    const series = { ...weekly, ...plan.apply[0].fields };
    expect(eventOccursOn(series, '2026-09-28')).toBe(false);
    expect(eventOccursOn(series, '2026-10-05')).toBe(true);
    expect(plan.undo).toEqual([{ op: 'remove', key: 'single' }, { op: 'patch', id: 's1', fields: { excludedDates: ['2026-09-14'] } }]);
  });

  it('"this and following" ends the old series and starts a new one', () => {
    const plan = planMove({ ...weekly, occurrenceDate: '2026-09-28' }, { toDate: '2026-09-30', toTime: '15:00', scope: 'series' });
    expect(plan.apply[0]).toEqual({ op: 'patch', id: 's1', fields: { endDate: '2026-09-27' } });
    expect(plan.apply[1].data).toMatchObject({ startDate: '2026-09-30', day: 'Wed', time: '15:00', recurring: true, continuesSeriesId: 's1' });
    const old = { ...weekly, ...plan.apply[0].fields };
    expect(eventOccursOn(old, '2026-09-21')).toBe(true);
    expect(eventOccursOn(old, '2026-09-28')).toBe(false);
  });

  it('"this and following" from the first lesson shifts the whole series', () => {
    const plan = planMove({ ...weekly, occurrenceDate: '2026-09-07' }, { toDate: '2026-09-08', toTime: '15:00', scope: 'series' });
    expect(plan.apply).toEqual([{ op: 'patch', id: 's1', fields: { date: '2026-09-08', day: 'Tue', time: '15:00', duration: 60, startDate: '2026-09-08' } }]);
  });

  it('plans deleting a lesson without touching accounting history', () => {
    const oneOff = { id: 'a', date: '2026-10-05', occurrenceDate: '2026-10-05', studentId: 's1', gcalEventId: 'g', gcalSyncStatus: 'synced' };
    const plan = planDelete(oneOff);
    expect(plan.apply).toEqual([{ op: 'delete', id: 'a' }]);
    expect(plan.undo[0].data).toEqual({ date: '2026-10-05', studentId: 's1' });
    expect(() => planDelete(oneOff, { hasRecords: true })).toThrow('Toimunud');

    const series = { id: 'w', recurring: true, startDate: '2026-10-05', occurrenceDate: '2026-10-19', excludedDates: ['2026-10-12'] };
    expect(planDelete(series, { scope: 'single' }).apply).toEqual([{ op: 'patch', id: 'w', fields: { excludedDates: ['2026-10-12', '2026-10-19'] } }]);
    expect(planDelete(series, { scope: 'series' }).apply).toEqual([{ op: 'patch', id: 'w', fields: { endDate: '2026-10-18' } }]);
    expect(planDelete({ ...series, occurrenceDate: '2026-10-05' }, { scope: 'series' }).apply).toEqual([{ op: 'delete', id: 'w' }]);
    expect(planDelete({ ...series, occurrenceDate: '2026-10-05' }, { scope: 'series', hasRecords: true }).apply).toEqual([{ op: 'patch', id: 'w', fields: { endDate: '2026-10-04' } }]);
  });

  it('widens the visible hours so early and late lessons are never hidden', () => {
    expect(gridRange([{ time: '10:00', duration: 60 }])).toEqual({ start: 480, end: 1260 });
    expect(gridRange([{ time: '07:30', duration: 60 }, { time: '21:00', duration: 90 }])).toEqual({ start: 420, end: 1380 });
    const late = layoutColumn([{ time: '21:00', duration: 60 }], gridRange([{ time: '21:00', duration: 60 }]));
    expect(late[0].outside).toBe(false);
  });
});
