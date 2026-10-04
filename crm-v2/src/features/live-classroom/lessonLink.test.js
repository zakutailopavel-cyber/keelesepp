import { beforeEach, describe, expect, it } from 'vitest';
import { calendarPathAfterLesson, isLessonKey, lessonLinkFor, rememberLessonLink } from './lessonLink.js';

describe('live lesson → calendar link', () => {
  beforeEach(() => globalThis.localStorage.clear());

  it('remembers the calendar lesson a room was started from', () => {
    rememberLessonLink('inv-1', 'schedule-1:2026-10-04|2026-10-04');
    expect(lessonLinkFor('inv-1')).toBe('schedule-1:2026-10-04|2026-10-04');
    expect(calendarPathAfterLesson({ id: 'inv-1', studentId: 's1' })).toBe(`/calendar?lesson=${encodeURIComponent('schedule-1:2026-10-04|2026-10-04')}`);
  });

  it('falls back to the student filter and rejects malformed keys', () => {
    rememberLessonLink('inv-2', 'nonsense');
    expect(lessonLinkFor('inv-2')).toBe('');
    expect(isLessonKey('a|2026-10-04')).toBe(true);
    expect(calendarPathAfterLesson({ id: 'inv-2', studentId: 's 1' })).toBe('/calendar?student=s%201');
    expect(calendarPathAfterLesson(null)).toBe('/calendar');
  });

  it('survives broken storage', () => {
    globalThis.localStorage.setItem('keelesepp.liveLessonLinks', '{broken');
    expect(lessonLinkFor('inv-1')).toBe('');
    rememberLessonLink('inv-3', 'x|2026-10-04');
    expect(lessonLinkFor('inv-3')).toBe('x|2026-10-04');
  });
});
