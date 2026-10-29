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

describe('planSubstitute', () => {
  it('a one-off lesson changes its teacher and keeps the main teacher; giving it back clears that', async () => {
    const { planSubstitute } = await import('./calendarGrid.js');
    const item = { id: 'a', teacher: 'Pavel', teacherUid: 'p', recurring: false, date: '2026-10-30', time: '12:00', duration: 60 };
    const plan = planSubstitute(item, { teacher: 'Liza', teacherUid: 'l' });
    expect(plan.apply).toEqual([{ op: 'patch', id: 'a', fields: { teacher: 'Liza', teacherUid: 'l', substituteFor: { teacher: 'Pavel', teacherUid: 'p' } } }]);
    const back = planSubstitute({ ...item, teacher: 'Liza', teacherUid: 'l', substituteFor: { teacher: 'Pavel', teacherUid: 'p' } }, { teacher: 'Pavel', teacherUid: 'p' });
    expect(back.apply[0].fields).toEqual({ teacher: 'Pavel', teacherUid: 'p', substituteFor: null });
  });
  it('a lesson of a series becomes a one-off copy with the substitute on the same time', async () => {
    const { planSubstitute } = await import('./calendarGrid.js');
    const item = { id: 's', studentId: 'x', studentName: 'Mia', teacher: 'Pavel', teacherUid: 'p', recurring: true, startDate: '2026-09-01', day: 'Fri', occurrenceDate: '2026-10-30', time: '12:00', duration: 45, online: true, excludedDates: ['2026-10-02'] };
    const plan = planSubstitute(item, { teacher: 'Jegor', teacherUid: 'j' });
    expect(plan.apply[0]).toEqual({ op: 'patch', id: 's', fields: { excludedDates: ['2026-10-02', '2026-10-30'] } });
    expect(plan.apply[1].data).toMatchObject({ studentId: 'x', teacher: 'Jegor', teacherUid: 'j', substituteFor: { teacher: 'Pavel', teacherUid: 'p' }, date: '2026-10-30', time: '12:00', duration: 45, online: true, recurring: false, movedFromSeriesId: 's' });
  });
});

describe('chosen teacher colours (owner 2026-10-29)', () => {
  it('a chosen colour wins over the hash, by uid and by name; no choice keeps the hash', async () => {
    const { teacherTone, tonesOf } = await import('./calendarGrid.js');
    const tones = tonesOf([{ id: 'u1', name: 'Jegor', calendarTone: 4 }, { id: 'u2', name: 'Anna', calendarTone: '' }, { id: 'u3', name: 'X', calendarTone: 12 }]);
    expect(teacherTone('u1', tones)).toBe(4);
    expect(teacherTone('Jegor', tones)).toBe(4);
    expect(teacherTone('u2', tones)).toBe(teacherTone('u2'));
    expect(tones.has('u3')).toBe(false);
  });
});

describe('personal and distinct teacher colours (owner 2026-10-29)', () => {
  const people = Array.from({ length: 12 }, (_, index) => ({ id: `u${String(index).padStart(2, '0')}`, name: `Õpetaja ${index}` }));
  it('gives every teacher a different colour while the palette lasts, in a stable order', async () => {
    const { calendarTones, TONE_NAMES } = await import('./calendarGrid.js');
    expect(TONE_NAMES).toHaveLength(12);
    const tones = calendarTones({ people });
    expect(new Set(people.map((person) => tones.get(person.id))).size).toBe(12);
    expect(tones.get('Õpetaja 3')).toBe(tones.get('u03'));
    const shuffled = calendarTones({ people: [...people].reverse() });
    people.forEach((person) => expect(shuffled.get(person.id)).toBe(tones.get(person.id)));
    const thirteen = calendarTones({ people: [...people, { id: 'u99', name: 'Lisa' }] });
    expect(thirteen.get('u99')).toBeGreaterThanOrEqual(0);
    expect(thirteen.get('u99')).toBeLessThan(12);
  });
  it('the administrator\'s colour is the default, a personal one overrides it, and automatic colours avoid both', async () => {
    const { calendarTones } = await import('./calendarGrid.js');
    const two = [{ id: 'a', name: 'Anhelina' }, { id: 'j', name: 'Jegor' }, { id: 'k', name: 'Kati' }];
    const staff = [{ id: 'j', name: 'Jegor', calendarTone: 0 }];
    const school = calendarTones({ people: two, staff });
    expect(school.get('j')).toBe(0);
    expect(school.get('a')).not.toBe(0);
    expect(new Set(two.map((person) => school.get(person.id))).size).toBe(3);
    const mine = calendarTones({ people: two, staff, personal: { j: 4, a: 1 } });
    expect(mine.get('j')).toBe(4);
    expect(mine.get('a')).toBe(1);
    expect([1, 4]).not.toContain(mine.get('k'));
  });
  it('cleans a personal map: only known colours, at most 80 teachers', async () => {
    const { cleanPersonalColors } = await import('./calendarGrid.js');
    expect(cleanPersonalColors({ a: 3, b: '5', c: 12, d: -1, e: 'x', f: null })).toEqual({ a: 3, b: 5 });
    expect(cleanPersonalColors(null)).toEqual({});
    expect(cleanPersonalColors(['a'])).toEqual({});
    expect(Object.keys(cleanPersonalColors(Object.fromEntries(Array.from({ length: 90 }, (_, i) => [`t${i}`, 1]))))).toHaveLength(80);
  });
});
