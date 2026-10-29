import { futureWeeks, mondayOf, timesForWeek, timesOnDate, upcomingWeeks } from './pollModel.js';
import { hasTimes, studentStateAt } from '../calendar/studentTimesModel.js';

// week by week (owner 2026-10-29): a dated week may have its own times, otherwise the usual week holds
const item = { slots: ['Mon-17:00', 'Mon-17:30'], preferred: [], weeks: { '2026-11-09': { slots: ['Sat-10:00', 'Sat-10:30'], preferred: ['Sat-10:00', 'Sat-10:30'] } } };

describe('weeks of the suitable times', () => {
  it('finds the Monday and the next weeks', () => {
    expect(mondayOf('2026-10-29')).toBe('2026-10-26');
    expect(mondayOf('2026-11-01')).toBe('2026-10-26');
    expect(mondayOf('2026-11-02')).toBe('2026-11-02');
    expect(upcomingWeeks('2026-10-29')).toEqual([
      { monday: '2026-10-26', sunday: '2026-11-01' }, { monday: '2026-11-02', sunday: '2026-11-08' },
      { monday: '2026-11-09', sunday: '2026-11-15' }, { monday: '2026-11-16', sunday: '2026-11-22' },
    ]);
  });
  it('a week of its own wins, other weeks are the usual week', () => {
    expect(timesForWeek(item, '2026-11-09')).toMatchObject({ slots: ['Sat-10:00', 'Sat-10:30'], own: true });
    expect(timesForWeek(item, '2026-11-02')).toMatchObject({ slots: ['Mon-17:00', 'Mon-17:30'], own: false });
    expect(timesOnDate(item, '2026-11-14').own).toBe(true);
    expect(futureWeeks({ '2026-10-19': {}, '2026-11-09': {} }, '2026-10-29')).toEqual({ '2026-11-09': {} });
  });
  it('the calendar reads the week of the date', () => {
    expect(studentStateAt(item, { date: '2026-11-14', time: '10:00', duration: 60 })).toBe('best');
    expect(studentStateAt(item, { date: '2026-11-09', time: '17:00', duration: 60 })).toBe('none');
    expect(studentStateAt(item, { date: '2026-11-02', time: '17:00', duration: 60 })).toBe('ok');
    expect(hasTimes({ slots: [], weeks: { '2026-11-09': { slots: ['Sat-10:00'] } } })).toBe(true);
  });
});
