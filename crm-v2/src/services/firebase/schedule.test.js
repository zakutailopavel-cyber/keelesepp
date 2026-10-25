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
