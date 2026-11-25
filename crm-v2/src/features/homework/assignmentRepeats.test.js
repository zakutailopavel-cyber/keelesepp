import { describe, expect, it } from 'vitest';
import { RepeatAssignmentError, isOpenAssignment, nextAttempt, openRepeats, repeatMessage } from './assignmentRepeats.js';

const sheet = (id, extra = {}) => ({ id, studentId: 's1', lessonId: 'a2-07', phase: 'practice', status: 'new', answers: {}, assignedAt: '2026-11-10T10:00:00Z', ...extra });

describe('assignmentRepeats (audit 2026-11-24, finding 05)', () => {
  it('open = not handed in, not reviewed, not the student\'s own self-study', () => {
    expect(isOpenAssignment(sheet('a'))).toBe(true);
    expect(isOpenAssignment(sheet('a', { status: 'done' }))).toBe(false);
    expect(isOpenAssignment(sheet('a', { completedAt: '2026-11-11' }))).toBe(false);
    expect(isOpenAssignment(sheet('a', { reviewStatus: 'reviewed' }))).toBe(false);
    expect(isOpenAssignment(sheet('a', { source: 'self_study' }))).toBe(false);
  });
  it('finds the student\'s open copies of the same lesson and phase, a begun one first, then the newest', () => {
    const list = [
      sheet('new', { assignedAt: '2026-11-12T10:00:00Z' }),
      sheet('begun', { assignedAt: '2026-11-01T10:00:00Z', answers: { q: 'x' } }),
      sheet('other-phase', { phase: 'discover' }),
      sheet('other-student', { studentId: 's2' }),
      sheet('done', { status: 'done' }),
    ];
    expect(openRepeats(list, { studentId: 's1', lessonId: 'a2-07', phase: 'practice' }).map((item) => item.id)).toEqual(['begun', 'new']);
    expect(openRepeats(list, { studentId: 's1', lessonId: '', phase: '' })).toEqual([]);
  });
  it('a sheet without a phase matches only copies without a phase', () => {
    const list = [sheet('plain', { phase: undefined }), sheet('phased')];
    expect(openRepeats(list, { studentId: 's1', lessonId: 'a2-07' }).map((item) => item.id)).toEqual(['plain']);
  });
  it('numbers the next try from every copy, done ones too', () => {
    expect(nextAttempt([], { studentId: 's1', lessonId: 'a2-07', phase: 'practice' })).toBe(1);
    expect(nextAttempt([sheet('a', { status: 'done' }), sheet('b')], { studentId: 's1', lessonId: 'a2-07', phase: 'practice' })).toBe(3);
    expect(nextAttempt([sheet('a', { attempt: 4 })], { studentId: 's1', lessonId: 'a2-07', phase: 'practice' })).toBe(5);
  });
  it('says who has it open, without guessing case endings', () => {
    const one = [{ studentId: 's1', studentName: 'Mari Maasik', lessonId: 'a2-07', phase: 'practice', existing: { assignedAt: '2026-11-12T10:00:00Z' } }];
    expect(repeatMessage(one)).toMatch(/^See leht on õpilasel juba pooleli: Mari Maasik \(antud 12\.11\.?\)\.$/);
    const two = [...one, { ...one[0], studentId: 's2', studentName: 'Jaan' }];
    expect(repeatMessage(two)).toBe('See leht on juba pooleli 2 õpilasel: Mari Maasik, Jaan.');
    const error = new RepeatAssignmentError(two);
    expect(error.code).toBe('assignment/repeat');
    expect(error.repeats).toHaveLength(2);
  });
});

describe('one task of a sheet given alone', () => {
  it('is not the same work as the whole sheet', () => {
    const list = [sheet('whole'), sheet('task', { block: 'b3' })];
    expect(openRepeats(list, { studentId: 's1', lessonId: 'a2-07', phase: 'practice' }).map((item) => item.id)).toEqual(['whole']);
    expect(openRepeats(list, { studentId: 's1', lessonId: 'a2-07', phase: 'practice', block: 'b3' }).map((item) => item.id)).toEqual(['task']);
  });
});
