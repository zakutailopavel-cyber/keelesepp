import { describe, expect, it } from 'vitest';
import { hasScheduleConflict, normalizeScheduleEvent, payload } from './schedule.js';

describe('hasScheduleConflict', () => {
  const events = [{ id: 'one', date: '2026-08-03', time: '10:00', duration: 60, teacherUid: 'teacher-1' }];
  it('detects overlapping lessons for the same teacher', () => {
    expect(hasScheduleConflict(events, { date: '2026-08-03', time: '10:30', duration: 30, teacherUid: 'teacher-1' })).toBe(true);
  });
  it('allows adjacent lessons and other teachers', () => {
    expect(hasScheduleConflict(events, { date: '2026-08-03', time: '11:00', duration: 30, teacherUid: 'teacher-1' })).toBe(false);
    expect(hasScheduleConflict(events, { date: '2026-08-03', time: '10:30', duration: 30, teacherUid: 'teacher-2' })).toBe(false);
  });
  it('uses the canonical teacher name in calendar entries', () => {
    expect(normalizeScheduleEvent('lesson-1', { teacher: 'Elizaveta' }).teacher).toBe('Yelyzaveta Lukiianchuk');
  });
});

describe('schedule payload source', () => {
  it('a new entry may name its source (the planner); an existing one keeps its own; default is the CRM', () => {
    expect(payload({ date: '2026-11-02', source: 'planner', plannerBatchId: 'b1' })).toMatchObject({ source: 'planner', plannerBatchId: 'b1' });
    expect(payload({ date: '2026-11-02', source: 'planner' }, { source: 'gcal' }).source).toBe('gcal');
    expect(payload({ date: '2026-11-02' }).source).toBe('keelesepp-crm-v2');
  });
});

describe('schedule payload weekday', () => {
  const series = { id: 's1', recurring: true, date: '2026-11-02', startDate: '2026-11-02', day: 'Mon', time: '10:00' };
  it('a new date of a weekly series moves its weekday (Fable T1)', () => {
    const value = payload({ date: '2026-11-05', time: '10:00' }, series);
    expect(value).toMatchObject({ startDate: '2026-11-05', date: '2026-11-05', day: 'Thu' });
  });
  it('keeps the stored weekday when no date is passed, and an explicit day wins', () => {
    expect(payload({ time: '11:00' }, series).day).toBe('Mon');
    expect(payload({ date: '2026-11-05', day: 'Fri' }, series).day).toBe('Fri');
    expect(payload({ date: '2026-11-08' }).day).toBe('Sun');
  });
});
