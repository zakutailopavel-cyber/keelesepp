import { describe, expect, it } from 'vitest';
import { canQuickCompleteLesson, quickAttendanceLabel } from './quickAttendance.js';

describe('calendar quick attendance rules', () => {
  it('allows an individual scheduled occurrence to be completed', () => {
    expect(canQuickCompleteLesson({ id: 'schedule-1', occurrenceDate: '2026-08-06', status: 'Planeeritud' })).toBe(true);
  });

  it('blocks groups, completed and cancelled lessons', () => {
    expect(canQuickCompleteLesson({ id: 'group-1', occurrenceDate: '2026-08-06', isGroup: true })).toBe(false);
    expect(canQuickCompleteLesson({ id: 'schedule-1', occurrenceDate: '2026-08-06', lessonRecordId: 'lesson-1' })).toBe(false);
    expect(canQuickCompleteLesson({ id: 'schedule-1', occurrenceDate: '2026-08-06', status: 'Tühistatud' })).toBe(false);
  });

  it('returns plain-language action labels', () => {
    expect(quickAttendanceLabel({ status: 'Planeeritud' })).toBe('Märgi toimunuks');
    expect(quickAttendanceLabel({ lessonRecordId: 'lesson-1' })).toBe('Tund arvestatud');
    expect(quickAttendanceLabel({ status: 'Tühistatud' })).toBe('Tund tühistatud');
    expect(quickAttendanceLabel({ isGroup: true })).toBe('Ava kohalolu');
  });
});
